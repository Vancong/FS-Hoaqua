const express=require('express');
const router=express.Router();
const orderControllers=require('../controllers/order.controllers');
const {validateOrder }=require("../validate/ValidateOrderAndCart");
const {authUserMiddleware,authMiddleware}=require("../middleware/auth.middleware")




router.post("/create/:userId",authUserMiddleware,validateOrder,orderControllers.create);

router.get("/my-order/:userId",authUserMiddleware,orderControllers.myOrder);

router.get("/my-order/detail/:userId/:orderCode",authUserMiddleware,orderControllers.myOrderDetail);

router.patch("/my-order/detail/cancelled/:userId",authUserMiddleware,orderControllers.cancelled);


router.get("/getall",authMiddleware,orderControllers.getAll);  

router.patch("/update-status",authMiddleware,orderControllers.updateStatus);
 

  

// router.get("/get-all", noteControllers.getAll);  

module.exports=router;