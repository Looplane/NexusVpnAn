#!/bin/bash
# =============================================================================
# 🔄 Setup Auto-Start Services (Run directly on server)
# =============================================================================
# This script can be copied and run directly on the server
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

DEPLOYMENT_DIR="/opt/nexusvpn"

echo ""
echo "========================================="
echo "  🔄 Setting Up Auto-Start Services"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root (use sudo)"
    exit 1
fi

# =============================================================================
# Step 1: Enable PostgreSQL
# =============================================================================
info "Step 1/4: Configuring PostgreSQL..."
systemctl enable postgresql
if ! systemctl is-active --quiet postgresql; then
    systemctl start postgresql
fi
log "PostgreSQL enabled and started"

# =============================================================================
# Step 2: Configure PM2
# =============================================================================
info "Step 2/4: Configuring PM2..."
cd "$DEPLOYMENT_DIR/backend" 2>/dev/null || {
    error "Backend directory not found: $DEPLOYMENT_DIR/backend"
    exit 1
}

# Start backend if not running
if ! pm2 list | grep -q "nexusvpn-backend.*online"; then
    if [ -f "dist/main.js" ]; then
        pm2 start dist/main.js --name nexusvpn-backend || true
    else
        warn "Backend not built. Building now..."
        npm run build
        pm2 start dist/main.js --name nexusvpn-backend
    fi
fi

pm2 save
pm2 startup systemd -u root --hp /root
log "PM2 configured for auto-start"

# =============================================================================
# Step 3: Create Frontend Systemd Service
# =============================================================================
info "Step 3/4: Creating frontend systemd service..."

# Create log directory
mkdir -p /var/log/nexusvpn
chmod 755 /var/log/nexusvpn

# Create service file
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

# Stop any existing vite processes
pkill -f "vite.*5173" || true
sleep 2

# Start frontend service
systemctl start nexusvpn-frontend
log "Frontend systemd service created and started"

# =============================================================================
# Step 4: Verify Everything
# =============================================================================
info "Step 4/4: Verifying services..."
sleep 3

echo ""
info "Service Status:"
echo "----------------------------------------"

# PostgreSQL
if systemctl is-active --quiet postgresql && systemctl is-enabled --quiet postgresql; then
    log "PostgreSQL: ✅ Running & Enabled"
else
    warn "PostgreSQL: ⚠️  Issues detected"
fi

# PM2
if pm2 list | grep -q "nexusvpn-backend.*online" && [ -f /etc/systemd/system/pm2-root.service ]; then
    log "PM2 Backend: ✅ Running & Auto-Start Configured"
else
    warn "PM2 Backend: ⚠️  Issues detected"
fi

# Frontend
if systemctl is-active --quiet nexusvpn-frontend && systemctl is-enabled --quiet nexusvpn-frontend; then
    log "Frontend: ✅ Running & Enabled"
else
    warn "Frontend: ⚠️  Issues detected"
fi

echo ""
log "✅ Auto-start configuration complete!"
echo ""
info "All services are now configured to start automatically on boot."
echo ""
warn "To test, restart the server:"
echo "  sudo reboot"
echo ""
info "After reboot, wait 2-3 minutes, then verify with:"
echo "  systemctl status postgresql"
echo "  pm2 list"
echo "  systemctl status nexusvpn-frontend"
echo ""

