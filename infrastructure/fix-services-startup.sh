#!/bin/bash
# Fix services to auto-start on boot

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }

echo "========================================="
echo "  🔧 Fixing Services Auto-Start"
echo "========================================="
echo ""

# 1. Enable PostgreSQL
log "Enabling PostgreSQL on boot..."
systemctl enable postgresql
systemctl start postgresql
log "PostgreSQL enabled and started"

# 2. Setup PM2 startup
log "Configuring PM2 to start on boot..."
pm2 save
pm2 startup systemd -u root --hp /root
log "PM2 startup configured"

# 3. Start Backend if not running
if ! pm2 list | grep -q "nexusvpn-backend"; then
    warn "Backend not running, starting..."
    cd /opt/nexusvpn/backend
    pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
    log "Backend started"
else
    log "Backend already running"
fi

# 4. Start Frontend if not running
if ! netstat -tlnp | grep -q ":5173"; then
    warn "Frontend not running, starting..."
    cd /opt/nexusvpn/frontend
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
    log "Frontend started"
else
    log "Frontend already running"
fi

# 5. Create systemd service for frontend (better than nohup)
log "Creating systemd service for frontend..."
cat > /etc/systemd/system/nexusvpn-frontend.service << 'EOF'
[Unit]
Description=NexusVPN Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexusvpn/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable nexusvpn-frontend
systemctl start nexusvpn-frontend
log "Frontend systemd service created and started"

echo ""
log "All services configured for auto-start!"
echo ""
echo "📊 Service Status:"
systemctl status postgresql --no-pager | head -3
pm2 list
systemctl status nexusvpn-frontend --no-pager | head -3

