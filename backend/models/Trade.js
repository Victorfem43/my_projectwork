const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['crypto', 'giftcard'],
    required: true
  },
  tradeType: {
    type: String,
    enum: ['buy', 'sell', 'trade'],
    required: true
  },
  asset: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  // For gift cards
  giftCardImage: String,
  giftCardCode: String,
  deliveredCode: String, // Code sent to user after approved buy (for redeem display)
  // For peer trading
  peerTrade: {
    type: Boolean,
    default: false
  },
  peerUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);
