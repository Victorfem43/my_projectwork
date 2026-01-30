const express = require('express');
const { body, validationResult } = require('express-validator');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wallets
// @desc    Get user wallet
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wallets/deposit
// @desc    Deposit to wallet
// @access  Private
router.post('/deposit', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['usd', 'btc', 'eth', 'usdt']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { amount, currency } = req.body;
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    // Update balance
    wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
    await wallet.save();

    // Create transaction
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      category: 'wallet',
      amount,
      currency,
      status: 'completed',
      description: `Deposit ${amount} ${currency.toUpperCase()}`
    });

    res.json({
      success: true,
      wallet,
      message: 'Deposit successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wallets/withdraw
// @desc    Withdraw from wallet
// @access  Private
router.post('/withdraw', protect, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['usd', 'btc', 'eth', 'usdt']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { amount, currency } = req.body;
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Check balance
    if ((wallet.balances[currency] || 0) < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Update balance
    wallet.balances[currency] = (wallet.balances[currency] || 0) - amount;
    await wallet.save();

    // Create transaction
    await Transaction.create({
      user: req.user.id,
      type: 'withdrawal',
      category: 'wallet',
      amount,
      currency,
      status: 'completed',
      description: `Withdrawal ${amount} ${currency.toUpperCase()}`
    });

    res.json({
      success: true,
      wallet,
      message: 'Withdrawal successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
