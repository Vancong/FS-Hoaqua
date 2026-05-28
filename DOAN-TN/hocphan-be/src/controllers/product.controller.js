const ProductService=require('../services/productService')
const asyncHandler =require('express-async-handler')


// [POST] /api/product/create
module.exports.createProduct= asyncHandler(async (req,res) =>{

        const imageUrls = req.files.map(file => file.path)||[]; 
        const response= await ProductService.createProduct({...req.body,images: imageUrls});
        return res.status(200).json(response);

})

// [PUT] /api/product/update/:id
module.exports.updateProduct= asyncHandler(async (req,res) =>{

        const imgNew = req.files.map(file => file.path) || [];
        const oldImages =req.body.oldImages ? JSON.parse(req.body.oldImages) : [];
        const imgUrls = [...oldImages, ...imgNew];
        const id=req.params.id;
        req.body.images=imgUrls;
        const dataUpdate=req.body;
        const response= await ProductService.updateProduct(id,dataUpdate);
        return res.status(200).json(response);
})

// [GET] /api/product/detail/:id
module.exports.detailProduct= asyncHandler(async (req,res) => {

    const {param}=req.params;
    const response=await ProductService.deitailProduct(param);
    return res.status(200).json(response);
   
})

// [DELETE] /api/product/delete/:id
module.exports.deleteProduct= asyncHandler(async (req,res) =>{

    const productId=req.params.id;
    const response= await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
        
 
})
// [DELETE] /api/product/delete-many 
module.exports.deleteManyProduct= asyncHandler(async(req,res) =>{
    const ids=req.body;
    const response= await ProductService.deleteManyProduct(ids);
    return res.status(200).json(response);
        
   
})
// [GET] /api/product/get-all
module.exports.getAllProduct= asyncHandler(async(req,res) =>{
    const page=parseInt(req.query.page||1);
    const limit=parseInt(req.query.limit)||10
    const {key,value,search,isAdmin,...restFilters}=req.query;
    const filters={
        search,
        ...restFilters
    }


    const response=await ProductService.getAllProduct(limit,page,key,value,filters,isAdmin);
    return res.status(200).json(response);
    
})