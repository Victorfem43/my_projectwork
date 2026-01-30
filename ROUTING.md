# Routing Structure

## Application Routes

### User Application (Port 3000 - Root)
All user-facing routes are accessible at the root level:

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset
- `/dashboard` - User dashboard
- `/wallet` - Wallet management
- `/trade/crypto` - Crypto trading
- `/trade/giftcards` - Gift card trading
- `/buy` - Buy page
- `/sell` - Sell page
- `/transactions` - Transaction history
- `/settings` - User settings
- `/support` - Support tickets

### Admin Application (Port 3000 - /admin)
All admin routes are prefixed with `/admin`:

- `/admin` - Admin dashboard (main admin page)
- `/admin/login` - Admin login page
- `/admin/users` - User management
- `/admin/trades` - Trade management
- `/admin/transactions` - All transactions
- `/admin/giftcards` - Gift card management
- `/admin/wallets` - Wallet management
- `/admin/support` - Support ticket management

### API Routes (Port 3000 - /api)
All API endpoints are prefixed with `/api`:

- `/api/health` - Health check
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User endpoints
- `/api/wallets/*` - Wallet endpoints
- `/api/crypto/*` - Crypto trading endpoints
- `/api/giftcards/*` - Gift card endpoints
- `/api/transactions/*` - Transaction endpoints
- `/api/admin/*` - Admin endpoints

## Route Differentiation

- **User Routes**: `http://localhost:3000/*` (except `/admin/*` and `/api/*`)
- **Admin Routes**: `http://localhost:3000/admin/*`
- **API Routes**: `http://localhost:3000/api/*`

## Navigation

- User navbar shows regular user navigation
- Admin navbar (shown on `/admin/*` routes) shows admin-specific navigation
- Admin navbar includes a "User App" link to return to the main application
- User navbar includes an "Admin" link (only visible to admin users)

## Access Control

- User routes require authentication (except public pages)
- Admin routes require authentication AND admin role
- `/admin/login` is accessible without authentication
- Admin layout automatically redirects non-admin users to `/dashboard`
