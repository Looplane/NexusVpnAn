# Cloud Deployment Guide: NexusVPN

## 🎯 Objective
Deploy NexusVPN to production using:
- **Database:** Supabase (PostgreSQL)
- **Backend:** Render or Railway
- **Frontend:** Vercel

---

## 📋 Prerequisites
- GitHub repository with latest code
- Supabase account
- Vercel account
- Render/Railway account

---

## 1️⃣ Database: Supabase Setup

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region (closest to users)
4. Save database password

### Step 2: Get Connection String
```
postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Step 3: Run Migrations
```bash
# From local machine
psql "postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" < setup_db.sql
```

---

## 2️⃣ Backend: Render Deployment

### Step 1: Create Web Service
1. Connect GitHub repository
2. Select `backend` directory as root
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`

### Step 2: Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=[GENERATE_RANDOM_STRING]
CORS_ORIGIN=https://nexusvpn.vercel.app
MOCK_SSH=true
```

### Step 3: Health Check
- Path: `/`
- Expected: `{"message":"NexusVPN API is running"}`

---

## 3️⃣ Frontend: Vercel Deployment

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub
3. Select `frontend` as root directory

### Step 2: Build Settings
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 3: Environment Variables
```env
VITE_API_URL=https://nexusvpn-api.onrender.com/api
```

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Test at `https://nexusvpn.vercel.app`

---

## 4️⃣ Post-Deployment Checklist

- [ ] Test login flow
- [ ] Verify database connection
- [ ] Check CORS configuration
- [ ] Test API endpoints
- [ ] Monitor logs for errors

---

## 🔒 Security Notes

1. **Never commit secrets** to git
2. Use environment variables for all sensitive data
3. Enable HTTPS only (automatic on Vercel/Render)
4. Rotate JWT secret regularly

---

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` format
- Verify all env vars are set
- Check Render logs

### Frontend can't reach API
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and healthy

### Database connection fails
- Verify Supabase project is active
- Check connection string format
- Ensure IP whitelist allows Render's IPs (or set to `0.0.0.0/0`)

---

## 📊 Monitoring

- **Backend:** Render dashboard
- **Frontend:** Vercel analytics
- **Database:** Supabase dashboard
- **Errors:** Check application logs

---

*Last updated: 2025-12-15*
