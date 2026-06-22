const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authUserMiddleware } = require('../middleware/auth.middleware');

router.post('/create/:userId', authUserMiddleware, cartController.create);
router.get('/detail/:userId', authUserMiddleware, cartController.getDetail);
router.patch('/decrease/:userId', authUserMiddleware, cartController.decreaseQuantity);
router.patch('/increase/:userId', authUserMiddleware, cartController.increaseQuantity);
router.patch('/update-quantity/:userId', authUserMiddleware, cartController.updateQuantity);
router.patch('/delete-product/:userId', authUserMiddleware, cartController.deleteProductInCart);
router.patch('/clear-cart/:userId', authUserMiddleware, cartController.clearCart);

module.exports = router;
