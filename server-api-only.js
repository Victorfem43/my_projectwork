/**
 * API-only server for deployment separate from the frontend (e.g. Railway, Render).
 * Use this when the frontend is on Vercel and the API is deployed elsewhere.
 * Run: node server-api-only.js
 */
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load env: root first, then backend
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const port = parseInt(process.env.PORT || '5000', 10);
const expressApp = express();

expressApp.use(cors());

// Payment webhooks need raw body (must be before express.json())
const paymentRoutes = require('./backend/routes/payments');
expressApp.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes.handleWebhook);
expressApp.use('/api/payments/webhook/crypto', express.raw({ type: 'application/json' }), paymentRoutes.handleCryptoWebhook);

expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
expressApp.use('/api/', limiter);

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vickyexchange';
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
    console.log('✅ MongoDB Connected');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

expressApp.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SiegerTech API',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

expressApp.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

expressApp.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/test') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
      dbState: mongoose.connection.readyState === 0 ? 'disconnected' : 'connecting',
    });
  }
  next();
});

const authRouter = require('./backend/routes/auth');
const userRouter = require('./backend/routes/users');
const walletRouter = require('./backend/routes/wallets');
const cryptoRouter = require('./backend/routes/crypto');
const giftcardRouter = require('./backend/routes/giftcards');
const transactionRouter = require('./backend/routes/transactions');
const adminRouter = require('./backend/routes/admin');

expressApp.use('/api/auth', authRouter);
expressApp.use('/api/users', userRouter);
expressApp.use('/api/wallets', walletRouter);
expressApp.use('/api/crypto', cryptoRouter);
expressApp.use('/api/giftcards', giftcardRouter);
expressApp.use('/api/transactions', transactionRouter);
expressApp.use('/api/payments', paymentRoutes.router);
expressApp.use('/api/admin', adminRouter);

expressApp.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found', path: req.path });
});

connectDB().then(() => {
  expressApp.listen(port, () => {
    console.log(`🚀 API server running on port ${port}`);
    console.log(`📡 API base: http://localhost:${port}/api`);
  });
}).catch((err) => {
  console.error('❌ Failed to start:', err);
  process.exit(1);
});
