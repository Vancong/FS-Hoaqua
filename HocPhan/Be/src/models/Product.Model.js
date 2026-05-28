const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true, default: '' },
        image: { type: String, required: true },
        stock: { type: Number, required: true, min: 0, default: 0 },
        sold: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0, max: 100 },
        isFeatured: { type: Boolean, default: false },
        type: { type: String, required: true, enum: ['nội địa', 'nhập khẩu'], default: 'nội địa' },
    },
    { timestamps: true }
);

const Product = mongoose.model('Products', ProductSchema, 'Products');
module.exports = Product;
