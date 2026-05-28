const express=require('express');
const router=express.Router();
const favoriteControllers=require("../controllers/favorite.controller")
const {authUserMiddleware}=require("../middleware/auth.middleware");

router.post("/toggle/:userId",authUserMiddleware,favoriteControllers.toggle);

router.get("/getUserFavorite/:userId", authUserMiddleware,favoriteControllers.getUserFavorite)

// router.patch("/delete-product",authUserMiddleware,cartControllers.deleteProductInCart)
 
// router.get("/detail/:userId", authUserMiddleware,cartControllers.getDetail);  

// router.patch("/clear-cart/:userId",authUserMiddleware,cartControllers.clearCart)  



module.exports=router;