# NearCart Deployment Guide

## Overview

| Service   | Platform  | URL (after deploy)              |
|-----------|-----------|----------------------------------|
| Backend   | Railway   | https://your-app.up.railway.app |
| Web       | Vercel    | https://nearcart-web.vercel.app |
| Mobile    | APK file  | Local install / Play Store      |

---

## 1. Deploy Backend to Railway

### Step 1 — Push to GitHub
Make sure the latest code is pushed to GitHub.

### Step 2 — Create Railway project
1. Go to https://railway.app and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `nearcart` repository
4. Choose the **`backend`** folder (set root directory to `/backend`)

### Step 3 — Add services
In your Railway project, add these services:
- **PostgreSQL** — click Add Service → Database → PostgreSQL
- **Redis** — click Add Service → Database → Redis

### Step 4 — Set environment variables
In your backend service, go to **Variables** tab and add:

```
DATABASE_URL          = (auto-filled from PostgreSQL service)
REDIS_URL             = (auto-filled from Redis service)
JWT_SECRET            = (generate: openssl rand -base64 64)
JWT_REFRESH_SECRET    = (generate: openssl rand -base64 64)
JWT_EXPIRES_IN        = 15m
JWT_REFRESH_EXPIRES_IN= 7d
STRIPE_SECRET_KEY     = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
CLOUDINARY_CLOUD_NAME = ...
CLOUDINARY_API_KEY    = ...
CLOUDINARY_API_SECRET = ...
FIREBASE_SERVICE_ACCOUNT_JSON = {...}
CLIENT_URL            = https://your-vercel-app.vercel.app
PORT                  = 3000
NODE_ENV              = production
```

### Step 5 — Deploy
Railway will auto-deploy. The `nixpacks.toml` file handles:
- Node 20 install
- `npm ci`
- `prisma generate`
- `prisma migrate deploy` on start

### Step 6 — Copy your Railway URL
After deploy, copy the domain (e.g., `nearcart-production.up.railway.app`)

---

## 2. Deploy Web to Vercel

### Step 1 — Import project
1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project** → Import `nearcart` repo
3. Set **Root Directory** to `web`
4. Framework: **Vite**

### Step 2 — Set environment variables
In Vercel project settings → Environment Variables:

```
VITE_API_URL    = https://YOUR-RAILWAY-URL/api
VITE_SOCKET_URL = https://YOUR-RAILWAY-URL
```

### Step 3 — Deploy
Click Deploy. Vercel auto-builds with `npm run build`.

### Step 4 — Update Railway CORS
After getting your Vercel URL, go back to Railway and update:
```
CLIENT_URL = https://your-app.vercel.app
```

---

## 3. Build Flutter Release APK

### Step 1 — Update config.dart
Open `mobile/lib/core/config.dart` and change:
```dart
static const bool _isDev = false;   // Switch to production
static const String _prodApi    = 'https://YOUR-RAILWAY-URL/api';
static const String _prodSocket = 'https://YOUR-RAILWAY-URL';
```

### Step 2 — Update Stripe key
In `config.dart`, replace the test publishable key:
```dart
static const String stripePublishableKey = 'pk_live_...';  // or pk_test_...
```

### Step 3 — Build APK
```bash
cd mobile
flutter build apk --release
```

APK will be at: `mobile/build/app/outputs/flutter-apk/app-release.apk`

### Step 4 — Install on device
Transfer `app-release.apk` to Android device and install.

---

## 4. After Deployment — Seed Categories

After backend is live, run to seed initial categories:
```bash
# From your local machine with DATABASE_URL set to Railway's URL
cd backend
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## Environment Checklist

- [ ] Railway backend deployed and healthy (`/health` returns 200)
- [ ] PostgreSQL and Redis connected
- [ ] All env variables set in Railway
- [ ] Vercel web deployed with correct `VITE_API_URL`
- [ ] CORS updated in Railway with Vercel URL
- [ ] Flutter APK built with production URL
- [ ] Stripe webhooks configured for Railway URL
- [ ] Cloudinary credentials set
