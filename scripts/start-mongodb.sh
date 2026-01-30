#!/bin/bash

echo "🔍 Checking MongoDB status..."

# Check if MongoDB is running
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null 2>&1 || pgrep mongod > /dev/null 2>&1; then
    echo "✅ MongoDB is already running on port 27017"
    exit 0
fi

echo "⚠️  MongoDB is not running."
echo ""
echo "📝 To start MongoDB:"
echo ""
echo "  macOS (Homebrew):"
echo "    brew services start mongodb-community"
echo ""
echo "  Linux:"
echo "    sudo systemctl start mongod"
echo "    or"
echo "    sudo service mongod start"
echo ""
echo "  Or use MongoDB Atlas (cloud):"
echo "    https://www.mongodb.com/cloud/atlas"
echo "    Update MONGODB_URI in .env file"
echo ""
