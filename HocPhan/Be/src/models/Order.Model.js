const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        name: { type: String, trim: true },
        image: { type: String },
        quantity: { type: Number, required: true, min: 0.1 },
        price: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        orderCode: { type: String, required: true, unique: true, trim: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, trim: true, default: '' },
        note: { type: String, trim: true, default: '' },
        address: {
            province: { type: mongoose.Schema.Types.Mixed },
            district: { type: mongoose.Schema.Types.Mixed },
            ward: { type: mongoose.Schema.Types.Mixed },
            detail: { type: String, default: '' },
        },
        items: [OrderItemSchema],
        totalPrice: { type: Number, required: true, min: 0 },
        shipping: { type: Number, default: 0, min: 0 },
        discountCode: { type: String, default: null },
        discountValue: { type: Number, default: 0, min: 0 },
        finalPrice: { type: Number, required: true, min: 0 },
        paymentMethod: {
            type: String,
            enum: ['cod', 'vnpay', 'paypal'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'awaiting_payment', 'confirmed', 'shipping', 'delivered', 'cancelled'],
            default: 'pending',
        },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        vnpayTransactionNo: { type: String },
        paypalOrderId: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Orders', OrderSchema, 'Orders');
