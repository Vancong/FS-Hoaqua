
const VoucherService=require('../services/voucher.service');
const asyncHandler =require('express-async-handler')

// [GET] /api/voucher/create
module.exports.create= asyncHandler(async(req,res)=>{
    const response = await VoucherService.create(req.body);
    res.status(200).json(response);
})

// [GET] /api/voucher/getAll
module.exports.getAll= asyncHandler(async(req,res)=>{
    const {search,limit,page}=req.query;
    const response = await VoucherService.getAll(page,limit,search, req.user.isAdmin);
    res.status(200).json(response);
})

// [GET] /api/voucher/update/:id
module.exports.update= asyncHandler(async(req,res)=>{
    const id=req.params.id;
    const response = await VoucherService.update(req.body,id);
    res.status(200).json(response);
})

// [DELETED] /api/voucher/deleted/:id
module.exports.delete= asyncHandler(async(req,res)=>{
    const id=req.params.id;
    const response = await VoucherService.delete(id);
    res.status(200).json(response);
})

// [POST] /api/voucher/delete-many
module.exports.deleteMany= asyncHandler(async(req,res)=>{
    const ids=req.body;
    const response = await VoucherService.deleteMany(ids);
    res.status(200).json(response);
})

// [POST] /api/voucher/check
module.exports.check= asyncHandler(async(req,res)=>{
    const userId=req.params.userId;
    const {code,totalPrice}=req.body;
    const response = await VoucherService.check(userId,code,totalPrice);
    res.status(200).json(response);
})



