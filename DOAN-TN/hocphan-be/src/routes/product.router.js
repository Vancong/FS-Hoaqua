const express=require('express');
const router=express.Router();
const productControllers=require('../controllers/product.controller');
const {authMiddleware, authUserMiddleware}=require("../middleware/auth.middleware");
const {validateProduct} =require('../validate/validateAll');
const {validateImgs}=require("../validate/validateImg");

const uploadImg = require("../middleware/uploadImg").upload("products");


router.post("/create",authMiddleware,uploadImg.array('images',5),validateImgs,
            validateProduct,productControllers.createProduct);

router.put("/update/:id",authMiddleware,uploadImg.array('images',5),validateImgs,
            validateProduct,productControllers.updateProduct);  
// authMiddleware

router.get("/detail/:param",productControllers.detailProduct);  


router.delete("/delete/:id",authMiddleware, productControllers.deleteProduct);  

router.post("/delete-many",authMiddleware, productControllers.deleteManyProduct);  

router.get("/get-all", productControllers.getAllProduct);  

module.exports=router;