const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://victorfem7_db_user:Victorfem21@cluster0.vhldqzk.mongodb.net/?appName=Cluster0');
    console.log('✅ MongoDB Connected');

    const adminEmail = 'victorfem7@gmail.com';
    const adminPassword = '20262026';
    const adminName = 'Admin';

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      // Update existing admin
      admin.name = adminName;
      admin.password = adminPassword; // Will be hashed by pre-save hook
      admin.role = 'admin';
      admin.isVerified = true;
      admin.isBlocked = false;
      await admin.save();
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        role: 'admin',
        isVerified: true,
        isBlocked: false
      });
      console.log('✅ Admin user created successfully');

      // Create wallet for admin if it doesn't exist
      const walletExists = await Wallet.findOne({ user: admin._id });
      if (!walletExists) {
        await Wallet.create({ user: admin._id });
        console.log('✅ Admin wallet created');
      }
    }

    console.log('\n📧 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Verified: ${admin.isVerified}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
