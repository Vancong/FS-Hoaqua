const express=require('express');
const router=express.Router();
const forgotPasswordsControllers=require("../controllers/forgot-password.controller")
const {authUserMiddleware}=require("../middleware/auth.middleware");

router.get("/sendOtp/:email",forgotPasswordsControllers.sendOtp);

router.post("/verify-otp",forgotPasswordsControllers.verifyOtp);

router.patch("/reset-password/:userId",authUserMiddleware ,forgotPasswordsControllers.resetPassword)




module.exports=router;