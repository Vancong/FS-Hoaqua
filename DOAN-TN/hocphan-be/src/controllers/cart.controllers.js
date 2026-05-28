const CartService=require('../services/cart.service');
const asyncHandler =require('express-async-handler')

// [POST] /api/cart/create
module.exports.create= asyncHandler( async (req,res) =>{

    const cart= await CartService.create(req.body)
    return res.status(200).json(cart);

})

// [GET] /api/cart/detail/:userId
module.exports.getDetail=asyncHandler(async(req,res) =>{

    const userId=req.params.userId;
    const cart= await CartService.getDetail(userId)
    return res.status(200).json(cart);
})

// [PATCH] /api/cart/increase
module.exports.increaseQuantity= asyncHandler(async(req,res) =>{

    const quantity= await CartService.increaseQuantity(req.body)
    return res.status(200).json(quantity);

})


// [PATCH] /api/cart/decrease
module.exports.decreaseQuantity= asyncHandler( async(req,res) =>{

    const quantity= await CartService.decreaseQuantity(req.body)
    return res.status(200).json(quantity);
  
})


// [PATCH] /api/cart/delete-product
module.exports.deleteProductInCart= asyncHandler( async(req,res) =>{
    console.log(req.body)
    const quantity= await CartService.deleteProductInCart(req.body)
    return res.status(200).json(quantity);

})

// [PATCH] /api/cart/clear-cart
module.exports.clearCart= asyncHandler(async(req,res) =>{
   
    const userId= await CartService.clearCart(req.params.userId)
    return res.status(200).json(userId);
   
})
