const CartService = require('../services/cart.service');
const asyncHandler = require('express-async-handler');

module.exports.getDetail = asyncHandler(async (req, res) => {
    const response = await CartService.getDetail(req.params.userId);
    return res.status(200).json(response);
});

module.exports.create = asyncHandler(async (req, res) => {
    const response = await CartService.create(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.decreaseQuantity = asyncHandler(async (req, res) => {
    const response = await CartService.decreaseQuantity(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.increaseQuantity = asyncHandler(async (req, res) => {
    const response = await CartService.increaseQuantity(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.updateQuantity = asyncHandler(async (req, res) => {
    const response = await CartService.updateQuantity(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.deleteProductInCart = asyncHandler(async (req, res) => {
    const response = await CartService.deleteProductInCart(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.clearCart = asyncHandler(async (req, res) => {
    const response = await CartService.clearCart(req.params.userId);
    return res.status(200).json(response);
});
