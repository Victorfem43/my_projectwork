# Quick Start Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for:
- Root package (concurrently)
- Backend (Express, MongoDB, etc.)
- Frontend (Next.js, React, etc.)

### 2. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret string for JWT tokens
- Other optional settings

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and set:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000/api)

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Just update MONGODB_URI in backend/.env
```

### 4. Seed Initial Data (Optional)

```bash
cd backend
npm run seed
```

This will create:
- Sample crypto assets (BTC, ETH, USDT, BNB)
- Sample gift cards (Amazon, Apple, Google Play, etc.)

### 5. Start Development Servers

**Option 1: Run both servers together**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Creating an Admin Account

1. Register a regular account through the UI
2. Use MongoDB shell or Compass to update the user:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```
3. Log in with that account to access admin panel

## Default Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset

### User Routes (Authenticated)
- `/dashboard` - User dashboard
- `/wallet` - Wallet management
- `/trade/crypto` - Crypto trading
- `/trade/giftcards` - Gift card trading
- `/buy` - Buy page
- `/sell` - Sell page
- `/transactions` - Transaction history
- `/settings` - User settings
- `/support` - Support tickets

### Admin Routes (Admin Only)
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/trades` - Trade management
- `/admin/transactions` - All transactions
- `/admin/giftcards` - Gift card management
- `/admin/wallets` - Wallet management
- `/admin/support` - Support ticket management

## Testing the Application

1. **Register a new account** at `/register`
2. **Login** at `/login`
3. **View dashboard** at `/dashboard`
4. **Deposit funds** in wallet (for testing, use admin panel to fund wallet)
5. **Try trading** crypto or gift cards
6. **Check transactions** in the transactions page

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For MongoDB Atlas, whitelist your IP address

### Port Already in Use
- Backend uses port 5000, frontend uses 3000
- Change ports in `.env` files if needed

### CORS Errors
- Ensure backend CORS is configured correctly
- Check `NEXT_PUBLIC_API_URL` matches backend URL

### Build Errors
- Run `npm install` in both backend and frontend directories
- Clear `.next` folder: `rm -rf frontend/.next`
- Clear node_modules and reinstall if needed

## Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Set production environment variables
3. Use PM2 or similar for backend process management
4. Configure reverse proxy (nginx) for frontend
5. Set up MongoDB Atlas or production database
6. Configure Cloudinary for image uploads
7. Set up SSL certificates
8. Configure domain and DNS

## Support

For issues or questions, check the README.md or create a support ticket in the application.
