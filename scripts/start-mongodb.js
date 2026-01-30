const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🔍 Checking MongoDB...');

// Check if MongoDB is already running
const checkMongoDB = () => {
  return new Promise((resolve) => {
    const netstat = spawn('netstat', ['-an'], { shell: true });
    let output = '';
    
    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.on('close', (code) => {
      const isRunning = output.includes(':27017') || output.includes('27017');
      resolve(isRunning);
    });
  });
};

const startMongoDB = async () => {
  const isRunning = await checkMongoDB();
  
  if (isRunning) {
    console.log('✅ MongoDB is already running on port 27017');
    return;
  }

  console.log('⚠️  MongoDB is not running.');
  console.log('\n📝 To start MongoDB:');
  console.log('\n  Windows:');
  console.log('    - If installed as service: MongoDB should start automatically');
  console.log('    - Manual start: net start MongoDB');
  console.log('    - Or run: "C:\\Program Files\\MongoDB\\Server\\<version>\\bin\\mongod.exe"');
  console.log('\n  macOS (Homebrew):');
  console.log('    brew services start mongodb-community');
  console.log('\n  Linux:');
  console.log('    sudo systemctl start mongod');
  console.log('    or');
  console.log('    sudo service mongod start');
  console.log('\n  Or use MongoDB Atlas (cloud):');
  console.log('    https://www.mongodb.com/cloud/atlas');
  console.log('    Update MONGODB_URI in .env file');
  console.log('\n💡 Tip: You can also use MongoDB Atlas (free tier) for cloud hosting');
};

startMongoDB();
