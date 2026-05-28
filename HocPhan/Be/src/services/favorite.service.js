const Favorite = require('../models/Favorite.Model');
const Product = require('../models/Product.Model');

module.exports.toggleFavorite = async (userId, productId) => {
    try {
        const existing = await Favorite.findOne({ userId, productId });
        if (existing) {
            await Favorite.deleteOne({ _id: existing._id });
            return {
                status: 'OK',
                message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
                action: 'removed'
            };
        } else {
            await Favorite.create({ userId, productId });
            return {
                status: 'OK',
                message: 'Đã thêm sản phẩm vào danh sách yêu thích',
                action: 'added'
            };
        }
    } catch (error) {
        throw new Error(error.message || 'Lỗi khi toggle danh sách yêu thích');
    }
};

module.exports.getUserFavorite = async (userId) => {
    try {
        const favorites = await Favorite.find({ userId }).populate('productId');
        const validProducts = favorites
            .filter(fav => fav.productId)
            .map(fav => fav.productId);

        return {
            status: 'OK',
            data: validProducts,
            total: validProducts.length
        };
    } catch (error) {
        throw new Error(error.message || 'Lỗi khi lấy danh sách yêu thích');
    }
};
