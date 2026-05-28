const express = require('express');
const router = express.Router();
const forgotPasswordController = require('../controllers/forgot-password.controller');
const { authUserMiddleware } = require('../middleware/auth.middleware');

router.get('/sendOtp/:email', forgotPasswordController.sendOtp);
router.post('/verify-otp', forgotPasswordController.verifyOtp);
router.patch('/reset-password/:userId', authUserMiddleware, forgotPasswordController.resetPassword);

module.exports = router;
