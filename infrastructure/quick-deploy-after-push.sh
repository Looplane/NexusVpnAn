#!/bin/bash
# =============================================================================
# 🚀 Quick Deploy After GitHub Push
# =============================================================================
# Run this on your server after pushing to GitHub
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }

DEPLOYMENT_DIR="/opt/nexusvpn"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "========================================="
echo "  🚀 Quick Deploy After GitHub Push"
echo "========================================="
echo ""

# 1. Pull latest code
log "Pulling latest code from GitHub..."
cd "$DEPLOYMENT_DIR"
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    info "Already up to date. No changes to deploy."
else
    log "New changes detected. Pulling..."
    git pull origin main
    
    # 2. Update backend
    log "Updating backend..."
    cd backend
    npm ci --production
    npm run build
    
    # 3. Update frontend
    log "Updating frontend..."
    cd ../frontend
    npm ci
    
    # 4. Restart backend
    log "Restarting backend..."
    pm2 restart nexusvpn-backend || pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
    
    # 5. Restart frontend
    log "Restarting frontend..."
    pkill -f vite || true
    sleep 2
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
    
    log "Deployment complete!"
fi

# 6. Verify services
echo ""
log "Verifying services..."
sleep 3

BACKEND_OK=$(curl -s http://localhost:3000/api/health | grep -q "ok" && echo "OK" || echo "FAIL")
FRONTEND_OK=$(curl -s -I http://localhost:5173 | grep -q "200 OK" && echo "OK" || echo "FAIL")

echo ""
echo "========================================="
echo "  📊 Service Status"
echo "========================================="
echo "Backend:  $BACKEND_OK"
echo "Frontend: $FRONTEND_OK"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend:  http://${SERVER_IP}:3000/api"
echo "   Proxy:    http://${SERVER_IP}"
echo ""
echo "📋 Next Steps:"
echo "   1. Access admin panel: http://${SERVER_IP}:5173/#/admin"
echo "   2. Add real VPN servers"
echo "   3. Test VPN config generation"
echo ""

