const mongoose = require('mongoose');

const cryptoAssetSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  change24h: {
    type: Number,
    default: 0
  },
  volume24h: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CryptoAsset', cryptoAssetSchema);
