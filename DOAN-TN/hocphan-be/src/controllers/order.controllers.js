const OrderService=require("../services/order.service")
const asyncHandler =require('express-async-handler')

// [PATCH] /api/order/create
module.exports.create= asyncHandler( async(req,res) =>{

    const response=await OrderService.create(req.body);
    return res.status(200).json(response);
})


// [GET] /api/order/my-order
module.exports.myOrder=asyncHandler(async(req,res) =>{
    const { page = 1, limit = 5,status } = req.query;
    const filters={status}
    const response=await OrderService.myOrder(req.params.userId,page,limit,filters);
    return res.status(200).json(response);

})

// [GET] /api/order/my-order/detail/:orderCode
module.exports.myOrderDetail= asyncHandler( async(req,res) =>{
        
        const orderCode=req.params.orderCode;
        const response=await OrderService.myOrderDetail(orderCode);
        return res.status(200).json(response);
})

// [PATCH] /api/order/my-order/detail/change-status/:orderCode
module.exports.cancelled=asyncHandler( async(req,res) =>{
    const {orderCode,status}=req.body;
    const response=await OrderService.cancelled(orderCode,status);
    return res.status(200).json(response);

}
)


// [GET] /api/order/getall
module.exports.getAll=asyncHandler( async(req,res) =>{
    const {limit,page,search,status,startDate,endDate,paymentMethod}=req.query;
    const filters={
        status,startDate,endDate,paymentMethod
    }
    const response=await OrderService.getAll(limit,page,search,filters);
    return res.status(200).json(response);

})

module.exports.updateStatus=asyncHandler(async(req,res)=>{
    const {orderCode,status,updatedBy}=req.body;
    const response=await OrderService.updateStatus(orderCode,status,updatedBy);
    return res.status(200).json(response);
})