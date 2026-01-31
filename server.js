const path = require('path');
const next = require('next');
const express = require('express');
// IMPORTANT: Use the same mongoose instance as backend models
// so that the DB connection used here is shared with User/Wallet/etc.
const mongoose = require('./backend/node_modules/mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables: root .env first, then backend/.env (so both work)
dotenv.config();
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js - point to frontend directory
const nextApp = next({ 
  dev,
  dir: './frontend'
});
const handle = nextApp.getRequestHandler();

// Initialize Express
const expressApp = express();

// Express middleware
expressApp.use(cors());

// Payment webhooks must receive raw body for signature verification (before express.json())
const paymentRoutes = require('./backend/routes/payments');
expressApp.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes.handleWebhook);
expressApp.use('/api/payments/webhook/crypto', express.raw({ type: 'application/json' }), paymentRoutes.handleCryptoWebhook);

expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
expressApp.use('/api/', limiter);

// Database connection with proper options
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vickyexchange';
  
  console.log('🔌 Attempting to connect to MongoDB...');
  console.log(`   URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Give it 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('✅ MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (err) {
    console.error('\n❌ MongoDB connection failed!');
    console.error('   Error:', err.message);
    console.error('\n💡 To fix this:');
    console.error('\n   1. Start MongoDB:');
    console.error('      Windows: net start MongoDB');
    console.error('      macOS:   brew services start mongodb-community');
    console.error('      Linux:   sudo systemctl start mongod');
    console.error('\n   2. Or use MongoDB Atlas (cloud):');
    console.error('      - Sign up at https://www.mongodb.com/cloud/atlas');
    console.error('      - Create a free cluster');
    console.error('      - Update MONGODB_URI in .env file');
    console.error('\n   3. Verify MongoDB is running:');
    console.error('      Check if port 27017 is listening');
    console.error(`\n   Current connection string: ${mongoURI}\n`);
    process.exit(1);
  }
};

// Health check endpoint (no DB required)
expressApp.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint hit:', req.method, req.path);
  res.json({ 
    status: 'OK', 
    message: 'VICKYEXCHANGE API is running',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Test endpoint (no DB required)
expressApp.post('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ success: true, message: 'Express routing is working!' });
});

// Middleware to check MongoDB connection state for database operations
// This runs BEFORE routes, so it will catch all API requests except /health and /test
expressApp.use('/api', (req, res, next) => {
  // Skip health check and test endpoints
  if (req.path === '/health' || req.path === '/test') {
    return next();
  }
  
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      dbState: mongoose.connection.readyState === 0 ? 'disconnected' : 
               mongoose.connection.readyState === 2 ? 'connecting' : 'disconnecting'
    });
  }
  next();
});

// Debug middleware to log all API requests
expressApp.use('/api', (req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path}`);
  next();
});

// Load and mount API routes BEFORE Next.js prepare
console.log('📦 Loading API routes...');
try {
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
  
  console.log('✅ API routes mounted successfully');
  console.log(`   Auth routes: ${authRouter.stack.length} routes registered`);
} catch (error) {
  console.error('❌ Error loading API routes:', error);
  console.error(error.stack);
  process.exit(1);
}

// Start server - wait for MongoDB connection first
connectDB().then(() => {
  return nextApp.prepare();
}).then(() => {
  // 404 handler for unmatched API routes (must come AFTER all API routes)
  expressApp.use('/api', (req, res) => {
    const fullPath = req.originalUrl || req.baseUrl + req.path;
    console.log(`⚠️  404 Unhandled API route: ${req.method} ${fullPath}`);
    res.status(404).json({ 
      success: false, 
      message: 'API route not found. Check the path and that the server was restarted after code changes.', 
      path: fullPath,
      method: req.method
    });
  });

  // Catch-all: send every non-API request to the frontend (same idea as app.get(/.*/, (req, res) => res.sendFile('index.html')) but for Next.js)
  expressApp.use((req, res) => {
    if (!req.path.startsWith('/api/')) {
      return handle(req, res);
    }
  });

  expressApp.listen(port, (err) => {
    if (err) {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
    console.log(`\n🚀 Server ready on http://${hostname}:${port}`);
    console.log(`📡 API available at http://${hostname}:${port}/api`);
    console.log(`🌐 Frontend available at http://${hostname}:${port}`);
    console.log(`\n📋 Available API Routes:`);
    console.log(`   GET  /api/health`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/forgot-password`);
    console.log(`   POST /api/auth/reset-password`);
    console.log(`   GET  /api/auth/me\n`);
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
