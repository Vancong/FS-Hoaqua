const  BrandService=require('../services/brand.service')
const asyncHandler =require('express-async-handler')
// [POST] /api/brand/create
module.exports.createBrand= asyncHandler( async (req,res) =>{
    const brand=await BrandService.createBrand(req.body); 
    return res.status(200).json(brand);

})



// [DELETE] /api/brand/delete/:id
module.exports.deleteBrand= asyncHandler(async (req,res) =>{

    const brandId=req.params.id;
    const response= await BrandService.deleteBrand(brandId);
    return res.status(200).json(response);
   
})

// [POST] /api/brand/delete-many
module.exports.deleteManyBrand= asyncHandler(async (req,res) =>{
    const ids=req.body;
    const response= await BrandService.deleteManyBrand(ids);
    return res.status(200).json(response);
})


// [GET] /api/brand/detail/:id
module.exports.getDetail=asyncHandler( async (req,res) =>{
    const brandId=req.params.id;
    const response=await BrandService.getDetail(brandId);
    return res.status(200).json(response);
})


// [GET] /api/brand/getAll

module.exports.getAll=asyncHandler( async (req,res) =>{
   
        const page=parseInt(req.query.page);
        const limit=parseInt(req.query.limit)
        const {key,value,search,isAdmin}=req.query;
        const response=await BrandService.getAllBrand(limit,page,key,value,search,isAdmin);
        return res.status(200).json(response);
})

// [PUT] /api/brand/update/:id
module.exports.updateBrand=asyncHandler( async (req,res) =>{
 
    const brandId=req.params.id;
    const data=req.body;
    
    const dataChange= await BrandService.update(brandId,data);
    return res.status(200).json(dataChange)

   
})