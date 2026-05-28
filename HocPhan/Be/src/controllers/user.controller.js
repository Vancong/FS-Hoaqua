const userService=require('../services/user.Service');
const JwtService=require("../services/JwtService");
const asyncHandler =require('express-async-handler')
const createErro=require("../helper/createError");

const isProduction = process.env.NODE_ENV === "production";


module.exports.index= (req,res) => {
    console.log('ok');
}

module.exports.createUser=asyncHandler(async (req,res) =>{

    const user=await userService.createUser(req.body); 
    const {refresh_token,...newUser}=user;

    res.cookie('refresh_token',refresh_token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 365 * 24 * 60 * 60 * 1000 
    })
    
    return res.status(200).json(newUser);

})

module.exports.loginUser= asyncHandler( async (req,res) =>{

    const user=await userService.loginUser(req.body); 
    const {refresh_token,...newUser}=user;

    res.cookie('refresh_token',refresh_token,{
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: 365 * 24 * 60 * 60 * 1000 
    })
    return res.status(200).json(newUser);
  
})

module.exports.logoutUser=asyncHandler( async (req,res) =>{

    res.clearCookie('refresh_token');
    return res.status(200).json({
        status: 'OK',
        message: 'Đăng xuất thành công'
    })
   
})

module.exports.updateUser=asyncHandler( async (req,res) =>{

    const userId=req.params.userId;
    const data=req.body;
    if(req.file){
        data.avt=req.file.path;
    }

    const dataChange= await userService.updateUser(userId,data);
    return res.status(200).json(dataChange)

  
})


module.exports.deleteUser=asyncHandler (async (req,res) =>{
    const userId=req.params.id;
    const response= await userService.deleteUser(userId);
    return res.status(200).json(response);
  
})

module.exports.deleteManyUser=asyncHandler(async (req,res) =>{
    const ids=req.body; 
    const response= await userService.deleteManyUser(ids);
    return res.status(200).json(response);
        
})
module.exports.getAllUser=asyncHandler(async (req,res) =>{

    const page=parseInt(req.query.page);
    const limit=parseInt(req.query.limit)
    const {key,value,search}=req.query;
    const response=await userService.getAllUser(limit,page,key,value,search);
    return res.status(200).json(response);
  
})

module.exports.getDetailUser=asyncHandler(async (req,res) =>{
        const userId=req.params.id;
        const response=await userService.getDetailUser(userId);
        return res.status(200).json(response); 
})

module.exports.refreshToken= asyncHandler (async (req,res) =>{
        const token=req.cookies.refresh_token;
        if(!token) {
           throw createErro(401, 'Thiếu refresh token');
        }
        const response=await JwtService.refreshTokenJwtServices(token);
        
        if(response.status === 'OK' && response.refresh_token) {
            res.cookie('refresh_token', response.refresh_token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "None" : "Lax",
                maxAge: 365 * 24 * 60 * 60 * 1000 
            });
        }
        
        return res.status(200).json(response);
    
})

module.exports.ChangePassword= asyncHandler (async (req,res) =>{
        const response=await userService.ChangePassword(req.body);
        return res.status(200).json(response);
    
})