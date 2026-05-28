const asyncHandler =require('express-async-handler')
const statsService=require('../services/stats.service');

module.exports.revenue=asyncHandler(async(req,res)=>{
    const response= await statsService.revenue(req.query);
    res.status(200).json(response);
})