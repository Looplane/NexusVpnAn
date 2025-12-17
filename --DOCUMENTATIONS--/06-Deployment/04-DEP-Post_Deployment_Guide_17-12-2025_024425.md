# 🎯 Post-Deployment Guide

**Complete guide for verifying and testing your cloud deployment**

---

## ✅ Deployment Verification Checklist

### 1. Backend Health Check

```bash
# Test backend health endpoint
curl https://nexusvpn-api.onrender.com/

# Expected response:
# {"message":"NexusVPN API is running"}
```

**If failed:**
- Check Render logs: Dashboard → Your service → Logs
- Verify `PORT` environment variable is set (should be 10000)
- Check if database connection is working

---

### 2. Frontend Accessibility

```bash
# Test frontend
curl -I https://nexusvpn.vercel.app

# Expected: HTTP 200 OK
```

**If failed:**
- Check Vercel deployment logs
- Verify build completed successfully
- Check if `VITE_API_URL` is set correctly

---

### 3. API Connection Test

1. Open frontend in browser: `https://nexusvpn.vercel.app`
2. Open browser console (F12)
3. Check for errors:
   - ❌ CORS errors → Update `CORS_ORIGIN` in Render
   - ❌ Network errors → Check `VITE_API_URL` in Vercel
   - ❌ 404 errors → Verify backend is deployed

---

### 4. Database Connection

**Check Render Logs:**
- Go to Render dashboard → Your service → Logs
- Look for: "Database connection established" or similar
- ❌ If you see connection errors:
  - Verify `DATABASE_URL` is correct
  - Check Supabase project is active
  - Verify IP whitelist (if applicable)

**Test Database:**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM locations;
```

---

## 🔐 Admin User Setup

### Default Admin Credentials

After deployment, the backend seed service should create:
- **Email**: `admin@nexusvpn.com`
- **Password**: `password`

### Verify Admin User Exists

**Option 1: Using Supabase SQL Editor**
```sql
SELECT email, role, plan, "fullName" 
FROM users 
WHERE email = 'admin@nexusvpn.com';
```

**Option 2: Using API**
```bash
curl -X POST https://nexusvpn-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexusvpn.com","password":"password"}'
```

### Create Admin User Manually (If Needed)

**Using Supabase SQL Editor:**
```sql
-- Hash password: "password" using bcrypt
-- You can use an online bcrypt generator or Node.js

-- Example (replace with actual hash):
INSERT INTO users (email, password_hash, full_name, role, plan, is_active)
VALUES (
  'admin@nexusvpn.com',
  '$2b$10$rKZvVxwJ5vZ5vZ5vZ5vZ5OqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK',
  'Admin User',
  'admin',
  'pro',
  true
) ON CONFLICT (email) DO NOTHING;
```

**Or use Node.js to generate hash:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password', 10).then(h => console.log(h));"
```

---

## 🧪 Testing Deployment

### 1. Test Login Flow

1. Go to: `https://nexusvpn.vercel.app/#/login`
2. Enter credentials:
   - Email: `admin@nexusvpn.com`
   - Password: `password`
3. Click "Login"
4. Should redirect to dashboard

**If login fails:**
- Check browser console for errors
- Verify backend API is accessible
- Check if admin user exists in database
- Verify JWT_SECRET is set in Render

---

### 2. Test Dashboard

After login, verify:
- [ ] Dashboard loads without errors
- [ ] Widgets display (Active Devices, Data Usage, etc.)
- [ ] Navigation works
- [ ] No console errors

---

### 3. Test Admin Panel

1. Navigate to: `https://nexusvpn.vercel.app/#/admin`
2. Verify:
   - [ ] Admin panel loads
   - [ ] Can view users
   - [ ] Can view servers
   - [ ] Can view statistics

**If admin panel doesn't load:**
- Verify user role is 'admin' in database
- Check backend logs for authorization errors
- Verify JWT token is being sent with requests

---

### 4. Test API Endpoints

```bash
# Health check
curl https://nexusvpn-api.onrender.com/api/health

# Login (get token)
TOKEN=$(curl -X POST https://nexusvpn-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexusvpn.com","password":"password"}' \
  | jq -r '.accessToken')

# Test authenticated endpoint
curl https://nexusvpn-api.onrender.com/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Common Issues & Solutions

### Issue: CORS Errors

**Symptoms:**
- Browser console shows: "CORS policy blocked"
- API calls fail with CORS errors

**Solution:**
1. Go to Render dashboard → Your service → Environment
2. Update `FRONTEND_URL` to exact Vercel URL (with https://)
3. Update `CORS_ORIGIN` to match `FRONTEND_URL`
4. Redeploy backend (automatic or manual)

---

### Issue: Backend Won't Start

**Symptoms:**
- Render shows "Deploy failed" or service won't start
- Logs show errors

**Check:**
1. **Database Connection:**
   - Verify `DATABASE_URL` is correct
   - Test connection string format
   - Check Supabase project is active

2. **Environment Variables:**
   - Verify `JWT_SECRET` is set
   - Check `PORT` is set (10000 for Render)
   - Verify `NODE_ENV=production`

3. **Build Errors:**
   - Check build logs in Render
   - Verify `package.json` scripts are correct
   - Check for TypeScript errors

---

### Issue: Frontend Can't Connect to Backend

**Symptoms:**
- Frontend loads but API calls fail
- Network errors in browser console

**Solution:**
1. Verify `VITE_API_URL` in Vercel:
   - Should be: `https://nexusvpn-api.onrender.com/api`
   - Must include `/api` at the end
   - Must use `https://` not `http://`

2. Test backend directly:
   ```bash
   curl https://nexusvpn-api.onrender.com/
   ```

3. Check CORS configuration (see above)

---

### Issue: Admin User Not Created

**Symptoms:**
- Can't login with admin credentials
- User doesn't exist in database

**Solution:**
1. Check if seed service ran:
   - Look in Render logs for "Seeding Users..."
   - Seed service runs on backend startup

2. Create admin manually:
   - Use Supabase SQL Editor
   - Insert user with hashed password
   - Set role to 'admin'

3. Or use API to register:
   ```bash
   curl -X POST https://nexusvpn-api.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@nexusvpn.com","password":"password","fullName":"Admin"}'
   ```
   Then update role to admin in database.

---

### Issue: Database Migration Failed

**Symptoms:**
- Tables don't exist
- Database errors in logs

**Solution:**
1. Go to Supabase SQL Editor
2. Run `setup_db.sql` or `supabase_migration.sql`
3. Verify tables were created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

## 📊 Monitoring & Logs

### Render Backend Logs
- **Location**: Render dashboard → Your service → Logs
- **What to check:**
  - Database connection messages
  - Application startup messages
  - Error messages
  - API request logs

### Vercel Frontend Logs
- **Location**: Vercel dashboard → Your project → Deployments → [Deployment] → Logs
- **What to check:**
  - Build logs
  - Runtime errors
  - Function logs (if using serverless functions)

### Supabase Database Logs
- **Location**: Supabase dashboard → Logs
- **What to check:**
  - Query performance
  - Connection errors
  - Slow queries

---

## 🔒 Security Checklist

After deployment, verify:

- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] `JWT_SECRET` is strong and unique
- [ ] Database password is secure
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed in frontend
- [ ] Admin password is changed from default
- [ ] Rate limiting is working
- [ ] Error messages don't leak sensitive info

---

## 🚀 Performance Optimization

### Backend (Render)
- Monitor CPU and memory usage
- Consider upgrading plan if needed
- Enable auto-scaling if available

### Frontend (Vercel)
- Check build size
- Verify images are optimized
- Check Core Web Vitals in Vercel Analytics

### Database (Supabase)
- Monitor connection pool usage
- Check query performance
- Add indexes if needed

---

## 📝 Post-Deployment Tasks

### Immediate (Required)
- [ ] Verify all services are running
- [ ] Test login flow
- [ ] Change admin password
- [ ] Verify database connection
- [ ] Check CORS configuration

### Short-term (Recommended)
- [ ] Setup error tracking (Sentry, etc.)
- [ ] Configure monitoring alerts
- [ ] Setup database backups
- [ ] Add custom domain
- [ ] Configure email service

### Long-term (Optional)
- [ ] Setup CI/CD for auto-deployment
- [ ] Configure staging environment
- [ ] Setup performance monitoring
- [ ] Implement logging aggregation
- [ ] Configure CDN for static assets

---

## 🆘 Getting Help

### Check Logs First
1. Render backend logs
2. Vercel deployment logs
3. Browser console errors
4. Supabase database logs

### Common Resources
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

### Project Documentation
- `QUICK_CLOUD_DEPLOYMENT.md` - Deployment steps
- `CLOUD_DEPLOYMENT.md` - Detailed guide
- `ENV_TEMPLATE.md` - Environment variables

---

**✅ Your deployment is complete! Follow this guide to verify everything is working correctly.**

---

**Last Updated**: 2025-01-15

