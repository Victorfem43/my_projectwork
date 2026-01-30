const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'trade', 'transfer'],
    required: true
  },
  category: {
    type: String,
    enum: ['crypto', 'giftcard', 'wallet'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  description: String,
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  paymentId: { type: String }, // Stripe payment/session ID for idempotency
  metadata: { type: mongoose.Schema.Types.Mixed }, // e.g. { source: 'stripe', sessionId }
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
