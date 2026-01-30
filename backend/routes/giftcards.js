const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const GiftCard = require('../models/GiftCard');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Seed default gift cards when none exist
const DEFAULT_GIFT_CARDS = [
  { brand: 'Amazon', type: 'E-Gift Card', faceValue: 100, buyRate: 98, sellRate: 92, isActive: true },
  { brand: 'iTunes', type: 'E-Gift Card', faceValue: 100, buyRate: 97, sellRate: 90, isActive: true },
  { brand: 'Google Play', type: 'E-Gift Card', faceValue: 100, buyRate: 97, sellRate: 91, isActive: true },
  { brand: 'Steam', type: 'E-Gift Card', faceValue: 100, buyRate: 96, sellRate: 89, isActive: true },
  { brand: 'Walmart', type: 'E-Gift Card', faceValue: 100, buyRate: 97, sellRate: 90, isActive: true },
  { brand: 'Target', type: 'E-Gift Card', faceValue: 100, buyRate: 96, sellRate: 89, isActive: true },
];

async function seedGiftCardsIfEmpty() {
  const count = await GiftCard.countDocuments();
  if (count === 0) {
    await GiftCard.insertMany(DEFAULT_GIFT_CARDS);
    console.log('Gift cards seeded:', DEFAULT_GIFT_CARDS.length);
  }
}

// @route   GET /api/giftcards
// @desc    Get available gift cards (seeds defaults if empty)
// @access  Public
router.get('/', async (req, res) => {
  try {
    await seedGiftCardsIfEmpty();
    const giftCards = await GiftCard.find({ isActive: true }).sort({ brand: 1 });
    res.json({
      success: true,
      giftCards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/giftcards/buy
// @desc    Buy gift card
// @access  Private
router.post('/buy', protect, [
  body('giftCardId').notEmpty().withMessage('Gift card ID is required'),
  body('faceValue').isFloat({ min: 1 }).withMessage('Face value must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { giftCardId, faceValue } = req.body;
    const giftCard = await GiftCard.findById(giftCardId);

    if (!giftCard || !giftCard.isActive) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    const cost = faceValue * (giftCard.buyRate / 100);
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    if ((wallet.balances.usd || 0) < cost) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const trade = await Trade.create({
      user: req.user.id,
      type: 'giftcard',
      tradeType: 'buy',
      asset: giftCard.brand,
      amount: faceValue,
      price: giftCard.buyRate,
      total: cost,
      status: 'pending'
    });

    res.json({
      success: true,
      trade,
      message: 'Gift card purchase order created'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/giftcards/sell
// @desc    Sell gift card
// @access  Private
router.post('/sell', protect, [
  body('giftCardId').notEmpty().withMessage('Gift card ID is required'),
  body('faceValue').isFloat({ min: 1 }).withMessage('Face value must be at least 1'),
  body('giftCardCode').notEmpty().withMessage('Gift card code is required')
], upload.single('image'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { giftCardId, faceValue, giftCardCode } = req.body;
    const giftCard = await GiftCard.findById(giftCardId);

    if (!giftCard || !giftCard.isActive) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    const payout = faceValue * (giftCard.sellRate / 100);
    let imageUrl = '';

    // In production, upload to cloudinary
    if (req.file) {
      // For now, just store a placeholder
      imageUrl = 'uploaded_image_placeholder';
    }

    const trade = await Trade.create({
      user: req.user.id,
      type: 'giftcard',
      tradeType: 'sell',
      asset: giftCard.brand,
      amount: faceValue,
      price: giftCard.sellRate,
      total: payout,
      status: 'pending',
      giftCardCode,
      giftCardImage: imageUrl
    });

    res.json({
      success: true,
      trade,
      message: 'Gift card sell order created'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/giftcards/trade
// @desc    Trade gift card peer-to-peer
// @access  Private
router.post('/trade', protect, [
  body('giftCardId').notEmpty().withMessage('Gift card ID is required'),
  body('faceValue').isFloat({ min: 1 }).withMessage('Face value must be at least 1'),
  body('tradeType').isIn(['buy', 'sell']).withMessage('Invalid trade type'),
  body('rate').isFloat({ min: 1 }).withMessage('Rate must be at least 1')
], upload.single('image'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { giftCardId, faceValue, tradeType, rate } = req.body;
    const giftCard = await GiftCard.findById(giftCardId);

    if (!giftCard || !giftCard.isActive) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = 'uploaded_image_placeholder';
    }

    const total = faceValue * (rate / 100);

    const trade = await Trade.create({
      user: req.user.id,
      type: 'giftcard',
      tradeType,
      asset: giftCard.brand,
      amount: faceValue,
      price: rate,
      total,
      status: 'pending',
      peerTrade: true,
      giftCardImage: imageUrl
    });

    res.json({
      success: true,
      trade,
      message: 'Gift card trade order created'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/giftcards/upload
// @desc    Upload gift card image
// @access  Private
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // In production, upload to cloudinary
    const imageUrl = 'uploaded_image_placeholder';

    res.json({
      success: true,
      imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/giftcards/trades
// @desc    Get user gift card trades (includes deliveredCode for approved buys)
// @access  Private
router.get('/trades', protect, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      user: req.user.id,
      type: 'giftcard'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/giftcards/redeem-info
// @desc    Get redeem info for a code (user received after buy)
// @access  Private
router.get('/redeem-info', protect, async (req, res) => {
  try {
    const code = (req.query.code || '').toString().trim();
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const trade = await Trade.findOne({
      user: req.user.id,
      type: 'giftcard',
      tradeType: 'buy',
      status: 'approved',
      deliveredCode: code,
    });
    if (!trade) {
      return res.status(404).json({ success: false, message: 'Code not found or not yet delivered. Contact support if you already completed a purchase.' });
    }
    const redeemUrls = {
      Amazon: 'https://www.amazon.com/gc/redeem',
      iTunes: 'https://www.apple.com/shop/gift-cards',
      'Google Play': 'https://play.google.com/redeem',
      Steam: 'https://store.steampowered.com/account/redeemwalletcode',
      Walmart: 'https://www.walmart.com/account/giftcards',
      Target: 'https://www.target.com/account/giftcards',
    };
    res.json({
      success: true,
      brand: trade.asset,
      amount: trade.amount,
      redeemUrl: redeemUrls[trade.asset] || null,
      message: `Redeem this ${trade.asset} gift card at the merchant's official site.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
