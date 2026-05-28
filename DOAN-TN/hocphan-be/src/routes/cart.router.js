const express=require('express');
const router=express.Router();
const cartControllers=require('../controllers/cart.controllers')
const {authUserMiddleware}=require("../middleware/auth.middleware");

router.post("/create/:userId",authUserMiddleware,cartControllers.create);


router.patch("/increase/:userId",authUserMiddleware,cartControllers.increaseQuantity)

router.patch("/decrease/:userId",authUserMiddleware,cartControllers.decreaseQuantity);

router.patch("/delete-product/:userId",authUserMiddleware,cartControllers.deleteProductInCart)
 
router.get("/detail/:userId", authUserMiddleware,cartControllers.getDetail);  

router.patch("/clear-cart/:userId",authUserMiddleware,cartControllers.clearCart)  



module.exports=router;