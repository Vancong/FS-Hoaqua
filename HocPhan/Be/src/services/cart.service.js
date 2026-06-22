const Cart = require('../models/Cart.Model');
const Product = require('../models/Product.Model');
const createError = require('../helper/createError');

const getCartDetail = async (userId) => {
    let cart = await Cart.findOne({ userId }).populate({
        path: 'items.product',
        select: 'name image images price stock discount',
    });
    if (!cart) {
        return {
            status: 'OK',
            message: 'Thành công',
            data: [],
            total: 0,
        };
    }

    const mappedItems = cart.items.map((item) => {
        const itemObj = item.toObject();
        if (itemObj.product && !itemObj.product.images) {
            itemObj.product.images = [itemObj.product.image || ''];
        }
        return itemObj;
    });

    const total = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
        status: 'OK',
        message: 'Thành công',
        data: mappedItems,
        total,
    };
};

module.exports.getDetail = async (userId) => {
    return await getCartDetail(userId);
};

module.exports.create = async (userId, data) => {
    const { productId, price, quantity } = data;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    const qtyToAdd = Number(quantity);
    if (itemIndex > -1) {
        const nextQty = cart.items[itemIndex].quantity + qtyToAdd;
        if (nextQty > product.stock) {
            throw createError(400, `Sản phẩm ${product.name} chỉ còn ${product.stock} kg trong kho`);
        }
        cart.items[itemIndex].quantity = nextQty;
    } else {
        if (qtyToAdd > product.stock) {
            throw createError(400, `Sản phẩm ${product.name} chỉ còn ${product.stock} kg trong kho`);
        }
        cart.items.push({
            product: productId,
            price: Number(price),
            quantity: qtyToAdd,
        });
    }

    await cart.save();
    return await getCartDetail(userId);
};

module.exports.decreaseQuantity = async (userId, data) => {
    const { productId } = data;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        return { status: 'ERR', message: 'Giỏ hàng không tồn tại' };
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Math.max(
            0.1,
            cart.items[itemIndex].quantity - 1
        );
        if (cart.items[itemIndex].quantity <= 0.1) {
            cart.items.splice(itemIndex, 1);
        }
        await cart.save();
    }

    return await getCartDetail(userId);
};

module.exports.increaseQuantity = async (userId, data) => {
    const { productId } = data;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        throw createError(404, 'Giỏ hàng không tồn tại');
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        const nextQty = cart.items[itemIndex].quantity + 1;
        if (nextQty > product.stock) {
            throw createError(400, `Sản phẩm ${product.name} chỉ còn ${product.stock} kg trong kho`);
        }
        cart.items[itemIndex].quantity = nextQty;
        await cart.save();
    }

    return await getCartDetail(userId);
};

module.exports.updateQuantity = async (userId, data) => {
    const { productId, quantity } = data;
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
        throw createError(400, 'Số lượng phải là số lớn hơn 0');
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        throw createError(404, 'Giỏ hàng không tồn tại');
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw createError(404, 'Sản phẩm không tồn tại');
    }

    if (qty > product.stock) {
        throw createError(400, `Sản phẩm ${product.name} chỉ còn ${product.stock} kg trong kho`);
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = qty;
        await cart.save();
    }

    return await getCartDetail(userId);
};

module.exports.deleteProductInCart = async (userId, data) => {
    const { productId } = data;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        return { status: 'ERR', message: 'Giỏ hàng không tồn tại' };
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();
    return await getCartDetail(userId);
};

module.exports.clearCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return {
        status: 'OK',
        message: 'Xóa giỏ hàng thành công',
        data: [],
        total: 0,
    };
};

/** Khôi phục giỏ hàng từ đơn VNPay thất bại (merge, không xóa sản phẩm đang có) */
module.exports.restoreFromOrder = async (userId, orderItems = []) => {
    if (!orderItems.length) {
        return await getCartDetail(userId);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }

    for (const item of orderItems) {
        const productId = item.product?._id || item.product;
        if (!productId) continue;

        const itemIndex = cart.items.findIndex(
            (cartItem) => cartItem.product.toString() === productId.toString()
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = Math.max(
                cart.items[itemIndex].quantity,
                item.quantity
            );
        } else {
            cart.items.push({
                product: productId,
                price: item.price,
                quantity: item.quantity,
            });
        }
    }

    await cart.save();
    return await getCartDetail(userId);
};
