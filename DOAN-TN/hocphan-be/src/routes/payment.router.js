const express=require('express');
const router=express.Router();
const {authMiddleware, authUserMiddleware}=require("../middleware/auth.middleware");
const dotenv=require('dotenv');


dotenv.config()


router.get("/config",(req,res)=>{
    res.status(200).json({
        status: 'OK',
        data: process.env.CLIENT_ID
    })
});




module.exports=router;