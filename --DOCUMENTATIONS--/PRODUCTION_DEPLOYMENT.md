# 🚀 NexusVPN Production Deployment Guide

## Overview
This guide covers production-ready deployment with auto-deployment from GitHub, management panels, and optimized configurations.

## 📋 Prerequisites
- Ubuntu 24.04 server
- Root/Sudo access
- GitHub repository access

## 🚀 Quick Start

### Option 1: Fresh Installation (All-in-One)
```bash
# Clone repository
git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn
cd /tmp/nexusvpn

# Run auto-install
chmod +x infrastructure/auto-install-nexusvpn.sh
sudo ./infrastructure/auto-install-nexusvpn.sh

# Setup production features
sudo ./infrastructure/setup-production.sh
```

### Option 2: Production Setup Only (After Basic Install)
```bash
cd /opt/nexusvpn
sudo ./infrastructure/setup-production.sh
```

## 🔄 GitHub Auto-Deployment

### Automatic Deployment (Recommended)
The system automatically checks GitHub every 5 minutes for updates and deploys them.

**Manual Deployment:**
```bash
/opt/nexusvpn/infrastructure/github-auto-deploy.sh
```

**View Deployment Logs:**
```bash
tail -f /var/log/nexusvpn-deploy.log
```

### GitHub Webhook Setup (Optional)
1. Go to your GitHub repository → Settings → Webhooks
2. Add webhook:
   - Payload URL: `http://YOUR_SERVER_IP:8080/webhook` (requires webhook server)
   - Content type: `application/json`
   - Events: `Push`

## 🖥️ Management Panels

### Cockpit (Server Management)
- **URL:** https://YOUR_SERVER_IP:9090
- **Login:** Use server root credentials
- **Features:** System monitoring, Docker management, Network configuration

**Install:**
```bash
sudo ./infrastructure/install-management-panels.sh
```

### aaPanel (Web Hosting)
- **URL:** http://YOUR_SERVER_IP:7800
- **Features:** Website management, Database admin, File manager

**Get Login Info:**
```bash
/etc/init.d/bt default
```

## 🔧 Production Configuration

### Environment Variables

**Backend (`/opt/nexusvpn/backend/.env.production`):**
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_USER=nexusvpn
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://YOUR_SERVER_IP:5173
CORS_ORIGIN=http://YOUR_SERVER_IP:5173
```

**Frontend (`/opt/nexusvpn/frontend/.env.production`):**
```env
VITE_API_URL=http://YOUR_SERVER_IP:3000/api
```

### PM2 Process Management

**Start:**
```bash
cd /opt/nexusvpn/backend
pm2 start ecosystem.config.js
pm2 save
```

**Status:**
```bash
pm2 list
pm2 logs nexusvpn-backend
```

**Restart:**
```bash
pm2 restart nexusvpn-backend
```

### Nginx Reverse Proxy

**Configuration:** `/etc/nginx/sites-available/nexusvpn`

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Access:**
- Frontend: `http://YOUR_SERVER_IP`
- Backend API: `http://YOUR_SERVER_IP/api`

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

### Update Nginx Config
After getting SSL certificate, update `/etc/nginx/sites-available/nexusvpn`:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### System Resources
```bash
htop
df -h
free -h
```

### Service Status
```bash
systemctl status postgresql nginx
pm2 status
```

## 🔄 Update Process

### Automatic (Recommended)
System checks GitHub every 5 minutes automatically.

### Manual Update
```bash
cd /opt/nexusvpn
git pull origin main
./infrastructure/github-auto-deploy.sh
```

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check logs
pm2 logs nexusvpn-backend

# Check environment
cd /opt/nexusvpn/backend
cat .env

# Restart
pm2 restart nexusvpn-backend
```

### Frontend Not Accessible
```bash
# Check if running
ps aux | grep vite

# Restart
cd /opt/nexusvpn/frontend
pkill -f vite
npm run dev -- --host 0.0.0.0 --port 5173 &
```

### Database Connection Issues
```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -d nexusvpn -c "SELECT 1;"

# Check connection string
cd /opt/nexusvpn/backend
grep DATABASE_URL .env
```

## 📝 Maintenance

### Daily Backups
Backups are configured automatically. Check:
```bash
ls -la /opt/backups/
```

### Log Rotation
Logs are automatically rotated. Manual cleanup:
```bash
pm2 flush
journalctl --vacuum-time=7d
```

## 🎯 Production Checklist

- [ ] SSL certificates configured
- [ ] Domain name configured
- [ ] Environment variables set
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] Firewall configured
- [ ] Auto-deployment working
- [ ] Management panels installed
- [ ] Email service configured (optional)
- [ ] Payment gateway configured (optional)

## 📞 Support

For issues:
1. Check logs: `/var/log/nexusvpn/`
2. Check PM2: `pm2 logs`
3. Check system: `systemctl status`
4. Review documentation in `--DOCUMENTATIONS--/`

---

**Last Updated:** 2025-12-15

