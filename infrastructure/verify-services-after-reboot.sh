#!/bin/bash
# =============================================================================
# ✅ Verify Services After Reboot
# =============================================================================
# Run this script after server reboot to verify all services started automatically
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

SERVER_IP=$(hostname -I | awk '{print $1}')
DEPLOYMENT_DIR="/opt/nexusvpn"

echo ""
echo "========================================="
echo "  ✅ Post-Reboot Service Verification"
echo "========================================="
echo ""

# Wait a bit for services to fully start
info "Waiting for services to initialize..."
sleep 5

# Check system uptime
UPTIME=$(uptime -p)
info "System Uptime: $UPTIME"
echo ""

# =============================================================================
# Check PostgreSQL
# =============================================================================
info "Checking PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    log "PostgreSQL: ✅ Running"
    if systemctl is-enabled --quiet postgresql; then
        log "PostgreSQL: ✅ Enabled on boot"
    else
        warn "PostgreSQL: ⚠️  NOT enabled on boot"
    fi
else
    error "PostgreSQL: ❌ Not running"
    warn "Attempting to start PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
    if systemctl is-active --quiet postgresql; then
        log "PostgreSQL: ✅ Started successfully"
    else
        error "PostgreSQL: ❌ Failed to start"
    fi
fi

# Test database connection
if sudo -u postgres psql -d nexusvpn -c "SELECT 1;" > /dev/null 2>&1; then
    log "PostgreSQL: ✅ Database connection OK"
else
    warn "PostgreSQL: ⚠️  Database connection failed"
fi

echo ""

# =============================================================================
# Check PM2 Backend
# =============================================================================
info "Checking PM2 Backend..."
if command -v pm2 > /dev/null; then
    if pm2 list | grep -q "nexusvpn-backend.*online"; then
        log "PM2 Backend: ✅ Running"
        pm2 list | grep nexusvpn-backend
    else
        error "PM2 Backend: ❌ Not running"
        warn "Attempting to start backend..."
        cd "$DEPLOYMENT_DIR/backend" 2>/dev/null || {
            error "Backend directory not found"
        }
        if [ -f "dist/main.js" ]; then
            pm2 start dist/main.js --name nexusvpn-backend
            pm2 save
            sleep 3
            if pm2 list | grep -q "nexusvpn-backend.*online"; then
                log "PM2 Backend: ✅ Started successfully"
            else
                error "PM2 Backend: ❌ Failed to start"
            fi
        else
            error "Backend not built. Run: cd $DEPLOYMENT_DIR/backend && npm run build"
        fi
    fi
    
    # Check PM2 startup
    if [ -f /etc/systemd/system/pm2-root.service ]; then
        log "PM2: ✅ Startup script configured"
    else
        warn "PM2: ⚠️  Startup script NOT configured"
        warn "Run: pm2 startup systemd -u root --hp /root"
    fi
else
    error "PM2: ❌ Not installed"
fi

echo ""

# =============================================================================
# Check Frontend
# =============================================================================
info "Checking Frontend..."
if systemctl is-active --quiet nexusvpn-frontend 2>/dev/null; then
    log "Frontend Service: ✅ Running (systemd)"
    if systemctl is-enabled --quiet nexusvpn-frontend 2>/dev/null; then
        log "Frontend Service: ✅ Enabled on boot"
    else
        warn "Frontend Service: ⚠️  NOT enabled on boot"
    fi
elif pgrep -f "vite.*5173" > /dev/null; then
    log "Frontend: ✅ Running (manual process)"
    warn "Frontend: ⚠️  Running as manual process (not systemd service)"
else
    error "Frontend: ❌ Not running"
    warn "Attempting to start frontend..."
    if systemctl start nexusvpn-frontend 2>/dev/null; then
        sleep 3
        if systemctl is-active --quiet nexusvpn-frontend; then
            log "Frontend: ✅ Started successfully"
        else
            # Fallback to manual start
            cd "$DEPLOYMENT_DIR/frontend" 2>/dev/null || {
                error "Frontend directory not found"
            }
            nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
            sleep 3
            if pgrep -f "vite.*5173" > /dev/null; then
                log "Frontend: ✅ Started successfully (manual)"
            else
                error "Frontend: ❌ Failed to start"
            fi
        fi
    else
        error "Frontend: ❌ Failed to start"
    fi
fi

echo ""

# =============================================================================
# Health Checks
# =============================================================================
info "Performing health checks..."
echo ""

# Backend health
BACKEND_HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "failed")
if echo "$BACKEND_HEALTH" | grep -q "ok"; then
    log "Backend Health: ✅ OK"
else
    warn "Backend Health: ⚠️  Not responding"
    warn "  Response: $BACKEND_HEALTH"
    warn "  Check logs: pm2 logs nexusvpn-backend"
fi

# Frontend health
FRONTEND_HEALTH=$(curl -s -I http://localhost:5173 2>/dev/null | head -1 || echo "failed")
if echo "$FRONTEND_HEALTH" | grep -q "200 OK"; then
    log "Frontend Health: ✅ OK"
else
    warn "Frontend Health: ⚠️  Not responding"
    warn "  Response: $FRONTEND_HEALTH"
    if systemctl is-active --quiet nexusvpn-frontend 2>/dev/null; then
        warn "  Check logs: journalctl -u nexusvpn-frontend -n 50"
    else
        warn "  Check logs: tail -f /tmp/frontend.log"
    fi
fi

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "========================================="
echo "  📊 Verification Summary"
echo "========================================="
echo ""

ALL_OK=true

# PostgreSQL
if systemctl is-active --quiet postgresql && systemctl is-enabled --quiet postgresql; then
    echo "  ✅ PostgreSQL: Running & Auto-Start Enabled"
else
    echo "  ❌ PostgreSQL: Issues detected"
    ALL_OK=false
fi

# PM2 Backend
if pm2 list | grep -q "nexusvpn-backend.*online" && [ -f /etc/systemd/system/pm2-root.service ]; then
    echo "  ✅ PM2 Backend: Running & Auto-Start Configured"
else
    echo "  ❌ PM2 Backend: Issues detected"
    ALL_OK=false
fi

# Frontend
if (systemctl is-active --quiet nexusvpn-frontend 2>/dev/null && systemctl is-enabled --quiet nexusvpn-frontend 2>/dev/null) || pgrep -f "vite.*5173" > /dev/null; then
    echo "  ✅ Frontend: Running"
    if systemctl is-enabled --quiet nexusvpn-frontend 2>/dev/null; then
        echo "     ✅ Auto-Start Enabled"
    else
        echo "     ⚠️  Auto-Start NOT Enabled (running manually)"
    fi
else
    echo "  ❌ Frontend: Not running"
    ALL_OK=false
fi

echo ""

if [ "$ALL_OK" = true ]; then
    log "🎉 All services are running and configured for auto-start!"
    echo ""
    info "Access URLs:"
    echo "  Frontend: http://${SERVER_IP}:5173"
    echo "  Backend:  http://${SERVER_IP}:3000/api"
    echo "  Admin:    http://${SERVER_IP}:5173/#/admin"
    echo ""
else
    warn "⚠️  Some services need attention. Review the output above."
    echo ""
    info "Troubleshooting commands:"
    echo "  PostgreSQL: sudo systemctl status postgresql"
    echo "  PM2:        pm2 status"
    echo "  Frontend:   sudo systemctl status nexusvpn-frontend"
    echo ""
fi

echo ""

