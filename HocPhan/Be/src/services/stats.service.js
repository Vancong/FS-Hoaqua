const Order = require('../models/Order.Model');
const Product = require('../models/Product.Model');
const User = require('../models/User.Model');
const dayjs = require('dayjs');

const getDateRange = (period, from, to) => {
    if (period === 'today') {
        return {
            startDate: dayjs().startOf('day').toDate(),
            endDate: dayjs().endOf('day').toDate(),
        };
    }
    if (period === 'last7') {
        return {
            startDate: dayjs().subtract(6, 'day').startOf('day').toDate(),
            endDate: dayjs().endOf('day').toDate(),
        };
    }
    if (period === 'month') {
        return {
            startDate: dayjs().startOf('month').toDate(),
            endDate: dayjs().endOf('day').toDate(),
        };
    }
    if (period === 'custom' && from && to) {
        return {
            startDate: dayjs(from).startOf('day').toDate(),
            endDate: dayjs(to).endOf('day').toDate(),
        };
    }
    return {
        startDate: new Date(0),
        endDate: new Date(),
    };
};

module.exports.revenue = async (data) => {
    const { period, from, to } = data;
    const { startDate, endDate } = getDateRange(period, from, to);

    const revenueMatch = {
        status: 'delivered',
        createdAt: { $gte: startDate, $lte: endDate },
    };

    const dailyRevenue = await Order.aggregate([
        { $match: revenueMatch },
        {
            $group: {
                _id: null,
                totalPrice: { $sum: '$finalPrice' },
                totalOrders: { $sum: 1 },
            },
        },
    ]);

    const topProducts = await Order.aggregate([
        { $match: revenueMatch },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalSold: { $sum: '$items.quantity' },
            },
        },
        {
            $lookup: {
                from: 'Products',
                localField: '_id',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $project: {
                _id: 0,
                key: '$product._id',
                name: '$product.name',
                productId: '$product._id',
                totalSold: 1,
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
    ]);

    const users = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
    });

    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
        .select('name stock')
        .sort({ stock: 1 })
        .limit(5)
        .lean();

    let ordersByStatus = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const totalOrdersInRange = ordersByStatus.reduce((sum, item) => sum + item.count, 0);

    ordersByStatus = ordersByStatus.map((item) => ({
        status: item._id,
        count: item.count,
        apiPercent:
            totalOrdersInRange > 0
                ? Number(((item.count / totalOrdersInRange) * 100).toFixed(2))
                : 0,
    }));

    return {
        status: 'OK',
        data: {
            dailyRevenue,
            topProducts,
            users,
            lowStockProducts,
            ordersByStatus,
        },
    };
};
