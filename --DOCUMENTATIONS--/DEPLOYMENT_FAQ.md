# ❓ Deployment FAQ

**Frequently Asked Questions about Cloud Deployment**

---

## 🚀 General Questions

### Q: How long does deployment take?
**A:** Approximately 25-30 minutes total:
- Supabase setup: 5 minutes
- Render backend: 10-15 minutes (build time)
- Vercel frontend: 5 minutes
- Configuration: 5 minutes

### Q: Do I need to know how to code?
**A:** No! The deployment is mostly point-and-click. The scripts guide you through each step. Basic familiarity with web services helps but isn't required.

### Q: Is this free?
**A:** Yes, all three platforms offer free tiers:
- **Supabase**: Free tier with 500MB database
- **Render**: Free tier (may spin down after inactivity)
- **Vercel**: Free tier with generous limits

### Q: Can I use my own domain?
**A:** Yes! Both Render and Vercel support custom domains:
- Vercel: Settings → Domains
- Render: Settings → Custom Domains

---

## 🗄️ Database Questions

### Q: Do I need to run the migration manually?
**A:** You have two options:
1. **Automated**: Use `./infrastructure/setup-supabase-db.sh`
2. **Manual**: Copy `setup_db.sql` to Supabase SQL Editor

### Q: What if migration fails?
**A:** 
1. Check Supabase SQL Editor for error messages
2. Verify connection string format
3. Ensure you're connected to the correct database
4. Try running migration in smaller chunks

### Q: Can I use an existing database?
**A:** Yes! Just use your existing connection string in Render's `DATABASE_URL` environment variable.

### Q: How do I backup my database?
**A:** Supabase provides automatic backups. You can also:
- Use Supabase dashboard → Database → Backups
- Export via SQL Editor
- Use `pg_dump` command

---

## 🖥️ Backend Questions (Render)

### Q: Why is my backend not starting?
**A:** Common causes:
1. **Database connection**: Check `DATABASE_URL` is correct
2. **Missing env vars**: Verify `JWT_SECRET` is set
3. **Build errors**: Check Render build logs
4. **Port issues**: Ensure `PORT=10000` (Render default)

### Q: How do I view backend logs?
**A:** 
- Render dashboard → Your service → Logs
- Real-time logs available
- Can filter by time range

### Q: My backend keeps restarting. Why?
**A:** Usually indicates:
- Database connection failures
- Missing environment variables
- Application crashes
- Check logs for specific error messages

### Q: Can I use Railway instead of Render?
**A:** Yes! The configuration is similar. You'll need to:
1. Create `railway.json` or configure manually
2. Set environment variables in Railway dashboard
3. Adjust connection strings as needed

### Q: How do I update the backend?
**A:** 
- Push to GitHub (Render auto-deploys)
- Or manually trigger: Render dashboard → Manual Deploy

---

## 🎨 Frontend Questions (Vercel)

### Q: Why can't my frontend connect to the backend?
**A:** Check:
1. `VITE_API_URL` is set correctly (must include `/api`)
2. Backend is running and accessible
3. CORS is configured in backend
4. No typos in URLs

### Q: How do I update environment variables?
**A:** 
- Vercel dashboard → Your project → Settings → Environment Variables
- Changes require redeployment (automatic)

### Q: My build is failing. What's wrong?
**A:** Common issues:
1. **TypeScript errors**: Check build logs
2. **Missing dependencies**: Verify `package.json`
3. **Node version**: Ensure Node 20.x
4. **Build command**: Should be `npm run build`

### Q: Can I preview deployments before going live?
**A:** Yes! Vercel creates preview deployments for every PR. You can also:
- Use Vercel CLI: `vercel --prod` for production
- Create staging environment

---

## 🔐 Security Questions

### Q: Are my secrets safe?
**A:** Yes, when configured correctly:
- Never commit `.env` files
- Use platform dashboards for secrets
- Different secrets per environment
- Rotate secrets regularly

### Q: How do I change the admin password?
**A:** 
1. Login to admin panel
2. Go to Settings → Security
3. Change password
4. Or use Supabase SQL Editor to update directly

### Q: Is HTTPS enabled?
**A:** Yes! Both Vercel and Render provide HTTPS automatically. No configuration needed.

### Q: How do I enable 2FA?
**A:** 
1. Login to your account
2. Go to Settings → Security
3. Enable Two-Factor Authentication
4. Scan QR code with authenticator app

---

## 🔄 CORS Questions

### Q: What is CORS and why do I need it?
**A:** CORS (Cross-Origin Resource Sharing) allows your frontend (Vercel) to make requests to your backend (Render). Without it, browsers block API calls.

### Q: How do I fix CORS errors?
**A:** 
1. Update `FRONTEND_URL` in Render to exact Vercel URL
2. Update `CORS_ORIGIN` to match
3. Redeploy backend
4. Clear browser cache

### Q: Can I allow multiple origins?
**A:** Yes! Update backend CORS configuration to include multiple URLs. See `backend/src/main.ts` for CORS setup.

---

## 🧪 Testing Questions

### Q: How do I test my deployment?
**A:** 
1. Run: `./infrastructure/test-cloud-deployment.sh`
2. Or manually test:
   - Backend health: `curl https://your-backend.onrender.com/`
   - Frontend: Open in browser
   - Login flow: Test with admin credentials

### Q: What if tests fail?
**A:** 
1. Check error messages in test output
2. Verify URLs are correct
3. Check backend/frontend logs
4. See `POST_DEPLOYMENT_GUIDE.md` for troubleshooting

### Q: How do I test locally before deploying?
**A:** 
1. Use `start-all.ps1` for local development
2. Test all features locally
3. Fix any issues
4. Then deploy to cloud

---

## 💰 Cost Questions

### Q: Will I be charged?
**A:** Free tiers are generous, but you may be charged if you:
- Exceed free tier limits
- Upgrade to paid plans
- Use premium features

### Q: What are the free tier limits?
**A:** 
- **Supabase**: 500MB database, 2GB bandwidth
- **Render**: Free tier (may spin down)
- **Vercel**: 100GB bandwidth, unlimited requests

### Q: How do I monitor usage?
**A:** 
- Check platform dashboards
- Set up usage alerts
- Monitor in Supabase/Vercel/Render dashboards

---

## 🐛 Troubleshooting

### Q: Nothing is working. Where do I start?
**A:** 
1. Check `POST_DEPLOYMENT_GUIDE.md` troubleshooting section
2. Verify all environment variables are set
3. Check logs in all three platforms
4. Test each component individually

### Q: How do I rollback a deployment?
**A:** 
- **Vercel**: Dashboard → Deployments → Select previous deployment → Promote
- **Render**: Dashboard → Deployments → Rollback
- **Supabase**: Use database backups

### Q: My database is slow. Why?
**A:** 
- Check connection pool settings
- Verify indexes are created
- Monitor query performance in Supabase
- Consider upgrading plan

### Q: How do I contact support?
**A:** 
- **Render**: https://render.com/docs/support
- **Vercel**: https://vercel.com/support
- **Supabase**: https://supabase.com/docs/support

---

## 🔧 Advanced Questions

### Q: Can I use Docker?
**A:** Yes! Both Render and Vercel support Docker:
- Render: Use `Dockerfile` in repository
- Vercel: Use Docker for serverless functions

### Q: How do I setup staging environment?
**A:** 
1. Create separate Supabase project
2. Create separate Render service
3. Create separate Vercel project
4. Use different environment variables

### Q: Can I use CI/CD?
**A:** Yes! GitHub Actions workflow is included (`.github/workflows/ci.yml`). You can also:
- Use Render's auto-deploy
- Use Vercel's Git integration
- Setup custom CI/CD pipelines

### Q: How do I monitor performance?
**A:** 
- **Vercel Analytics**: Built-in performance monitoring
- **Render Metrics**: CPU, memory, request metrics
- **Supabase**: Query performance dashboard
- **Third-party**: Sentry, Datadog, etc.

---

## 📚 Documentation

### Q: Where can I find more help?
**A:** 
- **Quick Start**: `QUICK_CLOUD_DEPLOYMENT.md`
- **Troubleshooting**: `POST_DEPLOYMENT_GUIDE.md`
- **All Resources**: `DEPLOYMENT_INDEX.md`
- **Checklist**: `DEPLOYMENT_CHECKLIST.md`

### Q: Are there video tutorials?
**A:** Check platform documentation:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs

---

## ✅ Still Have Questions?

1. Check the troubleshooting guide: `POST_DEPLOYMENT_GUIDE.md`
2. Review the deployment checklist: `DEPLOYMENT_CHECKLIST.md`
3. Check platform documentation
4. Review error logs in dashboards

---

**Last Updated**: 2025-01-15

