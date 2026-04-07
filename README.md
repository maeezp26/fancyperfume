# 🌸 Fancy Perfume — Setup Guide

## ⚡ Run Locally (do this FIRST time setup)

### Step 1 — Add your Cloudinary secret
Open `back/.env` and replace `YOUR_REAL_SECRET_FROM_CLOUDINARY_DASHBOARD` with your actual
Cloudinary API Secret from: https://cloudinary.com → Dashboard → API Keys

### Step 2 — Start the backend
Double-click **START BACKEND.bat** (waits for "Server running" message)

### Step 3 — Start the frontend (new terminal)
Double-click **START FRONTEND.bat**

### Step 4 — Open browser
Go to: **http://localhost:5173**

---

## 🚀 Deploy to Production

### Backend → Render
1. Go to Render → your service → **Settings**
2. Change **Build Command** to: `rm -rf node_modules && npm install --legacy-peer-deps`
3. Add ALL environment variables from `back/.env` in Render → **Environment** tab
4. **Save + Manual Deploy**

### Frontend → Vercel
1. Edit `front/.env`:
   - Comment out: `VITE_API_URL=http://localhost:5000`
   - Uncomment: `VITE_API_URL=https://fancyperfume.onrender.com`
2. Push to GitHub → Vercel auto-deploys

---

## 🔑 Make yourself Admin
Go to MongoDB Atlas → Collections → users → find your user → change `role` from `"user"` to `"admin"`

---

## ❌ Common Errors

| Error | Fix |
|-------|-----|
| 404 on all API calls | Backend not running — start it first |
| Images not uploading | Add real CLOUDINARY_API_SECRET to back/.env |
| Login 404 | Backend not running |
| "Cannot find module" on Render | Change Build Command in Render Dashboard (see above) |
