const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  { 
    orderCode: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }, 

    address: {
      province: { type: String, required: true },
      district: { type: String, required: true },
      ward: { type: String, required: true },
      detail: { type: String },
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: { type: Number, required: true },
        volume: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    totalPrice: { type: Number, required: true },    
    discountCode: { type: String,default:null },                     
    discountValue: { type: Number, default: 0 },        
    shipping: { type: Number, default: 0 },          
    finalPrice: { type: Number, required: true },       

    paymentMethod: {
      type: String,
      enum: ['cod', 'paypal'],
      required: true,
    },


    isPaid: {
      type: Boolean,
      default: false,
    },

    paypalOrderId:{
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
    },

    updatedBy:{
      type:String,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled','refunded','refund_pending'],
      default: 'pending',
    },

    note: { type: String }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", OrderSchema,"Orders");
