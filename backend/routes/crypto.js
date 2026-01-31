const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const CryptoAsset = require('../models/CryptoAsset');
const Trade = require('../models/Trade');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

const router = express.Router();

const COINGECKO_MARKETS_URL = 'https://api.coingecko.com/api/v3/coins/markets';

// Fetch live market list from CoinGecko (with 7d sparkline for charts)
async function fetchLiveMarkets(perPage = 30, withSparkline = true) {
  const { data } = await axios.get(COINGECKO_MARKETS_URL, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page: 1,
      sparkline: withSparkline,
      price_change_percentage: '24h',
    },
    timeout: 15000,
    headers: { 'Accept': 'application/json' },
  });
  return (data || []).map((c) => ({
    id: c.id,
    symbol: (c.symbol || '').toUpperCase(),
    name: c.name || c.symbol || '',
    price: c.current_price || 0,
    change24h: c.price_change_percentage_24h != null ? c.price_change_percentage_24h : 0,
    marketCap: c.market_cap || 0,
    marketCapRank: c.market_cap_rank,
    volume24h: c.total_volume || 0,
    image: c.image,
    sparkline: c.sparkline_in_7d?.price || null,
  }));
}

// Get live price for a symbol (used for buy/sell)
async function getLivePrice(symbol) {
  const markets = await fetchLiveMarkets(100, false);
  const sym = (symbol || '').toLowerCase();
  const coin = markets.find((c) => c.symbol.toLowerCase() === sym);
  return coin ? coin.price : null;
}

// @route   GET /api/crypto/ohlc
// @desc    Get OHLC candlestick data for a coin (CoinGecko)
// @access  Public
// @query   id=bitcoin (CoinGecko id) or symbol=BTC, days=1|7|14|30
router.get('/ohlc', async (req, res) => {
  try {
    let id = req.query.id;
    const symbol = (req.query.symbol || '').toLowerCase();
    const days = Math.min(parseInt(req.query.days, 10) || 7, 90) || 7;
    if (!id && symbol) {
      const markets = await fetchLiveMarkets(100, false);
      const coin = markets.find((c) => c.symbol.toLowerCase() === symbol);
      if (!coin) return res.status(404).json({ success: false, message: 'Coin not found' });
      id = coin.id;
    }
    if (!id) return res.status(400).json({ success: false, message: 'Provide id or symbol' });
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/ohlc`,
      { params: { vs_currency: 'usd', days }, timeout: 10000 }
    );
    const ohlc = (data || []).map(([t, o, h, l, c]) => ({
      time: Math.floor(t / 1000),
      open: o,
      high: h,
      low: l,
      close: c,
      timestamp: t,
    }));
    res.json({ success: true, ohlc });
  } catch (error) {
    console.error('OHLC error:', error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch OHLC',
    });
  }
});

// @route   GET /api/crypto/market
// @desc    Get live crypto market data (CoinGecko)
// @access  Public
router.get('/market', async (req, res) => {
  try {
    const perPage = Math.min(parseInt(req.query.per_page, 10) || 30, 100);
    const sparkline = req.query.sparkline !== '0';
    const market = await fetchLiveMarkets(perPage, sparkline);
    res.json({
      success: true,
      market,
      live: true,
    });
  } catch (error) {
    console.error('CoinGecko market error:', error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch live market',
    });
  }
});

// @route   GET /api/crypto/prices
// @desc    Get crypto prices (DB fallback; prefer /market for live)
// @access  Public
router.get('/prices', async (req, res) => {
  try {
    const useLive = req.query.live !== '0';
    if (useLive) {
      try {
        const market = await fetchLiveMarkets(30);
        return res.json({ success: true, assets: market, live: true });
      } catch (e) {
        console.warn('Live market failed, using DB:', e.message);
      }
    }
    const assets = await CryptoAsset.find({ isActive: true });
    res.json({
      success: true,
      assets,
      live: false,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/crypto/buy
// @desc    Buy crypto (uses live price from CoinGecko)
// @access  Private
router.post('/buy', protect, [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      return res.status(400).json({
        success: false,
        message: errs[0]?.msg || 'Validation failed',
        errors: errs,
      });
    }

    const symbol = (req.body.symbol || '').trim();
    const amount = parseFloat(req.body.amount, 10);
    if (!Number.isFinite(amount) || amount < 0.0001) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const sym = symbol.toUpperCase();
    let livePrice;
    try {
      livePrice = await getLivePrice(sym);
    } catch (apiErr) {
      console.error('Crypto buy getLivePrice error:', apiErr.message);
      return res.status(503).json({
        success: false,
        message: 'Price service temporarily unavailable. Please try again in a moment.',
      });
    }

    if (livePrice == null || livePrice <= 0) {
      return res.status(404).json({ success: false, message: 'Crypto not found or not supported. Use a symbol from the live market.' });
    }

    const totalCost = amount * livePrice;
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id });
    }

    // Check USD balance
    if ((wallet.balances?.usd ?? 0) < totalCost) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Create trade with live price
    const trade = await Trade.create({
      user: req.user.id,
      type: 'crypto',
      tradeType: 'buy',
      asset: sym,
      amount,
      price: livePrice,
      total: totalCost,
      status: 'pending'
    });

    res.json({
      success: true,
      trade,
      message: 'Buy order created'
    });
  } catch (error) {
    console.error('Crypto buy error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create buy order',
    });
  }
});

// @route   POST /api/crypto/sell
// @desc    Sell crypto (uses live price from CoinGecko)
// @access  Private
router.post('/sell', protect, [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      return res.status(400).json({
        success: false,
        message: errs[0]?.msg || 'Validation failed',
        errors: errs,
      });
    }

    const symbol = (req.body.symbol || '').trim();
    const amount = parseFloat(req.body.amount, 10);
    if (!Number.isFinite(amount) || amount < 0.0001) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const sym = symbol.toUpperCase();
    const symbolLower = symbol.toLowerCase();
    let wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }

    // Check crypto balance
    if ((wallet.balances?.[symbolLower] ?? 0) < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    let livePrice;
    try {
      livePrice = await getLivePrice(sym);
    } catch (apiErr) {
      console.error('Crypto sell getLivePrice error:', apiErr.message);
      return res.status(503).json({
        success: false,
        message: 'Price service temporarily unavailable. Please try again in a moment.',
      });
    }

    if (livePrice == null || livePrice <= 0) {
      return res.status(404).json({ success: false, message: 'Crypto not found or not supported. Use a symbol from the live market.' });
    }

    const totalValue = amount * livePrice;

    // Create trade with live price
    const trade = await Trade.create({
      user: req.user.id,
      type: 'crypto',
      tradeType: 'sell',
      asset: sym,
      amount,
      price: livePrice,
      total: totalValue,
      status: 'pending'
    });

    res.json({
      success: true,
      trade,
      message: 'Sell order created'
    });
  } catch (error) {
    console.error('Crypto sell error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create sell order',
    });
  }
});

// @route   POST /api/crypto/trade
// @desc    Create peer-to-peer trade
// @access  Private
router.post('/trade', protect, [
  body('symbol').notEmpty().withMessage('Symbol is required'),
  body('amount').isFloat({ min: 0.0001 }).withMessage('Amount must be greater than 0'),
  body('tradeType').isIn(['buy', 'sell']).withMessage('Invalid trade type'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { symbol, amount, tradeType, price } = req.body;

    const total = amount * price;

    const trade = await Trade.create({
      user: req.user.id,
      type: 'crypto',
      tradeType,
      asset: symbol.toUpperCase(),
      amount,
      price,
      total,
      status: 'pending',
      peerTrade: true
    });

    res.json({
      success: true,
      trade,
      message: 'Trade order created'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/crypto/trades
// @desc    Get user crypto trades
// @access  Private
router.get('/trades', protect, async (req, res) => {
  try {
    const trades = await Trade.find({ 
      user: req.user.id,
      type: 'crypto'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      trades
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
