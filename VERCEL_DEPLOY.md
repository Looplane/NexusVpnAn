# Vercel Deployment Configuration

## 🎯 Import Settings

When importing `NexusVpnAn` to Vercel, use these exact settings:

### Project Settings:
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### Environment Variables:

Add this in Vercel → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://nexusvpn-api.onrender.com/api` |

*(Update this after backend deployment)*

---

## 🚀 Deployment Steps:

1. Go to: https://vercel.com/new
2. Select `NexusVpnAn` from GitHub
3. Configure as above
4. Click **Deploy**
5. Wait 2-3 minutes
6. Your app will be live at: `https://nexusvpn-xxx.vercel.app`

---

## 🔧 After Backend Deployment:

1. Get your Render backend URL (e.g., `https://nexusvpn-api.onrender.com`)
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Edit `VITE_API_URL` to: `https://YOUR-BACKEND-URL.onrender.com/api`
4. Go to Deployments → Click "..." → Redeploy

---

## ✅ Verification:

After deployment:
1. Open your Vercel URL
2. You should see the NexusVPN landing page
3. Try to register/login (will fail until backend is deployed)

---

*Vercel config file: `vercel.json`*
