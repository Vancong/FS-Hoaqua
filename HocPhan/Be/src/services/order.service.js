const Order = require('../models/Order.Model');
const Product = require('../models/Product.Model');
const Cart = require('../models/Cart.Model');
const User = require('../models/User.Model');
const createError = require('../helper/createError');
const paginationHelper = require('../helper/pagination');
const { sendOrderInvoiceEmail } = require('./order-email.service');

const generateOrderCode = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DH${ts}${rand}`;
};

const getStockKg = (product) => Number(product.stock) || 0;

const deductStock = async (product, quantityKg) => {
    if ((product.stock ?? 0) < quantityKg) {
        throw createError(400, `Sản phẩm ${product.name} không đủ tồn kho (còn ${product.stock} kg)`);
    }
    product.stock -= quantityKg;
    product.sold = (product.sold || 0) + quantityKg;
    await product.save();
};

const restoreStock = async (product, quantityKg) => {
    product.stock = (product.stock || 0) + quantityKg;
    product.sold = Math.max(0, (product.sold || 0) - quantityKg);
    await product.save();
};

module.exports.createOrder = async (userId, body) => {
    const {
        name,
        phone,
        email,
        note,
        address,
        items,
        totalPrice,
        shipping,
        discountCode,
        discountValue,
        finalPrice,
        paymentMethod,
        isPaid,
        status: bodyStatus,
        paidAt,
        paypalOrderId,
    } = body;

    if (!items?.length) {
        throw createError(400, 'Giỏ hàng trống');
    }

    const method = paymentMethod || 'cod';
    if (!['cod', 'vnpay', 'paypal'].includes(method)) {
        throw createError(400, 'Phương thức thanh toán không hợp lệ');
    }

    const orderItems = [];
    const productsToUpdate = [];

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            throw createError(404, 'Sản phẩm không tồn tại');
        }
        const qtyKg = Number(item.quantity);
        const stock = getStockKg(product);
        if (stock < qtyKg) {
            throw createError(400, `Sản phẩm ${product.name} chỉ còn ${stock} kg trong kho`);
        }
        productsToUpdate.push({ product, quantity: qtyKg });
        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.image,
            quantity: qtyKg,
            price: item.price,
        });
    }

    let orderStatus = 'pending';
    let paid = false;

    if (method === 'cod') {
        orderStatus = 'pending';
        paid = false;
    } else if (method === 'vnpay') {
        orderStatus = 'awaiting_payment';
        paid = false;
    } else if (method === 'paypal' && isPaid) {
        orderStatus = bodyStatus || 'confirmed';
        paid = true;
    }

    const orderCode = generateOrderCode();
    const account = await User.findById(userId).select('email');
    const invoiceEmail = account?.email || email || '';

    try {
        if (method !== 'vnpay') {
            for (const { product, quantity } of productsToUpdate) {
                await deductStock(product, quantity);
            }
        }

        const order = await Order.create({
            orderCode,
            user: userId,
            name,
            phone,
            email: invoiceEmail,
            note: note || '',
            address: address || {},
            items: orderItems,
            totalPrice,
            shipping: shipping || 0,
            discountCode: discountCode || null,
            discountValue: discountValue || 0,
            finalPrice,
            paymentMethod: method,
            status: orderStatus,
            isPaid: paid,
            paidAt: paid ? paidAt || new Date() : undefined,
            paypalOrderId: paypalOrderId || undefined,
        });

        if (discountCode) {
            try {
                const Voucher = require('../models/Voucher.Model');
                const voucher = await Voucher.findOne({ code: discountCode.toUpperCase() });
                if (voucher) {
                    voucher.usageCount += 1;
                    const userUsageIdx = voucher.usedBy.findIndex(u => u.userId.toString() === userId.toString());
                    if (userUsageIdx > -1) {
                        voucher.usedBy[userUsageIdx].count += 1;
                    } else {
                        voucher.usedBy.push({ userId, count: 1 });
                    }
                    await voucher.save();
                }
            } catch (vErr) {
                console.warn('Lỗi cập nhật lượt sử dụng mã giảm giá:', vErr.message);
            }
        }

        if (method === 'cod' || paid) {
            sendOrderInvoiceEmail(order, invoiceEmail);
        }

        return {
            status: 'OK',
            message: 'Đặt hàng thành công',
            data: {
                orderCode: order.orderCode,
                finalPrice: order.finalPrice,
                isPaid: order.isPaid,
                paymentMethod: order.paymentMethod,
                _id: order._id,
            },
        };
    } catch (err) {
        throw err;
    }
};

module.exports.getMyOrders = async (userId, page = 1, limit = 10, status) => {
    const query = { user: userId };
    if (status) query.status = status;

    return paginationHelper({
        model: Order,
        page,
        limit,
        sort: { createdAt: -1 },
        query,
        populate: { path: 'items.product', select: 'name image' },
    });
};

module.exports.getOrderDetail = async (userId, orderCode) => {
    const order = await Order.findOne({ user: userId, orderCode }).populate({
        path: 'items.product',
        select: 'name image images',
    });
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại');
    }
    return { status: 'OK', message: 'Thành công', data: order };
};

module.exports.getOrderByCode = async (orderCode) => {
    const order = await Order.findOne({ orderCode });
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại');
    }
    return order;
};

module.exports.markOrderPaid = async (orderCode, vnpayTransactionNo) => {
    const order = await Order.findOne({ orderCode });
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại');
    }
    if (order.isPaid) {
        return order;
    }

    if (order.paymentMethod === 'vnpay') {
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;
            const stock = getStockKg(product);
            if (stock < item.quantity) {
                throw createError(400, `Sản phẩm ${product.name} không đủ tồn kho`);
            }
            await deductStock(product, item.quantity);
        }
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'confirmed';
    if (vnpayTransactionNo) {
        order.vnpayTransactionNo = vnpayTransactionNo;
    }
    await order.save();

    if (order.paymentMethod === 'vnpay') {
        sendOrderInvoiceEmail(order, order.email);
    }

    return order;
};

/** VNPay thất bại / user quay lại — giữ đơn ở trạng thái chờ thanh toán để thanh toán lại */
module.exports.markVnpayAwaitingPayment = async (orderCode) => {
    const order = await Order.findOne({
        orderCode,
        paymentMethod: 'vnpay',
        isPaid: false,
        status: { $nin: ['cancelled', 'confirmed', 'shipping', 'delivered'] },
    });
    if (!order) return null;
    if (order.status !== 'awaiting_payment') {
        order.status = 'awaiting_payment';
        await order.save();
    }
    return order;
};

/** @deprecated dùng markVnpayAwaitingPayment */
module.exports.cancelUnpaidVnpayOrder = module.exports.markVnpayAwaitingPayment;

module.exports.cancelOrder = async (userId, data) => {
    const { orderCode } = data;
    const order = await Order.findOne({ user: userId, orderCode });
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại');
    }
    if (['delivered', 'cancelled'].includes(order.status)) {
        throw createError(400, 'Không thể hủy đơn hàng này');
    }

    const shouldRestoreStock = order.paymentMethod === 'cod' || order.isPaid;
    if (shouldRestoreStock) {
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                await restoreStock(product, item.quantity);
            }
        }
    }

    const nextStatus = data.status === 'refund_pending' && order.isPaid ? 'refund_pending' : 'cancelled';
    order.status = nextStatus;
    await order.save();
    return { status: 'OK', message: 'Hủy đơn hàng thành công', data: order };
};

module.exports.getAllOrders = async (page, limit, search, filters = {}) => {
    const query = {};
    const { status, startDate, endDate, paymentMethod } = filters;

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (search?.trim()) {
        query.$or = [
            { orderCode: { $regex: search.trim(), $options: 'i' } },
            { name: { $regex: search.trim(), $options: 'i' } },
            { phone: { $regex: search.trim(), $options: 'i' } },
        ];
    }
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(`${endDate}T23:59:59.999`);
    }

    return paginationHelper({
        model: Order,
        page,
        limit,
        sort: { createdAt: -1 },
        query,
        populate: [
            { path: 'user', select: 'name email phone' },
            { path: 'items.product', select: 'name image images' },
        ],
    });
};

const ALLOWED_STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    awaiting_payment: ['cancelled'],
    confirmed: ['shipping', 'cancelled'],
    shipping: ['delivered'],
    delivered: [],
    cancelled: [],
};

module.exports.updateOrderStatus = async (data) => {
    const { orderCode, status } = data;
    const order = await Order.findOne({ orderCode });
    if (!order) {
        throw createError(404, 'Đơn hàng không tồn tại');
    }

    const allowedNext = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
        throw createError(400, 'Không thể cập nhật trạng thái đơn hàng này');
    }

    if (status === 'confirmed' && order.paymentMethod === 'vnpay' && !order.isPaid) {
        throw createError(400, 'Đơn VNPay chưa thanh toán, không thể xác nhận');
    }

    if (status === 'cancelled') {
        const shouldRestoreStock = order.paymentMethod === 'cod' || order.isPaid;
        if (shouldRestoreStock) {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                    await restoreStock(product, item.quantity);
                }
            }
        }
    }

    order.status = status;
    await order.save();
    return { status: 'OK', message: 'Cập nhật trạng thái thành công', data: order };
};
