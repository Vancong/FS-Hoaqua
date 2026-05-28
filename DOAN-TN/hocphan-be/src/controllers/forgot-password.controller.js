
const forgotPassWordService=require('../services/forgot-password.service');
const asyncHandler =require('express-async-handler')

module.exports.sendOtp=asyncHandler(async(req,res)=>{
    const email=req.params.email;
    const response=await forgotPassWordService.sendOtp(email);
    return res.status(200).json(response);
})

module.exports.verifyOtp=asyncHandler(async(req,res)=>{
    const {otp,email}=req.body;
    const response= await forgotPassWordService.verifyOtp(otp,email);
    const {refresh_token}=response;

    return res.status(200).json(response)
})

module.exports.resetPassword=asyncHandler(async(req,res)=>{
    const {userId,password}=req.body;
    const response=await forgotPassWordService.resetPassword(userId,password);
    res.status(200).json(response);
    
})