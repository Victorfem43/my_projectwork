const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

app.use(cors());

// Webhooks need raw body (before express.json())
const paymentRoutes = require('./routes/payments');
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes.handleWebhook);
app.use('/api/payments/webhook/crypto', express.raw({ type: 'application/json' }), paymentRoutes.handleCryptoWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vickyexchange';
  if (process.env.NODE_ENV === 'production' && uri.includes('localhost')) {
    console.error('❌ In production you must set MONGODB_URI to a cloud database (e.g. MongoDB Atlas).');
    console.error('   Add MONGODB_URI in Railway Variables with your Atlas connection string.');
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000 });
  console.log('✅ MongoDB Connected');
};

// Health – includes database name so you can confirm what Railway is using
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const databaseName = dbConnected && mongoose.connection.db
    ? mongoose.connection.db.databaseName
    : null;
  res.json({
    status: 'OK',
    message: 'VICKYEXCHANGE API',
    dbConnected,
    databaseName,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Require DB for other API routes
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || req.path === '/test') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  }
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/crypto', require('./routes/crypto'));
app.use('/api/giftcards', require('./routes/giftcards'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/payments', paymentRoutes.router);
app.use('/api/admin', require('./routes/admin'));

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found', path: req.path });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 API server running on port ${port}`);
      console.log(`📡 API base: http://localhost:${port}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
