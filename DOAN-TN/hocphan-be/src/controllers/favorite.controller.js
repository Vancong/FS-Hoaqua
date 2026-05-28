const favoriteService=require('../services/favorite.Service');
const asyncHandler =require('express-async-handler')

// [POST] /api/favorite/create
module.exports.toggle=asyncHandler( async (req,res) =>{

    const favorite= await favoriteService.toggle(req.body)
    return res.status(200).json(favorite);
  
})

// [GET] /api/favorite/getUserFavorite/:userId
module.exports.getUserFavorite=asyncHandler(async(req,res) =>{

    const userId=req.params.userId;
    const favorite= await favoriteService.getUserFavorite(userId)
    return res.status(200).json(favorite);

})

