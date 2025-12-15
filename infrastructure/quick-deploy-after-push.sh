#!/bin/bash
# =============================================================================
# 🚀 Quick Deploy After GitHub Push
# =============================================================================
# Run this on your server after pushing to GitHub
# Handles conflicts gracefully and ensures clean deployment
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
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "========================================="
echo "  🚀 Quick Deploy After GitHub Push"
echo "========================================="
echo ""

# 1. Navigate to deployment directory
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    error "Deployment directory $DEPLOYMENT_DIR does not exist!"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

# 2. Check if it's a git repository
if [ ! -d ".git" ]; then
    error "Not a git repository!"
    exit 1
fi

# 3. Handle local changes and conflicts
info "Checking for local changes..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    warn "Local changes detected. Stashing them..."
    git stash push -m "Server-specific changes $(date +%Y%m%d-%H%M%S)" || true
fi

# 4. Remove server-specific untracked files that might conflict
info "Cleaning up server-specific files..."
git clean -fd infrastructure/ 2>/dev/null || true

# 5. Fetch and pull latest code
log "Fetching latest code from GitHub..."
git fetch origin main || {
    error "Failed to fetch from GitHub"
    exit 1
}

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    info "Already up to date. No changes to deploy."
else
    log "New changes detected. Pulling..."
    
    # Try pull first
    if ! git pull origin main; then
        warn "Pull failed due to conflicts. Resetting to remote..."
        git fetch origin main
        git reset --hard origin/main || {
            error "Failed to reset to remote branch"
            exit 1
        }
    fi
    
    log "Code updated successfully!"
    
    # 6. Update backend
    if [ -d "backend" ]; then
        log "Updating backend..."
        cd backend
        npm ci --production || npm install --production
        npm run build || {
            error "Backend build failed!"
            exit 1
        }
        cd ..
    fi
    
    # 7. Update frontend
    if [ -d "frontend" ]; then
        log "Updating frontend..."
        cd frontend
        npm ci || npm install
        cd ..
    fi
    
    # 8. Restart backend
    log "Restarting backend..."
    cd backend
    pm2 restart nexusvpn-backend 2>/dev/null || pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
    cd ..
    
    # 9. Restart frontend
    log "Restarting frontend..."
    pkill -f vite || true
    sleep 2
    cd frontend
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
    cd ..
    
    log "Deployment complete!"
fi

# 10. Verify services
echo ""
log "Verifying services..."
sleep 3

BACKEND_OK=$(curl -s http://localhost:3000/api/health 2>/dev/null | grep -q "ok" && echo "✅ OK" || echo "❌ FAIL")
FRONTEND_OK=$(curl -s -I http://localhost:5173 2>/dev/null | grep -q "200 OK" && echo "✅ OK" || echo "❌ FAIL")

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
