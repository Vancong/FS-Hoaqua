const CartService = require('../services/cart.service');
const asyncHandler = require('express-async-handler');

module.exports.getDetail = asyncHandler(async (req, res) => {
    const response = await CartService.getDetail(req.params.id);
    return res.status(200).json(response);
});

module.exports.create = asyncHandler(async (req, res) => {
    const response = await CartService.create(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.decreaseQuantity = asyncHandler(async (req, res) => {
    const response = await CartService.decreaseQuantity(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.increaseQuantity = asyncHandler(async (req, res) => {
    const response = await CartService.increaseQuantity(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.deleteProductInCart = asyncHandler(async (req, res) => {
    const response = await CartService.deleteProductInCart(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.clearCart = asyncHandler(async (req, res) => {
    const response = await CartService.clearCart(req.params.id);
    return res.status(200).json(response);
});
