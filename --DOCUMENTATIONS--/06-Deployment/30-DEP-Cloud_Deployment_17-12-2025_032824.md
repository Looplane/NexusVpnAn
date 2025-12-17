# Cloud Deployment Guide: NexusVPN

**Document ID:** DEP-CLOUD-001  
**Created:** 17-12-2025 | Time: 03:28:24  
**Last Updated:** 17-12-2025 | Time: 03:28:24  
**Agent:** `backend-nexusvpn-specialist` (Backend Specialist Agent)  
**Status:** ✅ Active

**Related Documents:**
- @--DOCUMENTATIONS--/06-Deployment/27-DEP-Deployment_Checklist_17-12-2025_032824.md (1-272)
- @--DOCUMENTATIONS--/06-Deployment/31-DEP-Render_Deploy_17-12-2025_032824.md (1-101)
- @--DOCUMENTATIONS--/06-Deployment/32-DEP-Vercel_Deploy_17-12-2025_032824.md (1-80)

---

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

**Option A: Using render.yaml (Recommended)**
1. Connect GitHub repository to Render
2. Render will automatically detect `render.yaml` in the root
3. All configuration (build commands, env vars) will be loaded automatically

**Option B: Manual Setup**
1. Connect GitHub repository
2. Select `backend` directory as root
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm run start:prod`

### Step 2: Environment Variables
Set these in Render dashboard under "Environment" tab:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://nexus:password@dpg-xxxxx-a.oregon-postgres.render.com/nexusvpn
JWT_SECRET=<generate-random-32-char-string>
FRONTEND_URL=https://nexusvpn.vercel.app
CORS_ORIGIN=https://nexusvpn.vercel.app
MOCK_SSH=true
STRIPE_SECRET_KEY=sk_live_xxxxx (optional)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (optional)
```

**Note:** The `DATABASE_URL` is automatically set when you link the database in Render. You can also use the `render.yaml` file which includes all these variables.

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

*Last updated: 17-12-2025 | Time: 03:28:24*

