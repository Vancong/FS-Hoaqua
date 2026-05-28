const BrandDtb= require("../models/Brand.Model");
const paginationHelper=require("../helper/pagination.js");
const createErro=require("../helper/createError.js")
module.exports.createBrand = async (newBrand) => {

    const createBrand = await BrandDtb.create(newBrand);
    return {
        status: 'OK',
        message: 'Thành công ',
        data: createBrand
    };
};

module.exports.getDetail= async (id) =>{
    const checkBrand=await BrandDtb.findOne({
        _id: id
    });
    if(!checkBrand) {
        throw createErro(404,"Brand khong ton tai")
    }
    return {
        status: 'OK',
        message: 'Thanh cong',
        data: checkBrand
    }
   
}


module.exports.getAllBrand= async (limit,page = 1,key,value,search='',isAdmin) =>{


    const sort = {};
    if (key && value){
        sort[key] = value;
    }
    else sort.name = 'asc';

    let query = {}; 
    
    const checkIsAdmin=isAdmin==='true';
    if(!checkIsAdmin) {
        query.isActive=true;
    }
    if (search && search.trim() !== '') {
        query.name = { $regex: search.trim(), $options: 'i' };

    }

    return await paginationHelper({
        model: BrandDtb,
        page,
        limit,
        sort,
        query
    });
 
}

module.exports.update= async (brandId,dataChange) =>{

    const updateBrand= await BrandDtb.findByIdAndUpdate(brandId,dataChange,{new:true});
    if(!updateBrand) {
         throw createErro(404,"Brand khong ton tai")
    }
    return {
        status: 'OK',
        message: 'Thành công ',
        data: updateBrand
    };
}

module.exports.deleteBrand= async (brandId) => {
    const checkBrand= await BrandDtb.findOne({
        _id: brandId
    })
    if (!checkBrand) {
            throw createErro(404,"Brand khong ton tai")
    }
    
    // Kiểm tra xem còn product nào sử dụng brand này không
    const ProductDtb = require('../models/Product.Model');
    const productsWithBrand = await ProductDtb.countDocuments({ brand: brandId });
    
    if (productsWithBrand > 0) {
        // Nếu còn product, set brand = null cho các product đó
        await ProductDtb.updateMany(
            { brand: brandId },
            { $set: { brand: null } }
        );
    }
    
    await BrandDtb.findByIdAndDelete(brandId);
    return {
        status: 'OK',
        message: "Xoa brand thanh cong"
    }

}

module.exports.deleteManyBrand=async(ids) =>{

    // Set brand = null cho các product đang sử dụng brand này
    const ProductDtb = require('../models/Product.Model');
    await ProductDtb.updateMany(
        { brand: { $in: ids } },
        { $set: { brand: null } }
    );
    
    await BrandDtb.deleteMany({ _id: { $in: ids } });
    return {
        status: 'OK',
        message: "Xoa thương hiệu thanh cong"
    }
}