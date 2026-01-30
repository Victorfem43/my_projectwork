const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  faceValue: {
    type: Number,
    required: true
  },
  buyRate: {
    type: Number,
    required: true // Percentage of face value when buying
  },
  sellRate: {
    type: Number,
    required: true // Percentage of face value when selling
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GiftCard', giftCardSchema);
