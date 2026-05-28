const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authUserMiddleware, authMiddleware } = require('../middleware/auth.middleware');

router.post('/create/:userId', authUserMiddleware, orderController.create);
router.get('/my-order/:userId', authUserMiddleware, orderController.getMyOrders);
router.get(
    '/my-order/detail/:userId/:orderCode',
    authUserMiddleware,
    orderController.getDetail
);
router.patch(
    '/my-order/detail/cancelled/:userId',
    authUserMiddleware,
    orderController.cancelled
);

router.get('/getall', authMiddleware, orderController.getAll);
router.patch('/update-status', authMiddleware, orderController.updateStatus);

module.exports = router;
