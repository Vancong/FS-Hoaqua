
const UserDtb = require('../models/User.Model');
const bcrypt=require('bcrypt');
const JwtService=require('./JwtService');
const paginationHelper=require("../helper/pagination");
const createError=require('../helper/createError');

module.exports.createUser = async (newUser) => {
    const checkUser= await UserDtb.findOne({
        email:newUser.email
    })
    newUser.name=newUser.email;
    
    if(checkUser!==null) {
        throw createError(409,'Email đã tồn tại');
    }

    
    
    const hash= await bcrypt.hash(newUser.password, 10);
    newUser.password=hash;

    const createdUser = await UserDtb.create(newUser);
    
    const access_token=JwtService.genneralAccessToken({
        id:createdUser.id,
        isAdmin: createdUser.isAdmin,
        email:createdUser.email
    })

    const refresh_token=JwtService.genneralRefreshToken({
        id:createdUser.id,
        isAdmin: createdUser.isAdmin,
        email: createdUser.email
    })
    
    return {
        status: 'OK',
        message: 'Thành công ',
        data: createdUser,
        access_token,
        refresh_token
    };    

};


module.exports.loginUser = async (dataUser) => {

    const user= await UserDtb.findOne({email: dataUser.email})

    if (!user) {
        throw createError(404, 'Người dùng không tồn tại');
    }
    if (!user.isActive) {
      throw createError(403, 'Tài khoản đã bị khoá hoặc chưa được kích hoạt!');
    }
    const passwordInut= await bcrypt.compare(dataUser.password,user.password);

    if (!passwordInut) {
        throw createError(400,'Mật khẩu không chính xác');
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
        message: 'Thành công ',
        access_token,
        refresh_token
    };
    
};

module.exports.updateUser= async (userId,dataChange) =>{
    const checkUser= await UserDtb.findOne({
        _id: userId
    })
    
     if(!checkUser) {
        throw createError(404,'khong tồn tại tài khoản này');
    }
    if(dataChange.password) {
            dataChange.password= await bcrypt.hash(dataChange.password, 10);

    }
    
    const updateUser= await UserDtb.findByIdAndUpdate(userId,dataChange,{new:true}).select('-password')
    
    return {
        status: 'OK',
        message: 'Thành công ',
        user: updateUser,

    };
      
   
}

module.exports.deleteUser= async (userId) => {
    const checkUser= await UserDtb.findOne({
        _id: userId
    })
    if (!checkUser) {
        throw createError(404,'khong tồn tại tài khoản này');
    }

    await UserDtb.findByIdAndDelete(userId);
    return {
        status: 'OK',
        message: "Xoa user thanh cong"
    }
   
}

module.exports.deleteManyUser=async(ids) =>{
    await UserDtb.deleteMany({ _id: { $in: ids } });
    return {
        status: 'OK',
        message: "Xoa user thanh cong"
    }
}

module.exports.getAllUser= async (limit,page = 1,key,value,search='') =>{

    const sort = {};
    if (key && value){
        sort[key] = value;
    }
    else sort.name = -1;

    let query = {};
    if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
    }
    return await paginationHelper({
        model: UserDtb,
        page,
        limit,
        sort,
        query
    });
    
   
}


module.exports.getDetailUser= async (userId) =>{
    const checkUser=await UserDtb.findOne({
        _id: userId
    }).select('-password');
    if(!checkUser) {
        throw createError(404,'khong tồn tại tài khoản này');
    }
    return {
        status: 'OK',
        message: 'Thanh cong',
        data: checkUser
    }

}

module.exports.ChangePassword= async (data) =>{

    let {userId,oldPassword,newPassword,cfPassword}=data;
    const checkUser=await UserDtb.findOne({
        _id: userId
    })
    if(!checkUser) {
        throw createError(404,'khong tồn tại tài khoản này');
    }
    const checkPass= await bcrypt.compare(oldPassword,checkUser.password)

    if(!checkPass){
        throw createError(400,'Mật khẩu cũ không đúng');
    }

    if(newPassword!==cfPassword) {
         throw createError(400,'Mật khẩu xác nhận không khớp');
    }
    newPassword= await bcrypt.hash(newPassword,10);

    await UserDtb.updateOne({
        _id:userId
    },{password: newPassword})
    return {
        status: 'OK',
        message: 'Thanh cong',
    }

}
