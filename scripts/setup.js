const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up VICKYEXCHANGE...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created');
  } else {
    // Create default .env
    const defaultEnv = `# Server Configuration
PORT=3000
HOSTNAME=localhost
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vickyexchange

# JWT Configuration
JWT_SECRET=${require('crypto').randomBytes(32).toString('hex')}
JWT_EXPIRE=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ .env file created with default values');
  }
  
  console.log('\n⚠️  Please review and update .env file with your configuration');
} else {
  console.log('✅ .env file already exists');
}

// Check MongoDB
console.log('\n🔍 Checking MongoDB connection...');
const { spawn } = require('child_process');
const mongodbCheck = spawn('node', [path.join(__dirname, 'start-mongodb.js')]);
mongodbCheck.stdout.pipe(process.stdout);
mongodbCheck.stderr.pipe(process.stderr);

mongodbCheck.on('close', () => {
  console.log('\n✅ Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Review .env file and update if needed');
  console.log('   2. Make sure MongoDB is running');
  console.log('   3. Run: npm run dev');
  console.log('   4. Optional: npm run seed (to seed initial data)');
});
