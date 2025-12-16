# ✅ Cloud Deployment Checklist

**Use this checklist to ensure a successful deployment**

---

## 📋 Pre-Deployment

### Repository Setup
- [ ] Code is pushed to GitHub
- [ ] `render.yaml` is in repository root
- [ ] `vercel.json` is in `frontend/` directory
- [ ] `.github/workflows/ci.yml` exists
- [ ] All environment variables documented

### Accounts Setup
- [ ] Supabase account created
- [ ] Render account created
- [ ] Vercel account created
- [ ] GitHub repository accessible

---

## 🗄️ Database Setup (Supabase)

### Create Project
- [ ] Supabase project created
- [ ] Region selected (closest to users)
- [ ] Database password saved securely
- [ ] Project URL noted

### Run Migration
- [ ] Connection string obtained
- [ ] Migration file ready (`setup_db.sql` or `supabase_migration.sql`)
- [ ] Migration run successfully
- [ ] Tables verified in Supabase dashboard

### Verify Database
- [ ] Can connect to database
- [ ] Tables exist (users, locations, vpn_configs, etc.)
- [ ] Connection string format correct

---

## 🖥️ Backend Deployment (Render)

### Initial Setup
- [ ] GitHub repository connected to Render
- [ ] `render.yaml` auto-detected (or manually configured)
- [ ] Service name: `nexusvpn-api`
- [ ] Root directory: repository root (render.yaml handles backend/)

### Database Configuration
- [ ] Database linked in Render (or `DATABASE_URL` set manually)
- [ ] Connection string verified

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000` (or Render default)
- [ ] `DATABASE_URL` set (or linked database)
- [ ] `JWT_SECRET` set (auto-generated if using render.yaml)
- [ ] `FRONTEND_URL` set (update after Vercel deploy)
- [ ] `CORS_ORIGIN` set (update after Vercel deploy)
- [ ] `MOCK_SSH=true` (for cloud deployment)

### Build & Deploy
- [ ] Build command verified: `cd backend && npm install && npm run build`
- [ ] Start command verified: `cd backend && npm run start:prod`
- [ ] Deployment started
- [ ] Build completed successfully
- [ ] Service is running

### Verify Backend
- [ ] Health endpoint works: `https://your-backend.onrender.com/`
- [ ] Returns: `{"message":"NexusVPN API is running"}`
- [ ] No errors in Render logs
- [ ] Backend URL noted for frontend config

---

## 🎨 Frontend Deployment (Vercel)

### Initial Setup
- [ ] GitHub repository imported to Vercel
- [ ] Root directory set to: `frontend`
- [ ] Framework preset: Vite (auto-detected)

### Build Configuration
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `dist` (default)
- [ ] Node version: 20.x (auto-detected)

### Environment Variables
- [ ] `VITE_API_URL` set to: `https://your-backend.onrender.com/api`
- [ ] Must include `/api` at the end
- [ ] Must use `https://` not `http://`

### Deploy
- [ ] Deployment started
- [ ] Build completed successfully
- [ ] Frontend accessible
- [ ] Frontend URL noted: `https://your-app.vercel.app`

---

## 🔄 Post-Deployment Configuration

### Update Backend CORS
- [ ] Go to Render dashboard → Your service → Environment
- [ ] Update `FRONTEND_URL` to exact Vercel URL
- [ ] Update `CORS_ORIGIN` to match `FRONTEND_URL`
- [ ] Backend redeployed (automatic or manual)

### Verify CORS
- [ ] Open frontend in browser
- [ ] Open browser console (F12)
- [ ] No CORS errors visible
- [ ] API calls work from frontend

---

## 🧪 Testing & Verification

### Backend Tests
- [ ] Health endpoint: `curl https://your-backend.onrender.com/`
- [ ] API health: `curl https://your-backend.onrender.com/api/health`
- [ ] No errors in Render logs
- [ ] Database connection working

### Frontend Tests
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] No console errors
- [ ] No build errors
- [ ] All pages accessible

### Integration Tests
- [ ] Frontend can connect to backend
- [ ] API calls succeed
- [ ] No CORS errors
- [ ] Login flow works

### Admin Access
- [ ] Admin user exists (seed service or manual)
- [ ] Can login with: `admin@nexusvpn.com` / `password`
- [ ] Admin panel accessible: `/admin`
- [ ] Can view users, servers, statistics

### Run Test Script
- [ ] Execute: `./infrastructure/test-cloud-deployment.sh`
- [ ] All tests pass
- [ ] No critical failures

---

## 🔐 Security Checklist

### Immediate
- [ ] Admin password changed from default
- [ ] `JWT_SECRET` is strong and unique
- [ ] Database password is secure
- [ ] HTTPS enabled (automatic on Vercel/Render)

### Configuration
- [ ] CORS properly configured
- [ ] Environment variables not exposed in frontend
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info

### Best Practices
- [ ] Secrets stored in platform dashboards (not in code)
- [ ] Different secrets for each environment
- [ ] Regular security updates planned

---

## 📊 Monitoring Setup

### Logs
- [ ] Render logs accessible
- [ ] Vercel logs accessible
- [ ] Supabase logs accessible
- [ ] Know where to check for errors

### Monitoring (Optional)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring setup
- [ ] Performance monitoring enabled
- [ ] Alerts configured

---

## 🎯 Post-Deployment Tasks

### Immediate (Required)
- [ ] Change admin password
- [ ] Test all critical flows
- [ ] Verify database backups
- [ ] Document deployment URLs

### Short-term (Recommended)
- [ ] Setup custom domain
- [ ] Configure email service
- [ ] Setup Stripe payments (if needed)
- [ ] Configure monitoring

### Long-term (Optional)
- [ ] Setup staging environment
- [ ] Implement CI/CD auto-deployment
- [ ] Performance optimization
- [ ] Scaling configuration

---

## 📝 Documentation

### Deployment Info Recorded
- [ ] Backend URL: `https://________________.onrender.com`
- [ ] Frontend URL: `https://________________.vercel.app`
- [ ] Database connection string saved securely
- [ ] Admin credentials changed and saved securely

### Documentation Updated
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Troubleshooting steps known
- [ ] Team members have access info

---

## ✅ Final Verification

### All Systems Operational
- [ ] Backend: ✅ Running
- [ ] Frontend: ✅ Running
- [ ] Database: ✅ Connected
- [ ] CORS: ✅ Configured
- [ ] Authentication: ✅ Working
- [ ] Admin Panel: ✅ Accessible

### Ready for Production
- [ ] All tests passing
- [ ] No critical errors
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Documentation complete

---

## 🎉 Deployment Complete!

**Date Completed**: _______________

**Deployed By**: _______________

**Backend URL**: _______________

**Frontend URL**: _______________

**Notes**: 
_________________________________
_________________________________
_________________________________

---

**Use this checklist to ensure nothing is missed during deployment!**

---

**Last Updated**: 2025-01-15

