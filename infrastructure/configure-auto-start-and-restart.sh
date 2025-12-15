#!/bin/bash
# =============================================================================
# 🔄 Configure Auto-Start Services & Restart Server
# =============================================================================
# This script ensures all NexusVPN services auto-start on boot and restarts
# the server to verify everything comes back up automatically.
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }
step() { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] 🔧 $1${NC}"; }

DEPLOYMENT_DIR="/opt/nexusvpn"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "========================================="
echo "  🔄 Auto-Start Configuration & Restart"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root (use sudo)"
    exit 1
fi

# =============================================================================
# STEP 1: Check Current Service Status
# =============================================================================
step "Step 1/7: Checking current service status..."

echo ""
info "Current Service Status:"
echo "----------------------------------------"

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    log "PostgreSQL: Running"
else
    warn "PostgreSQL: Not running"
fi

# PM2 Backend
if pm2 list | grep -q "nexusvpn-backend.*online"; then
    log "PM2 Backend: Running"
else
    warn "PM2 Backend: Not running"
fi

# Frontend (Vite)
if pgrep -f "vite.*5173" > /dev/null; then
    log "Frontend (Vite): Running"
else
    warn "Frontend (Vite): Not running"
fi

# Check if services are enabled for auto-start
echo ""
info "Auto-Start Configuration:"
echo "----------------------------------------"

if systemctl is-enabled --quiet postgresql 2>/dev/null; then
    log "PostgreSQL: Enabled on boot"
else
    warn "PostgreSQL: NOT enabled on boot"
fi

if pm2 startup | grep -q "systemd"; then
    log "PM2: Startup script configured"
else
    warn "PM2: Startup script NOT configured"
fi

# =============================================================================
# STEP 2: Configure PostgreSQL Auto-Start
# =============================================================================
step "Step 2/7: Configuring PostgreSQL auto-start..."

if ! systemctl is-enabled --quiet postgresql 2>/dev/null; then
    info "Enabling PostgreSQL on boot..."
    systemctl enable postgresql
    log "PostgreSQL enabled on boot"
else
    info "PostgreSQL already enabled on boot"
fi

# Ensure PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    info "Starting PostgreSQL..."
    systemctl start postgresql
    sleep 2
    log "PostgreSQL started"
fi

# =============================================================================
# STEP 3: Configure PM2 Auto-Start
# =============================================================================
step "Step 3/7: Configuring PM2 auto-start..."

# Check if PM2 startup script exists
if [ ! -f /etc/systemd/system/pm2-root.service ]; then
    info "Setting up PM2 startup script..."
    pm2 startup systemd -u root --hp /root
    log "PM2 startup script created"
else
    info "PM2 startup script already exists"
fi

# Ensure backend is saved in PM2
info "Saving PM2 process list..."
cd "$DEPLOYMENT_DIR/backend" 2>/dev/null || {
    error "Backend directory not found: $DEPLOYMENT_DIR/backend"
    exit 1
}

# Start backend if not running
if ! pm2 list | grep -q "nexusvpn-backend.*online"; then
    info "Starting backend with PM2..."
    if [ -f "dist/main.js" ]; then
        pm2 start dist/main.js --name nexusvpn-backend || true
    else
        warn "Backend not built. Building now..."
        npm run build
        pm2 start dist/main.js --name nexusvpn-backend
    fi
fi

pm2 save
log "PM2 process list saved"

# =============================================================================
# STEP 4: Configure Frontend Auto-Start (systemd service)
# =============================================================================
step "Step 4/7: Configuring frontend auto-start..."

# Create systemd service for frontend
FRONTEND_SERVICE="/etc/systemd/system/nexusvpn-frontend.service"

if [ ! -f "$FRONTEND_SERVICE" ]; then
    info "Creating frontend systemd service..."
    cat > "$FRONTEND_SERVICE" << EOF
[Unit]
Description=NexusVPN Frontend (Vite)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOYMENT_DIR/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 5173
Restart=always
RestartSec=10
StandardOutput=append:/var/log/nexusvpn/frontend.log
StandardError=append:/var/log/nexusvpn/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF
    log "Frontend systemd service created"
else
    info "Frontend systemd service already exists"
fi

# Create log directory
mkdir -p /var/log/nexusvpn
chmod 755 /var/log/nexusvpn

# Reload systemd
systemctl daemon-reload

# Enable frontend service
if ! systemctl is-enabled --quiet nexusvpn-frontend 2>/dev/null; then
    info "Enabling frontend service on boot..."
    systemctl enable nexusvpn-frontend
    log "Frontend service enabled on boot"
else
    info "Frontend service already enabled on boot"
fi

# Start frontend service if not running
if ! systemctl is-active --quiet nexusvpn-frontend; then
    info "Starting frontend service..."
    # Stop any existing vite processes
    pkill -f "vite.*5173" || true
    sleep 2
    systemctl start nexusvpn-frontend
    sleep 3
    log "Frontend service started"
else
    info "Frontend service already running"
fi

# =============================================================================
# STEP 5: Verify All Services Are Running
# =============================================================================
step "Step 5/7: Verifying all services are running..."

sleep 3

echo ""
info "Service Status After Configuration:"
echo "----------------------------------------"

# PostgreSQL
if systemctl is-active --quiet postgresql; then
    log "PostgreSQL: ✅ Running"
else
    error "PostgreSQL: ❌ Not running"
    systemctl start postgresql
fi

# PM2 Backend
if pm2 list | grep -q "nexusvpn-backend.*online"; then
    log "PM2 Backend: ✅ Running"
    pm2 list | grep nexusvpn-backend
else
    error "PM2 Backend: ❌ Not running"
    cd "$DEPLOYMENT_DIR/backend"
    pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
fi

# Frontend
if systemctl is-active --quiet nexusvpn-frontend; then
    log "Frontend Service: ✅ Running"
elif pgrep -f "vite.*5173" > /dev/null; then
    log "Frontend (Vite): ✅ Running (manual process)"
else
    error "Frontend: ❌ Not running"
    systemctl start nexusvpn-frontend || {
        cd "$DEPLOYMENT_DIR/frontend"
        nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
    }
fi

# =============================================================================
# STEP 6: Test Service Health
# =============================================================================
step "Step 6/7: Testing service health..."

sleep 5

echo ""
info "Health Checks:"
echo "----------------------------------------"

# Backend health
if curl -s http://localhost:3000/api/health 2>/dev/null | grep -q "ok"; then
    log "Backend Health: ✅ OK"
else
    warn "Backend Health: ⚠️  Not responding (may need a moment)"
fi

# Frontend health
if curl -s -I http://localhost:5173 2>/dev/null | grep -q "200 OK"; then
    log "Frontend Health: ✅ OK"
else
    warn "Frontend Health: ⚠️  Not responding (may need a moment)"
fi

# =============================================================================
# STEP 7: Summary & Restart Instructions
# =============================================================================
step "Step 7/7: Summary and restart instructions"

echo ""
echo "========================================="
echo "  📊 Configuration Summary"
echo "========================================="
echo ""

info "Auto-Start Configuration:"
echo "  ✅ PostgreSQL: $(systemctl is-enabled postgresql 2>/dev/null && echo 'Enabled' || echo 'Disabled')"
echo "  ✅ PM2: $(pm2 startup | grep -q systemd && echo 'Configured' || echo 'Not configured')"
echo "  ✅ Frontend Service: $(systemctl is-enabled nexusvpn-frontend 2>/dev/null && echo 'Enabled' || echo 'Disabled')"
echo ""

info "Current Service Status:"
echo "  $(systemctl is-active postgresql > /dev/null && echo '✅' || echo '❌') PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo 'Not running')"
echo "  $(pm2 list | grep -q 'nexusvpn-backend.*online' && echo '✅' || echo '❌') PM2 Backend: $(pm2 list | grep nexusvpn-backend | awk '{print $10}' || echo 'Not running')"
echo "  $(systemctl is-active nexusvpn-frontend > /dev/null && echo '✅' || echo '❌') Frontend: $(systemctl is-active nexusvpn-frontend 2>/dev/null || echo 'Not running')"
echo ""

warn "⚠️  READY TO RESTART SERVER"
echo ""
echo "All services are now configured to auto-start on boot."
echo ""
echo "To restart the server and verify auto-start:"
echo "  1. Run: sudo reboot"
echo "  2. Wait 2-3 minutes for services to start"
echo "  3. Run verification script:"
echo "     bash $DEPLOYMENT_DIR/infrastructure/verify-services-after-reboot.sh"
echo ""
echo "Or restart now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    warn "Restarting server in 10 seconds..."
    warn "Press Ctrl+C to cancel"
    sleep 10
    log "Restarting server now..."
    reboot
else
    log "Skipping restart. You can restart manually with: sudo reboot"
fi

echo ""
log "Configuration complete!"
echo ""

