const express=require('express');
const router=express.Router();
const brandControllers=require('../controllers/brand.controller');
const {authMiddleware, authUserMiddleware}=require("../middleware/auth.middleware");
const {validateBrand}=require("../validate/validateAll");

const uploadImg = require("../middleware/uploadImg").upload("brands");


router.post("/create",authMiddleware,uploadImg.single('logo'),
            validateBrand,brandControllers.createBrand);

router.put("/update/:id",authMiddleware,uploadImg.single('logo'),validateBrand,
            brandControllers.updateBrand);  


router.get("/detail/:id",brandControllers.getDetail);  


router.delete("/delete/:id",authMiddleware, brandControllers.deleteBrand);  

router.post("/delete-many",authMiddleware, brandControllers.deleteManyBrand);  

router.get("/get-all", brandControllers.getAll);  

module.exports=router;