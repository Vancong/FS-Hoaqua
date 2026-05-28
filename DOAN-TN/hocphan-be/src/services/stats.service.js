const createErro=require('../helper/createError');
const OrderDtb=require('../models/Order.Model');
const ProductDtb=require('../models/Product.Model');
const UserDtb=require('../models/User.Model')
const dayjs=require('dayjs')
module.exports.revenue=async (data) =>{
    const {period,from,to}=data;

    let startDate,endDate;

    if(period==='today'){
        startDate=dayjs().startOf("day").toDate();
        endDate=dayjs().endOf("day").toDate();
    }
    else if(period==='last7'){
        startDate=dayjs().subtract(6,"day").startOf("day").toDate();
        endDate=dayjs().endOf("day").toDate();
    }
    else if(period==="month"){
        startDate=dayjs().startOf("month").toDate();
        endDate=dayjs().endOf("day").toDate();
    }
    else if(period==='custom'&&from&&to) {
        startDate=dayjs(from).startOf("day").toDate();
        endDate=dayjs(to).endOf("day").toDate();
    }
    else if(period==='all'){
        startDate = new Date(0); 
        endDate = new Date();
    }

    const match={
         status: "completed",
         createdAt: { $gte: startDate,$lte: endDate}
    }

    const dailyRevenue= await OrderDtb.aggregate([
        {
            $match: match    
        },{
            $group:{
                _id: null,
                totalPrice: {$sum: "$finalPrice"},
                totalOrders: { $sum: 1 }
            }
        }
    ])

    const topProducts = await OrderDtb.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
            $group: {
                _id: { product: "$items.product", volume: "$items.volume" },
                totalSold: { $sum: "$items.quantity" },
            },
        },
        {
            $lookup: {
            from: "Products",
            localField: "_id.product",
            foreignField: "_id",
            as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $project: {
            _id: 0,
            name: "$product.name",
            productId: "$product._id",
            volume: "$_id.volume",   
            totalSold: 1,
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        ]);
    
    const users=await UserDtb.countDocuments({
        createdAt: {$gte: startDate, $lte: endDate}
    })
    
    const lowStockProducts=await ProductDtb.aggregate([
        {
            $match: {"sizes.countInStock": {$lt: 5}}
        },{
            $project:{
                name:1,
                sizes: {
                    $filter:{
                        input:"$sizes",
                        as:"s",
                        cond: {$lt: ["$$s.countInStock",5]}
                    }
                }
            }
        },
        { $limit: 5 }
    ])

    let ordersByStatus=await OrderDtb.aggregate([
        {
            $match: {createdAt: {$gte: startDate,$lte:endDate}}
        },
        {
            $group:{
                _id: "$status",
                count: {$sum:1}
            }
        }
    ])

    const totalOrders=await OrderDtb.countDocuments();
     
    ordersByStatus=ordersByStatus.map(item =>{
       return {
         status: item._id,
        count: item.count,
        apiPercent:Number( ((item.count / totalOrders) * 100).toFixed(2))
       }
    })


        return {
            status:"OK",
            data: {
                dailyRevenue,
                topProducts,
                users,
                lowStockProducts,
                ordersByStatus
            }
        }
    }