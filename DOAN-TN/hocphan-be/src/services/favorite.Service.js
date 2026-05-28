const FavoriteDtb=require('../models/Favorite.Model');
const UserDtb=require("../models/User.Model");
const ProductDtb=require("../models/Product.Model")
const createError=require("../helper/createError");
module.exports.toggle= async(data) =>{

    const { userId, productId } = data;
    const product = await ProductDtb.findById(productId);
    if (!product) {
            throw createError(404,'Khong ton tai san pham');
    }

    const user = await UserDtb.findById(userId);
    if (!user) {
        throw createError(404,'Khong ton tai nguoi dung ');
    }

    const checkFavorite= await FavoriteDtb.findOne({
        user: userId,
        product: productId
    })

    if(checkFavorite) {
        await FavoriteDtb.deleteOne({
            user:userId,
            product: productId
        })
        return {
            status: 'OK',
            message: 'xoa yeu thich thanh cong',
            isFavorite: false
        };

    }

    const newFavorite = new FavoriteDtb({
        user: userId,
        product: productId
    });

    await newFavorite.save()       
    return {
        status: 'OK',
        message: 'Them san pham yeu thich thanh cong',
        isFavorite: true
    };

}

module.exports.getUserFavorite=async (userId) =>{

    const checkFavorite = await FavoriteDtb.find({
        user: userId
    }).populate('product','name images sizes selled slug')
   
    const productIds=checkFavorite.map(fa => fa.product)
    return {
        status: 'OK',
        data: productIds||[],
        total: productIds?.length||0
    }

}
