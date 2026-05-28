const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authUserMiddleware } = require('../middleware/auth.middleware');

router.get('/config', paymentController.getConfig);
router.get('/vnpay/return', paymentController.vnpayReturn);
router.get('/vnpay/ipn', paymentController.vnpayIpn);
router.post('/vnpay/create-url/:userId', authUserMiddleware, paymentController.createVnpayUrl);

module.exports = router;
