const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expireAt: {
            type: Date,
            required: true,
            expires: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    'forgotPasswords',
    forgotPasswordSchema,
    'forgot-passwords'
);
