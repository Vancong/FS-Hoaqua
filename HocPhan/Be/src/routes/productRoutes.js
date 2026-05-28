const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth.middleware');
const uploadImg = require('../middleware/uploadImg').upload('products');
const {
    validateCreateProduct,
    validateUpdateProduct,
} = require('../validate/validateProduct');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post(
    '/',
    authMiddleware,
    uploadImg.single('image'),
    validateCreateProduct,
    productController.createProduct
);

router.put(
    '/:id',
    authMiddleware,
    uploadImg.single('image'),
    validateUpdateProduct,
    productController.updateProduct
);

router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
