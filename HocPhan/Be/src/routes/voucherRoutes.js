const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authMiddleware, authUserMiddleware } = require('../middleware/auth.middleware');

router.post('/create', authMiddleware, voucherController.create);
router.get('/getAll/:userId', authUserMiddleware, voucherController.getAll);
router.patch('/update/:id', authMiddleware, voucherController.update);
router.delete('/delete/:id', authMiddleware, voucherController.deleteVoucher);
router.post('/delete-many', authMiddleware, voucherController.deleteMany);
router.post('/check/:userId', authUserMiddleware, voucherController.check);

module.exports = router;
