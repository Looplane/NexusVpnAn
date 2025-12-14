
# 🚀 The Ultimate Deployment Guide: NexusVPN

**Welcome, Commander!** 🫡

So, you want to build your own VPN empire? You want to be the master of your own internet traffic? You've come to the right place.

This guide is written for **complete beginners**. You don't need to be a coding wizard. Just follow these steps, one by one, and don't skip anything!

---

## 🗺️ Choose Your Path

There are two ways to deploy NexusVPN.

1.  **The "Pro" Way (Self-Hosted VPS)** 🏆 *(Recommended for Real Use)*
    *   **Cost:** ~$5/month.
    *   **Privacy:** Maximum. You own the server.
    *   **Difficulty:** Medium.
    *   **Best for:** Real privacy, selling VPN access.

2.  **The "Cloud Beta" Way (Vercel + Supabase)** ☁️ *(Recommended for Testing)*
    *   **Cost:** Free.
    *   **Privacy:** Medium (Third-party servers).
    *   **Difficulty:** Easy.
    *   **Best for:** Testing the Dashboard/UI without buying a server yet.

---

## ☁️ Path 1: Cloud Beta (Free, No Server)

### Step 1: Database (Supabase)
1.  Go to [Supabase.com](https://supabase.com) and sign up.
2.  Create a "New Project".
3.  Get your **Connection String** (Settings > Database > Connection String > URI).
4.  It looks like: `postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres`

### Step 2: Backend (Render/Railway)
1.  Push this code to GitHub.
2.  Go to [Render.com](https://render.com) and create a "Web Service".
3.  Connect your GitHub repo.
4.  **Root Directory:** `backend`
5.  **Build Command:** `npm install && npm run build`
6.  **Start Command:** `node dist/main`
7.  **Environment Variables:**
    *   `DATABASE_URL`: (Paste your Supabase string here)
    *   `JWT_SECRET`: (Smash your keyboard to make a random string)
    *   `MOCK_SSH`: `true` (Important! This prevents errors since we have no VPN node yet)
8.  Deploy! You will get a URL like `https://nexusvpn-api.onrender.com`.

### Step 3: Frontend (Vercel)
1.  Go to [Vercel.com](https://vercel.com).
2.  Import your GitHub repo.
3.  **Framework Preset:** Vite
4.  **Environment Variables:**
    *   `VITE_API_URL`: `https://nexusvpn-api.onrender.com` (Your backend URL from Step 2)
5.  Deploy!

🎉 **Done!** You now have a working Dashboard running in the cloud.

---

## 🏆 Path 2: The "Pro" Way (Self-Hosted VPS)

### 🛠️ Step 1: Getting a Server
1.  Go to [Hetzner](https://hetzner.com) or [DigitalOcean](https://digitalocean.com).
2.  Create a **Ubuntu 24.04** server.

### 💻 Step 2: Connect
1.  Open Terminal/PowerShell.
2.  `ssh root@YOUR_SERVER_IP`

### 🪄 Step 3: The Magic Install Script
Copy and paste this into your server:

```bash
curl -O https://raw.githubusercontent.com/your-repo/nexusvpn/main/infrastructure/install.sh && chmod +x install.sh && sudo ./install.sh
```

### 🌐 Step 4: Access
Go to `http://YOUR_SERVER_IP` in your browser.

**Login:** `admin@nexusvpn.com` / `password`

---

## ❓ FAQ

**Q: In Cloud Mode, does the VPN actually work?**
A: No. In Cloud Mode (`MOCK_SSH=true`), the dashboard generates "fake" config files for testing. To get real VPN connections, you must use **Path 2** (VPS) or connect your Cloud Backend to a VPS via SSH keys.

**Q: How do I enable SSL on my VPS?**
A: The Nginx config handles it. Use Certbot: `sudo certbot --nginx`.
