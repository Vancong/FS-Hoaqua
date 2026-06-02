const asyncHandler = require('express-async-handler');
const VnpayService = require('../services/vnpay.service');
const OrderService = require('../services/order.service');
const CartService = require('../services/cart.service');
const createError = require('../helper/createError');

module.exports.getConfig = asyncHandler(async (req, res) => {
    return res.status(200).json({
        status: 'OK',
        data: process.env.CLIENT_ID || '',
    });
});

module.exports.createVnpayUrl = asyncHandler(async (req, res) => {
    const { orderCode } = req.body;
    if (!orderCode) {
        throw createError(400, 'Thiếu mã đơn hàng');
    }

    const order = await OrderService.getOrderByCode(orderCode);
    if (String(order.user) !== String(req.params.userId)) {
        throw createError(403, 'Không có quyền thanh toán đơn hàng này');
    }
    if (order.paymentMethod !== 'vnpay') {
        throw createError(400, 'Đơn hàng không dùng VNPay');
    }
    if (order.isPaid) {
        throw createError(400, 'Đơn hàng đã thanh toán');
    }

    const ipAddr =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

    const paymentUrl = VnpayService.createPaymentUrl({
        orderCode: order.orderCode,
        amount: order.finalPrice,
        orderInfo: `Thanh toan don hang ${order.orderCode}`,
        ipAddr,
    });

    return res.status(200).json({
        status: 'OK',
        message: 'Tạo link thanh toán thành công',
        data: { paymentUrl },
    });
});

const markOrderAwaitingPayment = async (orderCode) => {
    if (!orderCode) return null;
    return OrderService.markVnpayAwaitingPayment(orderCode);
};

const normalizeFrontendUrl = (url) => {
    const trimmed = String(url || 'http://localhost:3000').trim();
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed.replace(/\/+$/, '');
    }
    return `https://${trimmed.replace(/^\/+/, '').replace(/\/+$/, '')}`;
};

const redirectPaymentFailed = (res, frontendUrl, orderCode, message) => {
    const safeMessage = encodeURIComponent(message || 'Thanh toán thất bại');
    if (orderCode) {
        return res.redirect(
            `${frontendUrl}/my-order/detail/${orderCode}?payment=failed&message=${safeMessage}`
        );
    }
    return res.redirect(`${frontendUrl}/my-order?payment=failed&message=${safeMessage}`);
};

module.exports.vnpayReturn = asyncHandler(async (req, res) => {
    const frontendUrl = normalizeFrontendUrl(process.env.FRONTEND_URL);
    const result = VnpayService.verifyReturnParams(req.query);

    if (!result.isValid) {
        await markOrderAwaitingPayment(req.query.vnp_TxnRef);
        return redirectPaymentFailed(res, frontendUrl, req.query.vnp_TxnRef, result.message);
    }

    if (result.isSuccess) {
        try {
            await OrderService.markOrderPaid(result.orderCode, result.transactionNo);
            const order = await OrderService.getOrderByCode(result.orderCode);
            await CartService.clearCart(order.user);
            return res.redirect(
                `${frontendUrl}/order-success?orderCode=${order.orderCode}&finalPrice=${order.finalPrice}&isPaid=true`
            );
        } catch (err) {
            await markOrderAwaitingPayment(result.orderCode);
            return redirectPaymentFailed(
                res,
                frontendUrl,
                result.orderCode,
                err.message || 'Lỗi xác nhận thanh toán'
            );
        }
    }

    await markOrderAwaitingPayment(result.orderCode);
    return redirectPaymentFailed(res, frontendUrl, result.orderCode, result.message);
});

module.exports.vnpayIpn = asyncHandler(async (req, res) => {
    const result = VnpayService.verifyReturnParams(req.query);

    if (!result.isValid) {
        return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    if (result.isSuccess) {
        try {
            await OrderService.markOrderPaid(result.orderCode, result.transactionNo);
            const order = await OrderService.getOrderByCode(result.orderCode);
            await CartService.clearCart(order.user);
            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } catch (err) {
            return res.status(200).json({ RspCode: '99', Message: err.message });
        }
    }

    await markOrderAwaitingPayment(result.orderCode);
    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
});
