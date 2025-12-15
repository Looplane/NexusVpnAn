# ⚡ Quick Auto-Start Setup (For Server)

## Problem

The auto-start scripts don't exist on the server yet. Here's how to set it up quickly.

---

## Solution 1: Pull Latest Code (Recommended)

If the scripts are in GitHub:

```bash
cd /opt/nexusvpn
git pull origin main
chmod +x infrastructure/configure-auto-start-and-restart.sh
chmod +x infrastructure/verify-services-after-reboot.sh
sudo bash infrastructure/configure-auto-start-and-restart.sh
```

---

## Solution 2: Run Setup Directly (Quick Fix)

Copy and paste this entire command on your server:

```bash
cd /opt/nexusvpn && cat > /tmp/setup-auto-start.sh << 'SCRIPT_END'
#!/bin/bash
set -e
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
log() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "========================================="
echo "  🔄 Setting Up Auto-Start Services"
echo "========================================="
echo ""

# 1. PostgreSQL
info "Configuring PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL enabled"

# 2. PM2
info "Configuring PM2..."
cd /opt/nexusvpn/backend
if ! pm2 list | grep -q "nexusvpn-backend.*online"; then
    if [ -f "dist/main.js" ]; then
        pm2 start dist/main.js --name nexusvpn-backend
    else
        npm run build
        pm2 start dist/main.js --name nexusvpn-backend
    fi
fi
pm2 save
pm2 startup systemd -u root --hp /root
log "PM2 configured"

# 3. Frontend Service
info "Creating frontend service..."
mkdir -p /var/log/nexusvpn
cat > /etc/systemd/system/nexusvpn-frontend.service << 'EOF'
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
EOF

systemctl daemon-reload
systemctl enable nexusvpn-frontend
pkill -f "vite.*5173" || true
sleep 2
systemctl start nexusvpn-frontend
log "Frontend service created"

echo ""
log "✅ All services configured for auto-start!"
echo ""
info "To test, restart: sudo reboot"
echo ""
SCRIPT_END
chmod +x /tmp/setup-auto-start.sh
sudo bash /tmp/setup-auto-start.sh
```

---

## Solution 3: Manual Commands (Step by Step)

Run these commands one by one:

```bash
# 1. Enable PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 2. Configure PM2
cd /opt/nexusvpn/backend
pm2 start dist/main.js --name nexusvpn-backend || pm2 restart nexusvpn-backend
pm2 save
pm2 startup systemd -u root --hp /root

# 3. Create Frontend Service
sudo mkdir -p /var/log/nexusvpn
sudo tee /etc/systemd/system/nexusvpn-frontend.service > /dev/null << 'EOF'
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
EOF

sudo systemctl daemon-reload
sudo systemctl enable nexusvpn-frontend
sudo pkill -f "vite.*5173" || true
sleep 2
sudo systemctl start nexusvpn-frontend

# 4. Verify
systemctl is-enabled postgresql
systemctl is-enabled nexusvpn-frontend
pm2 startup
```

---

## Verify Configuration

After running setup, verify:

```bash
# Check all services
systemctl status postgresql --no-pager | head -3
pm2 list
systemctl status nexusvpn-frontend --no-pager | head -3

# Check if enabled
systemctl is-enabled postgresql        # Should show: enabled
systemctl is-enabled nexusvpn-frontend # Should show: enabled
pm2 startup                             # Should show systemd script
```

---

## Test Auto-Start

After configuration:

```bash
# Restart server
sudo reboot

# After reboot (wait 2-3 minutes), SSH back and check:
systemctl status postgresql
pm2 list
systemctl status nexusvpn-frontend
curl http://localhost:3000/api/health
curl -I http://localhost:5173
```

---

## Quick Verification Script

After reboot, run this to verify everything:

```bash
cat > /tmp/verify-services.sh << 'EOF'
#!/bin/bash
echo "=== Service Status ==="
echo "PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo 'not running')"
echo "PM2 Backend: $(pm2 list | grep nexusvpn-backend | awk '{print $10}' || echo 'not running')"
echo "Frontend: $(systemctl is-active nexusvpn-frontend 2>/dev/null || echo 'not running')"
echo ""
echo "=== Auto-Start Enabled ==="
echo "PostgreSQL: $(systemctl is-enabled postgresql 2>/dev/null || echo 'disabled')"
echo "Frontend: $(systemctl is-enabled nexusvpn-frontend 2>/dev/null || echo 'disabled')"
echo "PM2: $([ -f /etc/systemd/system/pm2-root.service ] && echo 'configured' || echo 'not configured')"
EOF
chmod +x /tmp/verify-services.sh
bash /tmp/verify-services.sh
```

---

**Last Updated:** December 2025

