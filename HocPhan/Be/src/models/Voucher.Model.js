const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, trim: true },
        discountType: { type: String, required: true, enum: ['percentage', 'fixed'] },
        discountValue: { type: Number, required: true, min: 0 },
        maxDiscountValue: { type: Number, min: 0 },
        minOrderValue: { type: Number, default: 0, min: 0 },
        usageLimit: { type: Number, default: 0, min: 0 },
        usageCount: { type: Number, default: 0, min: 0 },
        userLimit: { type: Number, default: 0, min: 0 },
        usedBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                count: { type: Number, default: 0 }
            }
        ],
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        description: { type: String, default: '' },
    },
    { timestamps: true }
);

const Voucher = mongoose.model('Vouchers', VoucherSchema, 'Vouchers');
module.exports = Voucher;
