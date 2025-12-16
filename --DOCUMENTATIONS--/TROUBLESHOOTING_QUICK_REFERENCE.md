# 🚨 Troubleshooting Quick Reference

**Quick solutions to common deployment issues**

---

## ⚡ Quick Fixes

### Backend Won't Start
```bash
# Check Render logs
Render Dashboard → Your Service → Logs

# Common fixes:
1. Verify DATABASE_URL is correct
2. Check JWT_SECRET is set
3. Ensure PORT=10000
4. Verify NODE_ENV=production
```

### Frontend Can't Connect to Backend
```bash
# Check:
1. VITE_API_URL includes /api at the end
2. Backend URL is correct (https://)
3. CORS is configured in backend
4. Backend is running and accessible
```

### CORS Errors
```bash
# Fix:
1. Update FRONTEND_URL in Render (exact Vercel URL)
2. Update CORS_ORIGIN to match
3. Redeploy backend
4. Clear browser cache (Ctrl+Shift+R)
```

### Database Connection Fails
```bash
# Check:
1. Connection string format is correct
2. Supabase project is active
3. IP whitelist allows connections
4. Database password is correct
```

---

## 🔍 Diagnostic Commands

### Test Backend
```bash
curl https://your-backend.onrender.com/
# Expected: {"message":"NexusVPN API is running"}
```

### Test Frontend
```bash
curl -I https://your-app.vercel.app
# Expected: HTTP 200 OK
```

### Test API
```bash
curl https://your-backend.onrender.com/api/health
# Expected: Health check response
```

### Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexusvpn.com","password":"password"}'
# Expected: {"accessToken":"..."}
```

---

## 🐛 Common Errors & Solutions

### Error: "Cannot connect to database"
**Solution:**
1. Verify `DATABASE_URL` format
2. Check Supabase project is active
3. Test connection in Supabase SQL Editor
4. Verify IP whitelist settings

### Error: "CORS policy blocked"
**Solution:**
1. Update `FRONTEND_URL` in Render
2. Update `CORS_ORIGIN` in Render
3. Ensure URLs match exactly (including https://)
4. Redeploy backend

### Error: "JWT_SECRET is required"
**Solution:**
1. Set `JWT_SECRET` in Render environment variables
2. Use strong random string (32+ characters)
3. Redeploy backend

### Error: "Build failed"
**Solution:**
1. Check build logs in Render/Vercel
2. Verify `package.json` scripts
3. Check for TypeScript errors
4. Ensure Node version is 20.x

### Error: "Environment variable not found"
**Solution:**
1. Check variable name spelling
2. Verify it's set in platform dashboard
3. For Vercel: Must start with `VITE_` for frontend
4. Redeploy after adding variables

---

## 📊 Log Locations

### Render (Backend)
- **Location**: Dashboard → Your Service → Logs
- **What to check**: Application errors, database connection, startup messages

### Vercel (Frontend)
- **Location**: Dashboard → Your Project → Deployments → [Deployment] → Logs
- **What to check**: Build errors, runtime errors, function logs

### Supabase (Database)
- **Location**: Dashboard → Logs
- **What to check**: Query errors, connection issues, slow queries

### Browser Console
- **Location**: F12 → Console tab
- **What to check**: CORS errors, network errors, JavaScript errors

---

## 🔧 Quick Fixes by Symptom

### Symptom: "Page won't load"
**Check:**
1. Vercel deployment status
2. Build completed successfully
3. No build errors in logs
4. Frontend URL is correct

### Symptom: "Can't login"
**Check:**
1. Admin user exists in database
2. Backend is running
3. API endpoint is accessible
4. JWT_SECRET is set
5. Check browser console for errors

### Symptom: "API calls fail"
**Check:**
1. Backend is running
2. CORS is configured
3. `VITE_API_URL` is correct
4. Network tab in browser console
5. Backend logs for errors

### Symptom: "Database errors"
**Check:**
1. Connection string is correct
2. Supabase project is active
3. Tables exist (run migration)
4. Database logs for errors
5. Connection pool limits

---

## 🆘 Emergency Procedures

### Backend Down
1. Check Render dashboard for service status
2. Review logs for error messages
3. Verify environment variables
4. Try manual redeploy
5. Check database connectivity

### Frontend Down
1. Check Vercel dashboard for deployment status
2. Review build logs
3. Verify environment variables
4. Try redeploy
5. Check for build errors

### Database Issues
1. Check Supabase dashboard
2. Verify project is active
3. Test connection in SQL Editor
4. Check connection pool usage
5. Review database logs

### Complete Outage
1. Check all three platforms (Render, Vercel, Supabase)
2. Review status pages
3. Check recent deployments
4. Verify environment variables
5. Test each component individually

---

## 🔄 Rollback Procedures

### Rollback Frontend (Vercel)
1. Go to Vercel dashboard
2. Deployments → Select previous deployment
3. Click "Promote to Production"

### Rollback Backend (Render)
1. Go to Render dashboard
2. Deployments → Select previous deployment
3. Click "Rollback"

### Rollback Database
1. Use Supabase backups
2. Restore from backup point
3. Or manually revert migration

---

## 📞 Getting Help

### Self-Help Resources
1. **FAQ**: `DEPLOYMENT_FAQ.md`
2. **Troubleshooting**: `POST_DEPLOYMENT_GUIDE.md`
3. **Architecture**: `DEPLOYMENT_ARCHITECTURE.md`

### Platform Support
- **Render**: https://render.com/docs/support
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs/support

### Check Logs First
- Always check logs before asking for help
- Include error messages in support requests
- Provide deployment URLs

---

## ✅ Verification Checklist

After fixing an issue, verify:
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Login works
- [ ] API calls succeed
- [ ] No console errors
- [ ] No CORS errors
- [ ] Database queries work

---

## 🎯 Prevention Tips

### Before Deployment
- [ ] Test locally first
- [ ] Verify all environment variables
- [ ] Check build commands
- [ ] Review configuration files

### After Deployment
- [ ] Run verification script
- [ ] Test all features
- [ ] Monitor logs
- [ ] Setup alerts

### Regular Maintenance
- [ ] Monitor error rates
- [ ] Review logs weekly
- [ ] Update dependencies
- [ ] Rotate secrets regularly

---

**Quick Reference - Keep this handy during deployment!**

---

**Last Updated**: 2025-01-15

