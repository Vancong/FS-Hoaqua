const express=require('express');
const router=express.Router();
const statsControllers=require('../controllers/stats.controllers');
const {authMiddleware}=require("../middleware/auth.middleware");


router.get("/revenue",authMiddleware, statsControllers.revenue);  

module.exports=router;