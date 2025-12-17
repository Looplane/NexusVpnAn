# 🔄 Auto-Start Services & Server Restart Guide

**Document ID:** SET-AUTO-START-001  
**Created:** 17-12-2025 | Time: 02:36:44  
**Last Updated:** 17-12-2025 | Time: 02:36:44

**Related Documents:**
- @--DOCUMENTATIONS--/07-Setup/11-SET-Quick_Auto_Start_Setup_17-12-2025_023644.md

---

## Overview

This guide explains how to configure all NexusVPN services to automatically start on server reboot and how to verify they're working correctly.

**Date:** December 2025  
**Status:** ✅ Ready to Use

---

## 🚀 Quick Start

### Step 1: Configure Auto-Start

Run this script on your Ubuntu server (5.161.91.222):

```bash
cd /opt/nexusvpn
sudo bash infrastructure/configure-auto-start-and-restart.sh
```

This script will:
- ✅ Enable PostgreSQL to start on boot
- ✅ Configure PM2 to start on boot
- ✅ Create systemd service for frontend
- ✅ Verify all services are running
- ✅ Offer to restart the server

### Step 2: Restart Server

After configuration, restart the server:

```bash
sudo reboot
```

### Step 3: Verify After Reboot

After the server comes back up (wait 2-3 minutes), run:

```bash
cd /opt/nexusvpn
bash infrastructure/verify-services-after-reboot.sh
```

---

## 📋 What Gets Configured

### 1. PostgreSQL

**Service:** `postgresql`  
**Command:**
```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Verify:**
```bash
systemctl is-enabled postgresql  # Should show: enabled
systemctl is-active postgresql    # Should show: active
```

### 2. PM2 Backend

**Service:** `nexusvpn-backend`  
**Commands:**
```bash
cd /opt/nexusvpn/backend
pm2 start dist/main.js --name nexusvpn-backend
pm2 save
pm2 startup systemd -u root --hp /root
```

**Verify:**
```bash
pm2 list                    # Should show nexusvpn-backend online
pm2 startup                # Should show systemd script configured
```

**Auto-Start Script Location:**
- `/etc/systemd/system/pm2-root.service`

### 3. Frontend (Vite)

**Service:** `nexusvpn-frontend`  
**Created as:** systemd service

**Service File:** `/etc/systemd/system/nexusvpn-frontend.service`

**Commands:**
```bash
sudo systemctl enable nexusvpn-frontend
sudo systemctl start nexusvpn-frontend
```

**Verify:**
```bash
systemctl is-enabled nexusvpn-frontend  # Should show: enabled
systemctl is-active nexusvpn-frontend   # Should show: active
```

---

## 🔍 Manual Verification

### Check All Services

```bash
# PostgreSQL
sudo systemctl status postgresql

# PM2 Backend
pm2 status
pm2 logs nexusvpn-backend --lines 20

# Frontend
sudo systemctl status nexusvpn-frontend
# Or check logs
sudo journalctl -u nexusvpn-frontend -n 50
```

### Check Service Health

```bash
# Backend health
curl http://localhost:3000/api/health

# Frontend health
curl -I http://localhost:5173
```

### Check Ports

```bash
# Backend (port 3000)
netstat -tlnp | grep 3000

# Frontend (port 5173)
netstat -tlnp | grep 5173

# PostgreSQL (port 5432)
netstat -tlnp | grep 5432
```

---

## 🐛 Troubleshooting

### Issue: PostgreSQL Not Starting

**Symptoms:**
- `systemctl status postgresql` shows failed
- Database connection errors

**Solutions:**
```bash
# Check logs
sudo journalctl -u postgresql -n 50

# Start manually
sudo systemctl start postgresql

# Check if enabled
sudo systemctl enable postgresql
```

### Issue: PM2 Backend Not Starting

**Symptoms:**
- `pm2 list` shows backend as stopped
- Backend API not responding

**Solutions:**
```bash
# Check PM2 startup script
pm2 startup

# If not configured, run:
pm2 startup systemd -u root --hp /root

# Start backend manually
cd /opt/nexusvpn/backend
pm2 start dist/main.js --name nexusvpn-backend
pm2 save

# Check logs
pm2 logs nexusvpn-backend --lines 50
```

### Issue: Frontend Not Starting

**Symptoms:**
- Frontend not accessible on port 5173
- `systemctl status nexusvpn-frontend` shows failed

**Solutions:**
```bash
# Check logs
sudo journalctl -u nexusvpn-frontend -n 50

# Restart service
sudo systemctl restart nexusvpn-frontend

# If systemd service doesn't exist, create it:
sudo bash infrastructure/configure-auto-start-and-restart.sh

# Or start manually (temporary)
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
```

### Issue: Services Start But Don't Auto-Start After Reboot

**Symptoms:**
- Services work when started manually
- But don't start after server reboot

**Solutions:**
```bash
# Re-run configuration script
sudo bash infrastructure/configure-auto-start-and-restart.sh

# Verify each service is enabled:
systemctl is-enabled postgresql        # Should be: enabled
systemctl is-enabled nexusvpn-frontend  # Should be: enabled
pm2 startup                             # Should show systemd script

# Check PM2 startup script exists
ls -la /etc/systemd/system/pm2-root.service
```

---

## 📊 Service Status Commands

### Quick Status Check

```bash
# All services at once
echo "=== PostgreSQL ===" && systemctl status postgresql --no-pager | head -5
echo "=== PM2 ===" && pm2 list
echo "=== Frontend ===" && systemctl status nexusvpn-frontend --no-pager | head -5
```

### Detailed Status

```bash
# Use the verification script
bash infrastructure/verify-services-after-reboot.sh
```

---

## 🔄 Restart Workflow

### Complete Restart Process

1. **Before Restart:**
   ```bash
   # Run configuration script
   sudo bash infrastructure/configure-auto-start-and-restart.sh
   
   # Verify all services are enabled
   systemctl is-enabled postgresql
   systemctl is-enabled nexusvpn-frontend
   pm2 startup
   ```

2. **Restart Server:**
   ```bash
   sudo reboot
   ```

3. **After Restart (wait 2-3 minutes):**
   ```bash
   # SSH back into server
   ssh root@5.161.91.222
   
   # Run verification script
   cd /opt/nexusvpn
   bash infrastructure/verify-services-after-reboot.sh
   ```

4. **Verify Access:**
   - Frontend: http://5.161.91.222:5173
   - Backend: http://5.161.91.222:3000/api
   - Admin: http://5.161.91.222:5173/#/admin

---

## 📝 Service Files Reference

### Frontend Systemd Service

**File:** `/etc/systemd/system/nexusvpn-frontend.service`

```ini
[Unit]
Description=NexusVPN Frontend (Vite)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexusvpn/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10
StandardOutput=append:/var/log/nexusvpn/frontend.log
StandardError=append:/var/log/nexusvpn/frontend-error.log

[Install]
WantedBy=multi-user.target
```

### PM2 Startup Script

**File:** `/etc/systemd/system/pm2-root.service`

Created automatically by: `pm2 startup systemd -u root --hp /root`

---

## ✅ Checklist

Before restarting server:

- [ ] PostgreSQL enabled: `systemctl is-enabled postgresql`
- [ ] PM2 startup configured: `pm2 startup` shows systemd script
- [ ] Frontend service created: `systemctl status nexusvpn-frontend`
- [ ] All services running: `bash infrastructure/verify-services-after-reboot.sh`
- [ ] Backend accessible: `curl http://localhost:3000/api/health`
- [ ] Frontend accessible: `curl -I http://localhost:5173`

After restart:

- [ ] Wait 2-3 minutes for services to start
- [ ] Run verification script: `bash infrastructure/verify-services-after-reboot.sh`
- [ ] Check all services are running
- [ ] Test frontend access: http://5.161.91.222:5173
- [ ] Test backend access: http://5.161.91.222:3000/api/health
- [ ] Test admin panel: http://5.161.91.222:5173/#/admin

---

## 🎯 Expected Results

After successful configuration and reboot:

✅ **PostgreSQL:**
- Status: `active (running)`
- Enabled: `enabled`
- Port: `5432` listening

✅ **PM2 Backend:**
- Status: `online`
- Name: `nexusvpn-backend`
- Port: `3000` listening
- Health: `{"status":"ok"}`

✅ **Frontend:**
- Status: `active (running)`
- Enabled: `enabled`
- Port: `5173` listening
- HTTP: `200 OK`

---

## 📚 Related Documentation

- @--DOCUMENTATIONS--/07-Setup/12-SET-Server_Production_Setup_17-12-2025_023644.md
- @--DOCUMENTATIONS--/07-Setup/13-SET-Quick_Install_Command_17-12-2025_023644.md

---

**Last Updated:** 17-12-2025 | Time: 02:36:44  
**Status:** ✅ Production Ready

