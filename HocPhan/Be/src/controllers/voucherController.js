const VoucherService = require('../services/voucher.service');
const asyncHandler = require('express-async-handler');

module.exports.create = asyncHandler(async (req, res) => {
    const response = await VoucherService.createVoucher(req.body);
    return res.status(200).json(response);
});

module.exports.getAll = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const search = req.query.search || '';
    const response = await VoucherService.getAllVouchers(page, limit, search);
    return res.status(200).json(response);
});

module.exports.update = asyncHandler(async (req, res) => {
    const response = await VoucherService.updateVoucher(req.params.id, req.body);
    return res.status(200).json(response);
});

module.exports.deleteVoucher = asyncHandler(async (req, res) => {
    const response = await VoucherService.deleteVoucher(req.params.id);
    return res.status(200).json(response);
});

module.exports.deleteMany = asyncHandler(async (req, res) => {
    // Frontend sends either { ids: [...] } or directly an array of ids
    const ids = req.body.ids || req.body;
    const response = await VoucherService.deleteManyVouchers(ids);
    return res.status(200).json(response);
});

module.exports.check = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body;
    const userId = req.params.userId;
    const response = await VoucherService.checkVoucher(code, userId, cartTotal);
    return res.status(200).json(response);
});
