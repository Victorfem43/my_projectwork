const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CryptoAsset = require('../models/CryptoAsset');
const GiftCard = require('../models/GiftCard');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vickyexchange');
    console.log('MongoDB Connected');

    // Clear existing data
    await CryptoAsset.deleteMany({});
    await GiftCard.deleteMany({});

    // Seed Crypto Assets
    const cryptoAssets = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 42350.00,
        change24h: 2.5,
        volume24h: 25000000000,
        isActive: true,
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2580.00,
        change24h: 1.8,
        volume24h: 12000000000,
        isActive: true,
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        price: 1.00,
        change24h: 0.0,
        volume24h: 50000000000,
        isActive: true,
      },
      {
        symbol: 'BNB',
        name: 'Binance Coin',
        price: 315.50,
        change24h: -0.5,
        volume24h: 1500000000,
        isActive: true,
      },
    ];

    await CryptoAsset.insertMany(cryptoAssets);
    console.log('Crypto assets seeded');

    // Seed Gift Cards
    const giftCards = [
      {
        brand: 'Amazon',
        type: 'E-Gift Card',
        faceValue: 100,
        buyRate: 95,
        sellRate: 85,
        isActive: true,
      },
      {
        brand: 'Apple',
        type: 'App Store & iTunes',
        faceValue: 100,
        buyRate: 92,
        sellRate: 82,
        isActive: true,
      },
      {
        brand: 'Google Play',
        type: 'Gift Card',
        faceValue: 100,
        buyRate: 90,
        sellRate: 80,
        isActive: true,
      },
      {
        brand: 'Steam',
        type: 'Wallet Code',
        faceValue: 100,
        buyRate: 88,
        sellRate: 78,
        isActive: true,
      },
      {
        brand: 'Netflix',
        type: 'Gift Card',
        faceValue: 100,
        buyRate: 85,
        sellRate: 75,
        isActive: true,
      },
      {
        brand: 'Spotify',
        type: 'Premium Gift Card',
        faceValue: 100,
        buyRate: 87,
        sellRate: 77,
        isActive: true,
      },
    ];

    await GiftCard.insertMany(giftCards);
    console.log('Gift cards seeded');

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
