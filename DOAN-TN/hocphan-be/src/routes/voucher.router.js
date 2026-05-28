const express=require('express');
const router=express.Router();
const voucherControllers=require('../controllers/voucher.controllers');
const {authMiddleware, authUserMiddleware}=require("../middleware/auth.middleware");
const {validateVoucher}=require("../validate/ValidateVoucher")



router.post("/create",authMiddleware,validateVoucher,voucherControllers.create);

router.get("/getAll/:userId",authUserMiddleware,voucherControllers.getAll);  

router.patch("/update/:id",authMiddleware,validateVoucher, voucherControllers.update);  


router.delete("/delete/:id",authMiddleware, voucherControllers.delete);  

router.post("/delete-many",authMiddleware,voucherControllers.deleteMany)

router.post("/check/:userId",authUserMiddleware,voucherControllers.check)

module.exports=router;