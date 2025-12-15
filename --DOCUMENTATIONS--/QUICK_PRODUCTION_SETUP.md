# ⚡ Quick Production Setup Guide

## 🚀 Single Command Setup

After initial installation, run this to enable all production features:

```bash
cd /opt/nexusvpn
sudo ./infrastructure/setup-production.sh
```

This will:
- ✅ Configure production environment variables
- ✅ Setup PM2 ecosystem
- ✅ Configure Nginx reverse proxy
- ✅ Setup GitHub auto-deployment (checks every 5 min)
- ✅ Optionally install management panels

## 📋 What Gets Installed

### 1. Production Environment
- Backend `.env.production` with secure defaults
- Frontend `.env.production` with API URL
- JWT secret generation
- Database connection strings

### 2. PM2 Process Manager
- Auto-restart on crash
- Memory limits
- Logging to `/var/log/nexusvpn/`
- Production-ready configuration

### 3. Nginx Reverse Proxy
- SSL-ready configuration
- Backend API proxying (`/api`)
- Frontend serving
- Security headers

### 4. GitHub Auto-Deployment
- Automatic pull every 5 minutes
- Builds and restarts services
- Logs to `/var/log/nexusvpn-deploy.log`

### 5. Management Panels (Optional)
- **Cockpit**: Server management GUI (port 9090)
- **aaPanel**: Web hosting control panel (port 7800)

## 🔄 Auto-Deployment

### How It Works
1. Cron job runs every 5 minutes
2. Checks GitHub for new commits
3. Pulls latest code if changes detected
4. Rebuilds and restarts services

### Manual Deployment
```bash
/opt/nexusvpn/infrastructure/github-auto-deploy.sh
```

### View Logs
```bash
tail -f /var/log/nexusvpn-deploy.log
```

## 🖥️ Management Panels

### Install Panels
```bash
sudo ./infrastructure/install-management-panels.sh
```

### Access
- **Cockpit**: https://YOUR_IP:9090
- **aaPanel**: http://YOUR_IP:7800

## 📝 Next Steps

1. **Configure Domain** (if you have one):
   ```bash
   # Update CORS_ORIGIN in backend/.env.production
   nano /opt/nexusvpn/backend/.env.production
   ```

2. **Setup SSL**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

3. **Configure Email** (optional):
   - Add SMTP settings to backend `.env.production`

4. **Setup Stripe** (for payments):
   - Add keys to backend `.env.production`

## 🔧 Management Commands

```bash
# Service Status
pm2 list
systemctl status postgresql nginx

# Restart Services
pm2 restart nexusvpn-backend
systemctl restart nginx

# View Logs
pm2 logs nexusvpn-backend
tail -f /tmp/frontend.log
tail -f /var/log/nexusvpn-deploy.log

# Manual Deploy
/opt/nexusvpn/infrastructure/github-auto-deploy.sh
```

## ✅ Production Checklist

- [x] Production environment configured
- [x] PM2 ecosystem setup
- [x] Nginx reverse proxy configured
- [x] Auto-deployment enabled
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Email service configured
- [ ] Payment gateway configured
- [ ] Management panels installed (optional)

---

**Ready for Production!** 🎉

