const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true }
});

const Counter = mongoose.model('Counters', counterSchema,'Counters');

module.exports = Counter;