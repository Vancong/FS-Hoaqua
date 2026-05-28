const ProductService = require('../services/product.service');
const asyncHandler = require('express-async-handler');

module.exports.getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const response = await ProductService.getAllProducts(page, limit, req.query);
    return res.status(200).json(response);
});

module.exports.getProductById = asyncHandler(async (req, res) => {
    const response = await ProductService.getProductById(req.params.id);
    return res.status(200).json(response);
});

module.exports.createProduct = asyncHandler(async (req, res) => {
    const response = await ProductService.createProduct(req.body);
    return res.status(201).json(response);
});

module.exports.updateProduct = asyncHandler(async (req, res) => {
    const response = await ProductService.updateProduct(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.deleteProduct = asyncHandler(async (req, res) => {
    const response = await ProductService.deleteProduct(req.params.id);
    return res.status(200).json(response);
});
