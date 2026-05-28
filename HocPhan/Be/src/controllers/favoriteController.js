const FavoriteService = require('../services/favorite.service');
const asyncHandler = require('express-async-handler');

module.exports.toggleFavorite = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Thiếu userId hoặc productId'
        });
    }

    const response = await FavoriteService.toggleFavorite(userId, productId);
    return res.status(200).json(response);
});

module.exports.getUserFavorite = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Thiếu userId'
        });
    }

    const response = await FavoriteService.getUserFavorite(userId);
    return res.status(200).json(response);
});
