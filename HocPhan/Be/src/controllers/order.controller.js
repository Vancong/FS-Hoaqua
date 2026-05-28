const asyncHandler = require('express-async-handler');
const OrderService = require('../services/order.service');

module.exports.create = asyncHandler(async (req, res) => {
    const response = await OrderService.createOrder(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.getMyOrders = asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const response = await OrderService.getMyOrders(
        req.params.userId,
        page,
        limit,
        status
    );
    return res.status(200).json(response);
});

module.exports.getDetail = asyncHandler(async (req, res) => {
    const response = await OrderService.getOrderDetail(
        req.params.userId,
        req.params.orderCode
    );
    return res.status(200).json(response);
});

module.exports.cancelled = asyncHandler(async (req, res) => {
    const response = await OrderService.cancelOrder(req.params.userId, req.body);
    return res.status(200).json(response);
});

module.exports.getAll = asyncHandler(async (req, res) => {
    const { page, limit, search, status, startDate, endDate, paymentMethod } = req.query;
    const response = await OrderService.getAllOrders(page, limit, search, {
        status,
        startDate,
        endDate,
        paymentMethod,
    });
    return res.status(200).json(response);
});

module.exports.updateStatus = asyncHandler(async (req, res) => {
    const response = await OrderService.updateOrderStatus(req.body);
    return res.status(200).json(response);
});
