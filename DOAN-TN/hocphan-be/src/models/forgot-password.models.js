const { required } = require("joi");
const mongoose = require("mongoose");

const forgotPasswordSchema = new mongoose.Schema({
  email: {
    type:String,
    required:true
  },
  otp: { 
    type:String,
    required:true
  },
  expireAt: {
    type: Date,
    required: true,
    expires: 0
  }
}, {
  timestamps: true
});

const ForgotPassword = mongoose.model(
  "forgotPasswords",
  forgotPasswordSchema,
  "forgot-passwords"
);

module.exports = ForgotPassword;