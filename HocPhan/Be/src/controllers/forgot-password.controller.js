const forgotPassWordService = require('../services/forgot-password.service');
const asyncHandler = require('express-async-handler');

module.exports.sendOtp = asyncHandler(async (req, res) => {
    const email = decodeURIComponent(req.params.email || '').trim();
    const response = await forgotPassWordService.sendOtp(email);
    return res.status(200).json(response);
});

module.exports.verifyOtp = asyncHandler(async (req, res) => {
    const { otp, email } = req.body;
    const response = await forgotPassWordService.verifyOtp(otp, email);
    return res.status(200).json(response);
});

module.exports.resetPassword = asyncHandler(async (req, res) => {
    const { userId, password } = req.body;
    const response = await forgotPassWordService.resetPassword(userId, password);
    return res.status(200).json(response);
});
