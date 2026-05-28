const ForgotPassDtb=require('../models/forgot-password.models');
const userDtb=require('../models/User.Model');
const createError=require('../helper/createError');
const generateOtp=require('../helper/generateOtp.helpers');
const JwtService=require('./JwtService');
const bcrypt=require('bcrypt');
const sendMailHelpers=require('../helper/sendEmail.helpers');
const htmlOtp=require('../helper/htmlSendMailOtp');

module.exports.sendOtp=async(email) =>{
    const user= await userDtb.findOne({
        email: email,
        isActive:true
    })
    if(!user) {
        throw createError(400,'Email không hợp lệ')
    }
    const otp=generateOtp(4);
    const data= {
        email,
        otp,
        expireAt: new Date(Date.now() + 5 * 60 * 1000)
    }
    const checkOtp=await ForgotPassDtb.findOne({
        email
    })

    const now = new Date();
    const twoMinutes = 2 * 60 * 1000;
    if(checkOtp&&checkOtp.expireAt) {
        const timeLeft = new Date(checkOtp.expireAt) - now;
        if(timeLeft>0 && timeLeft>=twoMinutes) {
             const htmlSendMailOtp= htmlOtp(checkOtp.otp,'Mã xác thực','');
             sendMailHelpers(email,'Mã xác thực',htmlSendMailOtp);
        }
    }
    else{
        const htmlSendMailOtp= htmlOtp(otp,'Mã xác thực','');
        sendMailHelpers(email,'Mã xác thực',htmlSendMailOtp);
        const newOtp= new ForgotPassDtb(data)
        await newOtp.save()
    }
    
    
    return {
        status: 'OK'
    }
    
}

module.exports.verifyOtp=async(otp,email) =>{

    const user= await userDtb.findOne({
        email: email,
        isActive:true
    })

    if(!user) {
        throw(400,'Email không hợp lệ')
    }

    const checkOtp= await ForgotPassDtb.findOne({
        email,
        otp
    })


    if(!checkOtp) {
        throw createError(404,'Mã xác thực không hợp lệ')
    }


    const access_token=JwtService.genneralAccessToken({
        id:user.id,
        isAdmin: user.isAdmin,
        email:user.email
    })

    const refresh_token=JwtService.genneralRefreshToken({
        id:user.id,
        isAdmin: user.isAdmin,
        email: user.email
    })

    return {
        status: 'OK',
        access_token,
        refresh_token,
        userId:user._id
    }

}

module.exports.resetPassword=async(userId,password) =>{
    const user= await userDtb.findOne({
        _id: userId,
        isActive:true
    })

    if(!user) {
        throw createError(400,'Khong ton tai user')
    }
    console.log(password )
    const hash= await bcrypt.hash(password, 10);
    const newPassword=hash;
 
    await userDtb.updateOne({
        _id: userId
    },{
        password:newPassword
    })
    
    return {
        status: 'OK',
        data:{
            email:user.email,
            password
        }
    }
}