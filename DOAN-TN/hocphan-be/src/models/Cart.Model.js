const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    unique: true,
    required: true
  },
  items: [
    { 
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
      },
      volume: { 
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Carts', cartSchema,'Carts');
