const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const CryptoAsset = require('../models/CryptoAsset');
const GiftCard = require('../models/GiftCard');
const SupportTicket = require('../models/SupportTicket');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/unblock user
// @access  Private/Admin
router.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: req.body.isBlocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/kyc
// @desc    Update KYC status
// @access  Private/Admin
router.put('/users/:id/kyc', [
  body('kycStatus').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid KYC status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus: req.body.kycStatus },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/trades
// @desc    Get all trades
// @access  Private/Admin
router.get('/trades', async (req, res) => {
  try {
    const trades = await Trade.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/approve-trade
// @desc    Approve trade (optional deliveredCode for gift card buys)
// @access  Private/Admin
router.post('/approve-trade', [
  body('tradeId').notEmpty().withMessage('Trade ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const trade = await Trade.findById(req.body.tradeId).populate('user');
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    if (trade.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Trade already processed' });
    }

    let wallet = await Wallet.findOne({ user: trade.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: trade.user._id });
    }

    // Execute trade based on type
    if (trade.type === 'crypto') {
      const symbolLower = trade.asset.toLowerCase();
      
      if (trade.tradeType === 'buy') {
        // Deduct USD, add crypto
        wallet.balances.usd = (wallet.balances.usd || 0) - trade.total;
        wallet.balances[symbolLower] = (wallet.balances[symbolLower] || 0) + trade.amount;
      } else if (trade.tradeType === 'sell') {
        // Deduct crypto, add USD
        wallet.balances[symbolLower] = (wallet.balances[symbolLower] || 0) - trade.amount;
        wallet.balances.usd = (wallet.balances.usd || 0) + trade.total;
      }
    } else if (trade.type === 'giftcard') {
      if (trade.tradeType === 'buy') {
        // Deduct USD
        wallet.balances.usd = (wallet.balances.usd || 0) - trade.total;
      } else if (trade.tradeType === 'sell') {
        // Add USD
        wallet.balances.usd = (wallet.balances.usd || 0) + trade.total;
      }
    }

    await wallet.save();

    // Update trade status; for gift card buy, save deliveredCode if provided
    trade.status = 'approved';
    if (trade.type === 'giftcard' && trade.tradeType === 'buy' && req.body.deliveredCode) {
      trade.deliveredCode = String(req.body.deliveredCode).trim();
    }
    await trade.save();

    // Create transaction
    await Transaction.create({
      user: trade.user._id,
      type: 'trade',
      category: trade.type,
      amount: trade.amount,
      currency: trade.type === 'crypto' ? trade.asset.toLowerCase() : 'usd',
      status: 'completed',
      trade: trade._id,
      description: `${trade.tradeType.toUpperCase()} ${trade.amount} ${trade.asset}`
    });

    res.json({
      success: true,
      trade,
      message: 'Trade approved and executed'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/reject-trade
// @desc    Reject trade
// @access  Private/Admin
router.post('/reject-trade', [
  body('tradeId').notEmpty().withMessage('Trade ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const trade = await Trade.findByIdAndUpdate(
      req.body.tradeId,
      { 
        status: 'rejected',
        adminNotes: req.body.notes || ''
      },
      { new: true }
    );

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found' });
    }

    res.json({
      success: true,
      trade,
      message: 'Trade rejected'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/set-rates
// @desc    Set crypto prices or gift card rates
// @access  Private/Admin
router.post('/set-rates', [
  body('type').isIn(['crypto', 'giftcard']).withMessage('Invalid type'),
  body('assetId').notEmpty().withMessage('Asset ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { type, assetId, price, buyRate, sellRate } = req.body;

    if (type === 'crypto') {
      const asset = await CryptoAsset.findByIdAndUpdate(
        assetId,
        { price, updatedAt: Date.now() },
        { new: true }
      );
      res.json({
        success: true,
        asset,
        message: 'Crypto price updated'
      });
    } else if (type === 'giftcard') {
      const giftCard = await GiftCard.findByIdAndUpdate(
        assetId,
        { buyRate, sellRate },
        { new: true }
      );
      res.json({
        success: true,
        giftCard,
        message: 'Gift card rates updated'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('trade')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/wallets
// @desc    Get all wallets
// @access  Private/Admin
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await Wallet.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      wallets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/wallets/fund
// @desc    Fund user wallet
// @access  Private/Admin
router.post('/wallets/fund', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['usd', 'btc', 'eth', 'usdt']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId, amount, currency } = req.body;
    let wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }

    wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
    await wallet.save();

    await Transaction.create({
      user: userId,
      type: 'deposit',
      category: 'wallet',
      amount,
      currency,
      status: 'completed',
      description: `Admin funding: ${amount} ${currency.toUpperCase()}`
    });

    res.json({
      success: true,
      wallet,
      message: 'Wallet funded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/giftcards
// @desc    Get all gift cards
// @access  Private/Admin
router.get('/giftcards', async (req, res) => {
  try {
    const giftCards = await GiftCard.find().sort({ brand: 1 });
    res.json({
      success: true,
      giftCards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/giftcards
// @desc    Create a new gift card
// @access  Private/Admin
router.post('/giftcards', [
  body('brand').notEmpty().withMessage('Brand is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('faceValue').isFloat({ min: 1 }).withMessage('Face value must be at least 1'),
  body('buyRate').isFloat({ min: 0, max: 100 }).withMessage('Buy rate must be 0-100'),
  body('sellRate').isFloat({ min: 0, max: 100 }).withMessage('Sell rate must be 0-100'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { brand, type, faceValue, buyRate, sellRate } = req.body;
    const existing = await GiftCard.findOne({ brand: { $regex: new RegExp(`^${brand}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A gift card with this brand already exists' });
    }
    const giftCard = await GiftCard.create({
      brand: String(brand).trim(),
      type: String(type).trim(),
      faceValue: parseFloat(faceValue),
      buyRate: parseFloat(buyRate),
      sellRate: parseFloat(sellRate),
      isActive: true,
    });
    res.status(201).json({
      success: true,
      giftCard,
      message: 'Gift card created',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/support
// @desc    Get all support tickets
// @access  Private/Admin
router.get('/support', async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/support/:id
// @desc    Update support ticket
// @access  Private/Admin
router.put('/support/:id', [
  body('status').isIn(['open', 'in-progress', 'resolved', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        adminResponse: req.body.adminResponse,
        resolvedAt: req.body.status === 'resolved' ? Date.now() : undefined
      },
      { new: true }
    ).populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
