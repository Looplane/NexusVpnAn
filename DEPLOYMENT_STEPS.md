# NexusVPN Deployment Instructions

## ✅ Step 1: Supabase Database (DO THIS FIRST)

1. **Get your Supabase connection details:**
   - Go to https://supabase.com/dashboard
   - Select project: `GenziNest-NexusVPN`
   - Go to Settings → Database
   - Copy the **Host** (looks like: `db.xxxxx.supabase.co`)

2. **Run the migration script:**
   ```powershell
   .\deploy-supabase.ps1
   ```
   - Paste the Host when prompted
   - Script will automatically migrate the database
   - **SAVE THE CONNECTION STRING** it outputs

---

## ✅ Step 2: Vercel Frontend Deployment

### Option A: Automatic (Recommended)
1. Go to https://vercel.com/new
2. Import `NexusVpnAn` from GitHub
3. **Root Directory**: Leave as `/` (root)
4. **Framework Preset**: Vite
5. **Build Command**: `cd frontend && npm install && npm run build`
6. **Output Directory**: `frontend/dist`
7. **Install Command**: `cd frontend && npm install`

### Environment Variables (Add in Vercel):
```
VITE_API_URL=https://nexusvpn-api.onrender.com/api
```
*(We'll update this after backend deployment)*

8. Click **Deploy**

---

## ✅ Step 3: Backend Deployment (Render)

### If you don't have Render account:
1. Go to https://render.com
2. Sign up with GitHub
3. Create new **Web Service**

### Configuration:
- **Repository**: `NexusVpnAn`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Instance Type**: Free (for testing)

### Environment Variables (Add in Render):
```
NODE_ENV=production
DATABASE_URL=<PASTE_SUPABASE_CONNECTION_STRING_HERE>
JWT_SECRET=<GENERATE_RANDOM_32_CHAR_STRING>
CORS_ORIGIN=https://nexusvpn.vercel.app
MOCK_SSH=true
```

**Generate JWT Secret:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

---

## ✅ Step 4: Connect Frontend to Backend

1. After Render deployment completes, copy the backend URL (e.g., `https://nexusvpn-api.onrender.com`)
2. Go back to Vercel → Your Project → Settings → Environment Variables
3. Update `VITE_API_URL` to: `https://nexusvpn-api.onrender.com/api`
4. Redeploy frontend (Vercel → Deployments → Redeploy)

---

## ✅ Step 5: Test

1. Open your Vercel URL (e.g., `https://nexusvpn.vercel.app`)
2. Try to register a new account
3. Login and test the dashboard

---

## 🐛 Troubleshooting

### Frontend shows "Cannot connect to API"
- Check `VITE_API_URL` in Vercel env vars
- Verify backend is running on Render
- Check CORS_ORIGIN in backend env vars

### Backend won't start on Render
- Check Render logs
- Verify DATABASE_URL is correct
- Ensure all env vars are set

### Database connection fails
- Verify Supabase project is active
- Check connection string format
- In Supabase: Settings → Database → Connection Pooling → Enable

---

*Need help? Check the logs in Vercel and Render dashboards.*
