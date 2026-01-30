const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const crypto = require('crypto');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// Stripe Checkout only supports USD; we credit wallet in USD
const SUPPORTED_CURRENCY = 'usd';
const MIN_AMOUNT_USD = 1;
// Crypto deposit: credit wallet in btc, eth, or usdt via Coinbase Commerce
const CRYPTO_CREDIT_OPTIONS = ['btc', 'eth', 'usdt'];
const MIN_CRYPTO_AMOUNTS = { btc: 0.0001, eth: 0.0001, usdt: 1 };

const COINGECKO_IDS = { btc: 'bitcoin', eth: 'ethereum', usdt: 'tether' };
async function getCryptoPriceUsd(symbol) {
  const id = COINGECKO_IDS[(symbol || '').toLowerCase()];
  if (!id) return null;
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { timeout: 8000 }
    );
    return data?.[id]?.usd ?? null;
  } catch (e) {
    console.warn('CoinGecko price failed:', e.message);
    return null;
  }
}

function ensureStripe(req, res, next) {
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your .env file.',
    });
  }
  next();
}

function ensurePayPal(req, res, next) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file.',
    });
  }
  next();
}

function ensureCrypto(req, res, next) {
  if (!process.env.COINBASE_COMMERCE_API_KEY) {
    return res.status(503).json({
      success: false,
      message: 'Crypto payments are not configured. Add COINBASE_COMMERCE_API_KEY to your .env file.',
    });
  }
  next();
}

// Deposit addresses (no Coinbase needed): set DEPOSIT_BTC_ADDRESS, DEPOSIT_ETH_ADDRESS, DEPOSIT_USDT_ADDRESS in .env
function getDepositAddress(currency) {
  const key = `DEPOSIT_${(currency || '').toUpperCase()}_ADDRESS`;
  const addr = process.env[key];
  return (addr && String(addr).trim()) || null;
}

function hasAnyDepositAddress() {
  return CRYPTO_CREDIT_OPTIONS.some((c) => getDepositAddress(c));
}

// --- PayPal helpers ---
const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data.access_token;
}

async function createPayPalOrder(amountUsd, returnUrl, cancelUrl, metadata = {}) {
  const token = await getPayPalAccessToken();
  const value = amountUsd.toFixed(2);
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value },
        description: metadata.description || `Wallet deposit $${value} USD`,
      }],
      application_context: { return_url: returnUrl, cancel_url: cancelUrl },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  const link = (data.links || []).find(l => l.rel === 'approve');
  return { orderId: data.id, approvalUrl: link ? link.href : null };
}

async function capturePayPalOrder(orderId) {
  const token = await getPayPalAccessToken();
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

// --- Coinbase Commerce helpers ---
const COINBASE_COMMERCE_API = 'https://api.commerce.coinbase.com';

async function createCoinbaseCharge(amountUsd, redirectUrl, cancelUrl, metadata = {}) {
  const { data } = await axios.post(
    `${COINBASE_COMMERCE_API}/charges`,
    {
      name: metadata.name || 'Wallet Deposit',
      description: metadata.description || `Deposit $${amountUsd.toFixed(2)} USD`,
      pricing_type: 'fixed_price',
      local_price: { amount: amountUsd.toFixed(2), currency: 'USD' },
      metadata: metadata.payload || {},
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
    },
    { headers: { 'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY, 'Content-Type': 'application/json' } }
  );
  const charge = data.data || data;
  return { chargeId: charge.id, hostedUrl: charge.hosted_url };
}

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe Checkout session for user deposit (user app)
// @access  Private
router.post('/create-checkout-session', protect, ensureStripe, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1 USD'),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const firstMsg = errList[0]?.msg || 'Validation failed';
      return res.status(400).json({ success: false, message: firstMsg, errors: errList });
    }
    const amountUsd = Math.round(parseFloat(req.body.amount) * 100); // cents
    if (amountUsd < 100) {
      return res.status(400).json({ success: false, message: 'Minimum amount is 1 USD' });
    }
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/wallet?payment=success&provider=stripe`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/wallet?payment=cancelled`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Wallet Deposit',
            description: `Deposit $${(amountUsd / 100).toFixed(2)} USD to your VickyExchange wallet`,
            images: [],
          },
          unit_amount: amountUsd,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: req.user.id,
      metadata: {
        type: 'user_deposit',
        userId: req.user.id,
        amountUsd: amountUsd / 100,
        currency: SUPPORTED_CURRENCY,
      },
    });

    // Create pending transaction so we can complete it in webhook
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      category: 'wallet',
      amount: amountUsd / 100,
      currency: SUPPORTED_CURRENCY,
      status: 'pending',
      description: `Card deposit $${(amountUsd / 100).toFixed(2)} USD (pending)`,
      paymentId: session.id,
      metadata: { source: 'stripe', sessionId: session.id },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: 'Redirect to URL to complete payment',
    });
  } catch (error) {
    console.error('Create checkout session error:', error?.message || error);
    if (error?.raw?.message) console.error('Stripe raw:', error.raw.message);
    const msg = error?.message || error?.raw?.message || (typeof error === 'string' ? error : 'Failed to create payment session. Check STRIPE_SECRET_KEY and server logs.');
    res.status(500).json({
      success: false,
      message: msg,
    });
  }
});

// --- PayPal: user deposit ---
router.post('/create-paypal-order', protect, ensurePayPal, [
  body('amount').isFloat({ min: MIN_AMOUNT_USD }).withMessage(`Amount must be at least ${MIN_AMOUNT_USD} USD`),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const amountUsd = parseFloat(req.body.amount);
    if (amountUsd < MIN_AMOUNT_USD) return res.status(400).json({ success: false, message: `Minimum amount is ${MIN_AMOUNT_USD} USD` });
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/wallet?payment=success&provider=paypal`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/wallet?payment=cancelled`;
    const { orderId, approvalUrl } = await createPayPalOrder(amountUsd, successUrl, cancelUrl, { description: `Wallet deposit $${amountUsd.toFixed(2)} USD` });
    if (!approvalUrl) return res.status(500).json({ success: false, message: 'PayPal did not return approval URL' });
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      category: 'wallet',
      amount: amountUsd,
      currency: SUPPORTED_CURRENCY,
      status: 'pending',
      description: `PayPal deposit $${amountUsd.toFixed(2)} USD (pending)`,
      paymentId: orderId,
      metadata: { source: 'paypal', orderId, userId: req.user.id, amountUsd, type: 'user_deposit' },
    });
    res.json({ success: true, orderId, url: approvalUrl, message: 'Redirect to URL to complete payment' });
  } catch (err) {
    console.error('Create PayPal order error:', err.response?.data || err);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message || 'Failed to create PayPal order' });
  }
});

// --- PayPal: admin fund ---
router.post('/create-admin-paypal-order', protect, authorize('admin'), ensurePayPal, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: MIN_AMOUNT_USD }).withMessage(`Amount must be at least ${MIN_AMOUNT_USD} USD`),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const userId = req.body.userId;
    const amountUsd = parseFloat(req.body.amount);
    if (amountUsd < MIN_AMOUNT_USD) return res.status(400).json({ success: false, message: `Minimum amount is ${MIN_AMOUNT_USD} USD` });
    const baseUrl = process.env.ADMIN_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/admin/wallets?payment=success&provider=paypal`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/admin/wallets?payment=cancelled`;
    const { orderId, approvalUrl } = await createPayPalOrder(amountUsd, successUrl, cancelUrl, { description: `Admin funding $${amountUsd.toFixed(2)} USD` });
    if (!approvalUrl) return res.status(500).json({ success: false, message: 'PayPal did not return approval URL' });
    await Transaction.create({
      user: userId,
      type: 'deposit',
      category: 'wallet',
      amount: amountUsd,
      currency: SUPPORTED_CURRENCY,
      status: 'pending',
      description: `Admin PayPal funding $${amountUsd.toFixed(2)} USD (pending)`,
      paymentId: orderId,
      metadata: { source: 'paypal', orderId, userId, amountUsd, type: 'admin_fund' },
    });
    res.json({ success: true, orderId, url: approvalUrl, message: 'Redirect to URL to complete payment' });
  } catch (err) {
    console.error('Create admin PayPal order error:', err.response?.data || err);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message || 'Failed to create PayPal order' });
  }
});

// --- PayPal: capture after user returns (user or admin flow) ---
router.post('/capture-paypal', protect, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const orderId = req.body.orderId;
    const existing = await Transaction.findOne({ paymentId: orderId, status: 'completed' });
    if (existing) return res.json({ success: true, wallet: null, message: 'Already captured' });
    const pending = await Transaction.findOne({ paymentId: orderId, status: 'pending', 'metadata.source': 'paypal' });
    if (!pending) return res.status(404).json({ success: false, message: 'Order not found or already processed' });
    await capturePayPalOrder(orderId);
    const meta = pending.metadata || {};
    const userId = meta.userId || pending.user.toString();
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });
    const amountUsd = pending.amount;
    wallet.balances[SUPPORTED_CURRENCY] = (wallet.balances[SUPPORTED_CURRENCY] || 0) + amountUsd;
    await wallet.save();
    await Transaction.findByIdAndUpdate(pending._id, {
      status: 'completed',
      description: meta.type === 'admin_fund' ? `Admin funding: ${amountUsd} USD` : `Deposit ${amountUsd} USD`,
    });
    const updated = await Wallet.findOne({ user: userId });
    res.json({ success: true, wallet: updated, message: 'Payment captured. Wallet credited.' });
  } catch (err) {
    console.error('Capture PayPal error:', err.response?.data || err);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message || 'Failed to capture payment' });
  }
});

// --- Crypto (Coinbase Commerce): user deposit (USD or BTC/ETH/USDT) ---
// Body: either amount (USD) OR creditCurrency + creditAmount (btc/eth/usdt)
router.post('/create-crypto-charge', protect, ensureCrypto, [
  body('amount').optional().isFloat({ min: MIN_AMOUNT_USD }).withMessage(`Amount must be at least ${MIN_AMOUNT_USD} USD`),
  body('creditCurrency').optional().isIn(CRYPTO_CREDIT_OPTIONS).withMessage('creditCurrency must be btc, eth, or usdt'),
  body('creditAmount').optional().isFloat({ min: 0 }).withMessage('creditAmount must be a positive number'),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      return res.status(400).json({ success: false, message: errs[0]?.msg || 'Validation failed', errors: errs });
    }
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/wallet?payment=success&provider=crypto`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/wallet?payment=cancelled`;

    let amountUsd;
    let creditCurrency = SUPPORTED_CURRENCY;
    let creditAmount;

    if (req.body.creditCurrency && req.body.creditAmount != null) {
      creditCurrency = req.body.creditCurrency.toLowerCase();
      creditAmount = parseFloat(req.body.creditAmount);
      const minCrypto = MIN_CRYPTO_AMOUNTS[creditCurrency];
      if (minCrypto != null && creditAmount < minCrypto) {
        return res.status(400).json({ success: false, message: `Minimum ${creditCurrency.toUpperCase()} amount is ${minCrypto}` });
      }
      const price = await getCryptoPriceUsd(creditCurrency);
      if (price == null || price <= 0) {
        return res.status(503).json({ success: false, message: 'Could not fetch crypto price. Try again.' });
      }
      amountUsd = creditAmount * price;
      if (amountUsd < MIN_AMOUNT_USD) {
        return res.status(400).json({ success: false, message: `Amount is below minimum ($${MIN_AMOUNT_USD} USD equivalent)` });
      }
    } else {
      amountUsd = parseFloat(req.body.amount);
      if (!Number.isFinite(amountUsd) || amountUsd < MIN_AMOUNT_USD) {
        return res.status(400).json({ success: false, message: `Amount must be at least ${MIN_AMOUNT_USD} USD, or use creditCurrency + creditAmount for BTC/ETH/USDT` });
      }
    }

    const description = creditCurrency === 'usd'
      ? `Deposit $${amountUsd.toFixed(2)} USD`
      : `Deposit ${creditAmount} ${creditCurrency.toUpperCase()}`;
    const { chargeId, hostedUrl } = await createCoinbaseCharge(amountUsd, successUrl, cancelUrl, {
      name: 'Wallet Deposit',
      description,
      payload: {
        userId: req.user.id,
        amountUsd,
        type: 'user_deposit',
        credit_currency: creditCurrency,
        credit_amount: creditCurrency === 'usd' ? amountUsd : creditAmount,
      },
    });
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      category: 'wallet',
      amount: creditCurrency === 'usd' ? amountUsd : creditAmount,
      currency: creditCurrency,
      status: 'pending',
      description: `${description} (pending)`,
      paymentId: chargeId,
      metadata: {
        source: 'coinbase',
        chargeId,
        userId: req.user.id,
        amountUsd,
        type: 'user_deposit',
        credit_currency: creditCurrency,
        credit_amount: creditCurrency === 'usd' ? amountUsd : creditAmount,
      },
    });
    res.json({ success: true, chargeId, url: hostedUrl, message: 'Redirect to pay with crypto' });
  } catch (err) {
    console.error('Create crypto charge error:', err.response?.data || err);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message || 'Failed to create crypto payment' });
  }
});

// @route   GET /api/payments/crypto-options
// @desc    Whether Coinbase Commerce is available and which deposit addresses are set (no keys required)
// @access  Private
router.get('/crypto-options', protect, (req, res) => {
  const coinbaseAvailable = !!process.env.COINBASE_COMMERCE_API_KEY;
  const depositAddresses = {};
  CRYPTO_CREDIT_OPTIONS.forEach((c) => {
    const addr = getDepositAddress(c);
    if (addr) depositAddresses[c] = addr;
  });
  res.json({
    success: true,
    coinbaseAvailable,
    depositAddresses: Object.keys(depositAddresses).length ? depositAddresses : null,
    useDepositAddresses: !coinbaseAvailable && hasAnyDepositAddress(),
  });
});

// @route   POST /api/payments/request-crypto-deposit
// @desc    Get deposit instructions (address + reference) when Coinbase Commerce is not used
// @access  Private
router.post('/request-crypto-deposit', protect, [
  body('creditCurrency').isIn(CRYPTO_CREDIT_OPTIONS).withMessage('creditCurrency must be btc, eth, or usdt'),
  body('creditAmount').isFloat({ min: 0 }).withMessage('creditAmount must be a positive number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      return res.status(400).json({ success: false, message: errs[0]?.msg || 'Validation failed', errors: errs });
    }
    const creditCurrency = (req.body.creditCurrency || '').toLowerCase();
    const creditAmount = parseFloat(req.body.creditAmount);
    const minCrypto = MIN_CRYPTO_AMOUNTS[creditCurrency];
    if (minCrypto != null && creditAmount < minCrypto) {
      return res.status(400).json({ success: false, message: `Minimum ${creditCurrency.toUpperCase()} amount is ${minCrypto}` });
    }
    const address = getDepositAddress(creditCurrency);
    if (!address) {
      return res.status(400).json({
        success: false,
        message: `Deposit address for ${creditCurrency.toUpperCase()} is not configured. Add DEPOSIT_${creditCurrency.toUpperCase()}_ADDRESS to your .env`,
      });
    }
    const reference = `DEP-${req.user.id.toString().slice(-8)}-${Date.now().toString(36)}`;
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      category: 'wallet',
      amount: creditAmount,
      currency: creditCurrency,
      status: 'pending',
      description: `Manual deposit ${creditAmount} ${creditCurrency.toUpperCase()} (pending)`,
      paymentId: reference,
      metadata: {
        source: 'manual_deposit',
        userId: req.user.id,
        reference,
        credit_currency: creditCurrency,
        credit_amount: creditAmount,
      },
    });
    const network = creditCurrency === 'usdt' ? 'ERC20' : creditCurrency === 'eth' ? 'Ethereum' : creditCurrency === 'btc' ? 'Bitcoin' : null;
    res.json({
      success: true,
      useAddress: true,
      address,
      amount: creditAmount,
      currency: creditCurrency,
      network: network || undefined,
      reference,
      instructions: `Send exactly ${creditAmount} ${creditCurrency.toUpperCase()}${creditCurrency === 'usdt' ? ' (ERC20)' : ''} to the address below. ${creditCurrency === 'usdt' ? 'Use the Ethereum (ERC20) network only.' : ''} Include the reference "${reference}" in the memo/message if your wallet supports it. After sending, your deposit will be credited once confirmed (contact support if needed).`,
    });
  } catch (err) {
    console.error('Request crypto deposit error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create deposit request' });
  }
});

// --- Crypto (Coinbase Commerce): admin fund ---
router.post('/create-admin-crypto-charge', protect, authorize('admin'), ensureCrypto, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: MIN_AMOUNT_USD }).withMessage(`Amount must be at least ${MIN_AMOUNT_USD} USD`),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const userId = req.body.userId;
    const amountUsd = parseFloat(req.body.amount);
    if (amountUsd < MIN_AMOUNT_USD) return res.status(400).json({ success: false, message: `Minimum amount is ${MIN_AMOUNT_USD} USD` });
    const baseUrl = process.env.ADMIN_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/admin/wallets?payment=success&provider=crypto`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/admin/wallets?payment=cancelled`;
    const { chargeId, hostedUrl } = await createCoinbaseCharge(amountUsd, successUrl, cancelUrl, {
      name: 'Fund User Wallet',
      description: `Admin funding $${amountUsd.toFixed(2)} USD`,
      payload: { userId, amountUsd, type: 'admin_fund' },
    });
    await Transaction.create({
      user: userId,
      type: 'deposit',
      category: 'wallet',
      amount: amountUsd,
      currency: SUPPORTED_CURRENCY,
      status: 'pending',
      description: `Admin crypto funding $${amountUsd.toFixed(2)} USD (pending)`,
      paymentId: chargeId,
      metadata: { source: 'coinbase', chargeId, userId, amountUsd, type: 'admin_fund' },
    });
    res.json({ success: true, chargeId, url: hostedUrl, message: 'Redirect to pay with crypto' });
  } catch (err) {
    console.error('Create admin crypto charge error:', err.response?.data || err);
    res.status(500).json({ success: false, message: err.response?.data?.message || err.message || 'Failed to create crypto payment' });
  }
});

// @route   POST /api/payments/create-admin-checkout-session
// @desc    Create Stripe Checkout session for admin funding a user's wallet
// @access  Private/Admin
router.post('/create-admin-checkout-session', protect, authorize('admin'), ensureStripe, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1 USD'),
  body('successUrl').optional().isURL({ require_tld: false }),
  body('cancelUrl').optional().isURL({ require_tld: false })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errList = errors.array();
      const firstMsg = errList[0]?.msg || 'Validation failed';
      return res.status(400).json({ success: false, message: firstMsg, errors: errList });
    }
    const { userId } = req.body;
    const amountUsd = Math.round(parseFloat(req.body.amount) * 100);
    if (amountUsd < 100) {
      return res.status(400).json({ success: false, message: 'Minimum amount is 1 USD' });
    }
    const baseUrl = process.env.ADMIN_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = req.body.successUrl || `${baseUrl}/admin/wallets?payment=success&provider=stripe`;
    const cancelUrl = req.body.cancelUrl || `${baseUrl}/admin/wallets?payment=cancelled`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Fund User Wallet',
            description: `Admin funding: $${(amountUsd / 100).toFixed(2)} USD to user wallet`,
            images: [],
          },
          unit_amount: amountUsd,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        type: 'admin_fund',
        userId,
        amountUsd: amountUsd / 100,
        currency: SUPPORTED_CURRENCY,
      },
    });

    // Pending transaction for the target user
    await Transaction.create({
      user: userId,
      type: 'deposit',
      category: 'wallet',
      amount: amountUsd / 100,
      currency: SUPPORTED_CURRENCY,
      status: 'pending',
      description: `Admin funding: $${(amountUsd / 100).toFixed(2)} USD (pending)`,
      paymentId: session.id,
      metadata: { source: 'stripe', sessionId: session.id, adminFund: true },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: 'Redirect to URL to complete payment',
    });
  } catch (error) {
    console.error('Create admin checkout session error:', error?.message || error);
    if (error?.raw?.message) console.error('Stripe raw:', error.raw.message);
    const msg = error?.message || error?.raw?.message || (typeof error === 'string' ? error : 'Failed to create payment session. Check STRIPE_SECRET_KEY and server logs.');
    res.status(500).json({
      success: false,
      message: msg,
    });
  }
});

// @route   GET /api/payments/pending-deposits
// @desc    List pending manual crypto deposits (admin)
// @access  Private/Admin
router.get('/pending-deposits', protect, authorize('admin'), async (req, res) => {
  try {
    const list = await Transaction.find({
      status: 'pending',
      type: 'deposit',
      'metadata.source': 'manual_deposit',
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();
    res.json({ success: true, deposits: list });
  } catch (err) {
    console.error('Pending deposits error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to list pending deposits' });
  }
});

// @route   POST /api/payments/confirm-deposit
// @desc    Confirm a manual crypto deposit and credit wallet (admin)
// @access  Private/Admin
router.post('/confirm-deposit', protect, authorize('admin'), [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const tx = await Transaction.findOne({
      _id: req.body.transactionId,
      status: 'pending',
      'metadata.source': 'manual_deposit',
    });
    if (!tx) return res.status(404).json({ success: false, message: 'Pending deposit not found' });
    const meta = tx.metadata || {};
    const userId = meta.userId || tx.user.toString();
    const currency = (meta.credit_currency || tx.currency || 'usd').toLowerCase();
    const amount = meta.credit_amount != null ? parseFloat(meta.credit_amount) : tx.amount;
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });
    if (!wallet.balances[currency]) wallet.balances[currency] = 0;
    wallet.balances[currency] += amount;
    await wallet.save();
    await Transaction.findByIdAndUpdate(tx._id, {
      status: 'completed',
      description: `Deposit ${amount} ${currency.toUpperCase()} (confirmed)`,
    });
    res.json({ success: true, message: 'Deposit confirmed. Wallet credited.', wallet });
  } catch (err) {
    console.error('Confirm deposit error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to confirm deposit' });
  }
});

/**
 * Webhook handler - must use raw body for Stripe signature verification.
 * Mount this route with express.raw({ type: 'application/json' }) in server.js
 */
async function handleWebhook(req, res) {
  if (!stripe) {
    return res.status(503).send('Payment gateway not configured');
  }
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.json({ received: true });
  }

  const session = event.data.object;
  const sessionId = session.id;

  // Idempotency: already processed?
  const existing = await Transaction.findOne({ paymentId: sessionId, status: 'completed' });
  if (existing) {
    return res.json({ received: true });
  }

  const metadata = session.metadata || {};
  const userId = metadata.userId || session.client_reference_id;
  const amountUsd = parseFloat(metadata.amountUsd || 0) || (session.amount_total ? session.amount_total / 100 : 0);
  const currency = (metadata.currency || SUPPORTED_CURRENCY).toLowerCase();

  if (!userId || amountUsd <= 0) {
    console.error('Webhook missing userId or amount', { sessionId, userId, amountUsd });
    return res.status(400).json({ received: false, error: 'Missing userId or amount' });
  }

  try {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId });
    }
    wallet.balances[currency] = (wallet.balances[currency] || 0) + amountUsd;
    await wallet.save();

    await Transaction.findOneAndUpdate(
      { paymentId: sessionId },
      {
        status: 'completed',
        description: metadata.type === 'admin_fund'
          ? `Admin funding: ${amountUsd} ${currency.toUpperCase()}`
          : `Deposit ${amountUsd} ${currency.toUpperCase()}`,
      }
    );
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ received: false, error: err.message });
  }

  res.json({ received: true });
}

/**
 * Coinbase Commerce webhook - must use raw body for signature verification.
 * Mount with express.raw({ type: 'application/json' }) at /api/payments/webhook/crypto
 */
async function handleCryptoWebhook(req, res) {
  const sig = req.headers['x-cc-webhook-signature'];
  const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('COINBASE_COMMERCE_WEBHOOK_SECRET is not set');
    return res.status(500).send('Webhook secret not configured');
  }
  let event;
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : (typeof req.body === 'string' ? Buffer.from(req.body) : Buffer.from(JSON.stringify(req.body)));
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expected = hmac.digest('hex');
    if (sig !== expected) {
      console.error('Coinbase webhook signature mismatch');
      return res.status(400).send('Invalid signature');
    }
    event = typeof rawBody.toString === 'function' ? JSON.parse(rawBody.toString('utf8')) : req.body;
  } catch (err) {
    console.error('Coinbase webhook parse error:', err);
    return res.status(400).send('Invalid payload');
  }
  if (event.event?.type !== 'charge:confirmed') {
    return res.status(200).json({ received: true });
  }
  const chargeId = event.event?.data?.id;
  if (!chargeId) return res.status(200).json({ received: true });
  const existing = await Transaction.findOne({ paymentId: chargeId, status: 'completed' });
  if (existing) return res.status(200).json({ received: true });
  const pending = await Transaction.findOne({ paymentId: chargeId, status: 'pending', 'metadata.source': 'coinbase' });
  if (!pending) {
    console.error('Coinbase webhook: no pending transaction for charge', chargeId);
    return res.status(200).json({ received: true });
  }
  const meta = pending.metadata || {};
  const userId = meta.userId || pending.user.toString();
  const creditCurrency = (meta.credit_currency || pending.currency || SUPPORTED_CURRENCY).toLowerCase();
  const creditAmount = meta.credit_amount != null ? parseFloat(meta.credit_amount) : pending.amount;
  try {
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) wallet = await Wallet.create({ user: userId });
    if (!wallet.balances[creditCurrency]) wallet.balances[creditCurrency] = 0;
    wallet.balances[creditCurrency] += creditAmount;
    await wallet.save();
    const desc = meta.type === 'admin_fund'
      ? `Admin funding: ${creditAmount} ${creditCurrency.toUpperCase()}`
      : `Deposit ${creditAmount} ${creditCurrency.toUpperCase()}`;
    await Transaction.findByIdAndUpdate(pending._id, {
      status: 'completed',
      description: desc,
    });
  } catch (err) {
    console.error('Coinbase webhook processing error:', err);
    return res.status(500).json({ received: false, error: err.message });
  }
  res.status(200).json({ received: true });
}

module.exports = { router, handleWebhook, handleCryptoWebhook };
