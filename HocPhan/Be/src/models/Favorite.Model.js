const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true }
    },
    { timestamps: true }
);

FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorites', FavoriteSchema, 'Favorites');
module.exports = Favorite;
