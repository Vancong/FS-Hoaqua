const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1, min: 0.1 },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema, 'Cart');
