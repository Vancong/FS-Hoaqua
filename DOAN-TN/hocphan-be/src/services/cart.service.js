const CartDtb=require('../models/Cart.Model');
const productDtb=require('../models/Product.Model')
const createError=require("../helper/createError");
module.exports.create= async(data) =>{

    const { userId, productId, volume, price,quantity } = data;
    let cart = await CartDtb.findOne({ user: userId });
    if (!cart) {
        cart = new CartDtb({
        user: userId,
        items: [{ product: productId, volume,price,quantity }]
        });
    } 
    else {

        const product= await productDtb.findOne({
            _id: productId
        });
        const checkInstock= product.sizes.find(size => size.volume===volume)
        if(checkInstock.countInStock<quantity) {
            throw createError(400,`Chỉ còn ${checkInstock.countInStock} sản phẩm`);
        }
        const cartItem= cart.items.find((item) =>
            item.product.toString() === productId && item.volume === volume
        );

        if (cartItem) {
            cartItem.quantity += quantity;
        } 
        else {
            cart.items.push({ product: productId, volume, price, quantity });
        }
    }

    const newCart= await cart.save();
    return {
        status: 'OK',
        message: 'Đã thêm vào giỏ hàng thành công',
        data: newCart
    };

}

module.exports.getDetail=async (userId) =>{

    const cart = await  CartDtb.findOne({ user: userId })
        .populate('items.product', 'name images selled slug sizes discount isActive');
    
    // Filter out items với:
    // 1. Product null (đã bị xóa)
    // 2. Product isActive = false (đã dừng hoạt động)
    const validItems = cart?.items?.filter(item => 
        item.product !== null && 
        item.product !== undefined && 
        item.product.isActive !== false
    ) || [];
    
    // Cập nhật cart nếu có items không hợp lệ
    if (cart && cart.items.length !== validItems.length) {
        // Chỉ lưu lại các items hợp lệ (loại bỏ product null và isActive = false)
        const validItemIds = validItems.map(item => ({
            product: item.product._id || item.product,
            volume: item.volume,
            price: item.price,
            quantity: item.quantity
        }));
        
        await CartDtb.updateOne(
            { user: userId },
            { $set: { items: validItemIds } }
        );
    }
    
    return {
        status: 'OK',
        data: validItems,
        total: validItems.length
    }
        
}

module.exports.increaseQuantity= async(data) =>{
 
    const { userId, productId, volume } = data;

    const product= await productDtb.findOne({_id:productId});
    const sizes= product.sizes.find(item => item.volume===volume);

    const cart= await CartDtb.findOne({user:userId});

    const item=cart.items.find(item => item.product.toString()===productId&&item.volume===volume);

    const newQuantity=item.quantity+1;

    if(newQuantity>sizes.countInStock) {
        throw createError(400,`Chỉ còn ${sizes.countInStock} sản phẩm`)
    }
    const updatedCart = await CartDtb.findOneAndUpdate(
        {
        user: userId,
        'items.product': productId,
        'items.volume': volume
        },
        {
        $inc: { 'items.$.quantity': 1 }
        },
    );
     if(!updatedCart) {
        throw createError(404,'Loi khong tim thay san pham');
     }

   
    return {
        status: 'OK',
    }

}



module.exports.decreaseQuantity= async(data) =>{

    const { userId, productId, volume } = data;
    const updatedCart = await CartDtb.findOneAndUpdate(
        {
        user: userId,
        'items.product': productId,
        'items.volume': volume
        },
        {
        $inc: { 'items.$.quantity': -1 }
        },
    );
     if(!updatedCart) {
        throw createError(404,'Loi khong tim thay san pham');
     }

   
    return {
        status: 'OK',
    }
}



module.exports.deleteProductInCart= async(data) =>{

    const { userId, productId, volume } = data;
    const cart= await CartDtb.findOneAndUpdate({
        user: userId,
    },{
        $pull:{
            items:{
                product:productId,
                volume:volume
            }
        }
    })

    if(!cart) {
        throw createError(404,'Loi khong tim thay san pham');
    }

    return {
        status: 'OK',
    }

}

module.exports.clearCart=  async (userId) =>{

    const cart= await CartDtb.findOneAndUpdate({
        user: userId,
    },{
        items:[]
    })
    if(!cart) {
        throw createError(404,'Loi khong tim thay san pham');
    }
    return {
        status: 'OK',
    }
  
}