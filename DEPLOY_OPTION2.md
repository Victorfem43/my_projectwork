# Option 2: Frontend on Vercel + Backend on Railway (or Render)

This guide gets your **API** running on Railway (or Render) and your **frontend** on Vercel, so admin login and all API calls work from sieger.it.com.

---

## Part 1: Deploy the API to Railway

### 1. Sign up and create a project

1. Go to **[railway.app](https://railway.app)** and sign in (GitHub is easiest).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your **Vickyexchange** repo (the one with this project).
4. Railway will detect the repo and ask what to deploy.

### 2. Configure the service (use the **backend** folder)

1. After the repo is connected, open the new **service**.
2. Go to **Settings**.
3. Set **Root Directory** to **`backend`** (important: this must be `backend`, not blank and not `frontend`).
   - With Root Directory = `backend`, Railway deploys only the `backend` folder, so `/app` contains `server.js` and the API runs correctly.
4. Set **Build Command** to **`npm install`** (or leave empty).
5. Set **Start Command** to **`node server.js`** (or **`npm start`**).
6. Save and redeploy.

There is a **`backend/railway.json`** in the repo that sets the start command; if Railway picks it up, you may only need to set **Root Directory** to **`backend`**.

### 3. Add environment variables

In the same service, go to **Variables** and add at least:

| Variable        | Value / Notes |
|----------------|----------------|
| `PORT`         | Railway sets this automatically; you can leave it or set e.g. `5000`. |
| `MONGODB_URI`  | Your MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) – create a free cluster and get the URI). |
| `JWT_SECRET`   | A long random string (e.g. from `openssl rand -hex 32`). |
| `NODE_ENV`     | `production` |

Add any others your app uses (Stripe, PayPal, Coinbase, etc.) from your local `.env` or `backend/.env`. **Do not commit real secrets to the repo** – only set them in Railway (and later in Vercel where needed).

### 4. Deploy and get the API URL

1. Save settings; Railway will build and deploy.
2. In the service, open **Settings** → **Networking** → **Generate Domain** (or use the default one).
3. You’ll get a URL like:  
   `https://vickyexchange-api-production-xxxx.up.railway.app`
4. Your **API base URL** is that URL + `/api`, e.g.:  
   `https://vickyexchange-api-production-xxxx.up.railway.app/api`

Check it in the browser or with curl:

```bash
curl https://YOUR-RAILWAY-URL/api/health
```

You should see something like: `{"status":"OK","message":"VICKYEXCHANGE API",...}`.

### 5. Create admin user in the production database (required for admin login)

The 401 "Invalid credentials" on admin login usually means **no admin user exists in the database Railway uses**. Create it once:

1. **Get the production MongoDB URI**  
   In Railway: your backend service → **Variables** → copy `MONGODB_URI` (e.g. from MongoDB Atlas).

2. **Run the create-admin script against that database** (from your project root):
   ```bash
   # Windows (PowerShell)
   $env:MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/yourdb"
   node backend/scripts/create-admin.js

   # Or use backend/.env: put MONGODB_URI=your_production_uri in backend/.env, then:
   cd backend
   node scripts/create-admin.js
   ```
   Use the **exact same** `MONGODB_URI` as in Railway. The script creates/updates the admin user in that DB.

3. **Admin credentials** (from the script):
   - Email: `victorfem7@gmail.com`
   - Password: `20262026`

4. Log in at your site’s `/admin/login` with those credentials. If your Railway DB is the same as local (e.g. same Atlas URI), the admin you created locally is already there; if Railway uses a **new/empty** DB, you must run the script once with that DB’s URI.

---

## Part 2: Point the Vercel frontend to the API

### 1. Open Vercel project settings

1. Go to **[vercel.com](https://vercel.com)** and open the project that serves **sieger.it.com** (your frontend).
2. Go to **Settings** → **Environment Variables**.

### 2. Add the API URL

1. Click **Add** (or **Add New**).
2. **Name:** `NEXT_PUBLIC_API_URL`  
   **Value:** your Railway API base URL, e.g.  
   `https://vickyexchange-api-production-xxxx.up.railway.app/api`  
   (Must end with `/api`.)
3. Choose **Production** (and optionally Preview/Development if you use them).
4. Save.

### 3. Redeploy the frontend

1. Go to **Deployments**.
2. Open the **⋯** menu on the latest deployment → **Redeploy** (or push a new commit to trigger a deploy).

After the redeploy, the frontend will call your Railway API for login and all other requests. Admin login at sieger.it.com/admin/login should work.

---

## Part 3: CORS (if needed)

The API server already uses `cors()` with no origin restriction, so requests from sieger.it.com are allowed. If you later restrict CORS, add your frontend origin, e.g. `https://sieger.it.com`.

---

## Summary

| Where        | What runs                         | URL example |
|-------------|------------------------------------|-------------|
| **Vercel**  | Next.js frontend (this repo, root dir = `frontend`) | `https://sieger.it.com` |
| **Railway** | API only (`node server-api-only.js`)               | `https://xxx.up.railway.app` |
| **Vercel env** | `NEXT_PUBLIC_API_URL` = Railway URL + `/api`   | `https://xxx.up.railway.app/api` |

---

## Alternative: Render instead of Railway

1. Go to **[render.com](https://render.com)** → **New** → **Web Service**.
2. Connect your GitHub repo (same Vickyexchange repo).
3. **Build Command:** `npm install`
4. **Start Command:** `node server-api-only.js`
5. Add the same environment variables (e.g. `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`).
6. Deploy; Render will give you a URL like `https://vickyexchange-api.onrender.com`.
7. In Vercel, set `NEXT_PUBLIC_API_URL` to `https://vickyexchange-api.onrender.com/api` and redeploy.

---

## Local test before deploying

To simulate Option 2 locally:

1. Start the API only: `npm run start:api` (runs on port 5000 by default).
2. In the frontend folder, set in `.env.local`:  
   `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
3. Run the frontend: `cd frontend && npm run dev`.
4. Open `http://localhost:3000` and try admin login; it should hit the API on port 5000.
