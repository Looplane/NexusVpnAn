# 🚀 Quick Cloud Deployment Guide

**Fast-track deployment to Render + Vercel + Supabase**

---

## ⚡ Quick Start (5 Steps)

### Step 1: Setup Supabase Database (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose region closest to your users
   - Save the database password

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the connection string:
     ```
     postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
     ```

3. **Run Database Migration**
   ```bash
   # From your local machine
   psql "postgres://postgres:[PASSWORD]@[HOST]:5432/postgres" < setup_db.sql
   ```
   
   **Or use Supabase SQL Editor:**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `setup_db.sql`
   - Paste and run

---

### Step 2: Deploy Backend to Render (10 minutes)

1. **Connect GitHub Repository**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

2. **Link Database**
   - In Render dashboard, go to your service
   - Click "Link Database" → Select "Create New PostgreSQL Database"
   - Or link existing Supabase database:
     - Add `DATABASE_URL` environment variable manually
     - Use your Supabase connection string

3. **Update Environment Variables** (if needed)
   - Go to Environment tab
   - Update `FRONTEND_URL` and `CORS_ORIGIN` after Vercel deployment
   - Set `JWT_SECRET` (auto-generated if using render.yaml)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (~5 minutes)
   - Note your backend URL: `https://nexusvpn-api.onrender.com`

---

### Step 3: Deploy Frontend to Vercel (5 minutes)

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select repository

2. **Configure Project**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)

3. **Set Environment Variable**
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://nexusvpn-api.onrender.com/api`
   - Replace with your actual Render backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build (~2 minutes)
   - Note your frontend URL: `https://nexusvpn.vercel.app`

---

### Step 4: Update Backend CORS (2 minutes)

1. **Update Render Environment Variables**
   - Go to Render dashboard → Your backend service
   - Environment tab
   - Update:
     - `FRONTEND_URL` = `https://nexusvpn.vercel.app` (your Vercel URL)
     - `CORS_ORIGIN` = `https://nexusvpn.vercel.app` (your Vercel URL)

2. **Redeploy** (automatic)
   - Render will automatically redeploy when env vars change
   - Or click "Manual Deploy" → "Deploy latest commit"

---

### Step 5: Verify Deployment (3 minutes)

1. **Test Backend**
   ```bash
   curl https://nexusvpn-api.onrender.com/
   # Expected: {"message":"NexusVPN API is running"}
   ```

2. **Test Frontend**
   - Open `https://nexusvpn.vercel.app` in browser
   - Should load without errors

3. **Test API Connection**
   - Open browser console (F12)
   - Check for CORS errors
   - Try logging in (use default admin credentials if seeded)

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] GitHub repository is up to date
- [ ] `render.yaml` is in repository root
- [ ] `vercel.json` is in `frontend/` directory
- [ ] `setup_db.sql` is ready

### Supabase Setup
- [ ] Supabase project created
- [ ] Database password saved
- [ ] Connection string obtained
- [ ] Database migration run (`setup_db.sql`)

### Render Backend
- [ ] GitHub repository connected
- [ ] Web service created
- [ ] Database linked (or `DATABASE_URL` set)
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Health check passing (`/` endpoint)

### Vercel Frontend
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] `VITE_API_URL` environment variable set
- [ ] Build successful
- [ ] Frontend accessible

### Post-Deployment
- [ ] Backend CORS updated with Vercel URL
- [ ] Backend redeployed
- [ ] Frontend can connect to backend
- [ ] No CORS errors in browser console
- [ ] Login flow works
- [ ] Database connection verified

---

## 🔧 Troubleshooting

### Backend Won't Start
- **Check Render logs**: Dashboard → Your service → Logs
- **Verify DATABASE_URL**: Must be valid PostgreSQL connection string
- **Check PORT**: Should be `10000` (Render default) or set in env vars
- **Verify JWT_SECRET**: Must be set (auto-generated in render.yaml)

### Frontend Can't Reach Backend
- **Check VITE_API_URL**: Must match your Render backend URL
- **Verify CORS**: Backend `CORS_ORIGIN` must match Vercel URL
- **Check browser console**: Look for CORS or network errors
- **Test backend directly**: `curl https://your-backend.onrender.com/`

### Database Connection Fails
- **Verify connection string**: Check format in Supabase dashboard
- **Check IP whitelist**: Supabase → Settings → Database → Connection Pooling
- **Test connection**: Use `psql` or Supabase SQL Editor
- **Check migration**: Ensure `setup_db.sql` ran successfully

### CORS Errors
- **Update FRONTEND_URL**: Must be exact Vercel URL (with https://)
- **Update CORS_ORIGIN**: Must match FRONTEND_URL
- **Redeploy backend**: Changes require redeploy
- **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

---

## 📊 Monitoring

### Render Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Request count
- **Events**: Deployments, restarts, errors

### Vercel Dashboard
- **Analytics**: Page views, performance
- **Deployments**: Build logs, deployment history
- **Functions**: Serverless function logs (if used)

### Supabase Dashboard
- **Database**: Query performance, connection pool
- **Logs**: Database queries, errors
- **API**: Auto-generated REST API

---

## 🎯 Next Steps After Deployment

1. **Setup Admin User**
   - Use Supabase SQL Editor to create admin user
   - Or use registration endpoint (if enabled)

2. **Configure Stripe** (Optional)
   - Add `STRIPE_SECRET_KEY` in Render dashboard
   - Add `STRIPE_WEBHOOK_SECRET` in Render dashboard
   - Update webhook URL in Stripe dashboard

3. **Setup Email Service** (Optional)
   - Add email env vars in Render dashboard
   - Configure SMTP settings

4. **Add Custom Domain** (Optional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domains
   - Update DNS records

5. **Enable Monitoring**
   - Setup error tracking (Sentry, etc.)
   - Configure uptime monitoring
   - Setup alerts

---

## 📝 Quick Reference

### Environment Variables Summary

**Render (Backend):**
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgres://...
JWT_SECRET=<auto-generated>
FRONTEND_URL=https://nexusvpn.vercel.app
CORS_ORIGIN=https://nexusvpn.vercel.app
MOCK_SSH=true
```

**Vercel (Frontend):**
```env
VITE_API_URL=https://nexusvpn-api.onrender.com/api
```

### URLs After Deployment

- **Frontend**: `https://nexusvpn.vercel.app`
- **Backend API**: `https://nexusvpn-api.onrender.com/api`
- **Backend Health**: `https://nexusvpn-api.onrender.com/`
- **Database**: Managed by Supabase/Render

---

**🎉 Your NexusVPN is now live in the cloud!**

**Total Deployment Time**: ~25 minutes

---

**Last Updated**: 2025-01-15

