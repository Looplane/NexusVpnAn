#!/bin/bash
# =============================================================================
# 🔄 Force Update from GitHub - Fix UI Issues
# =============================================================================
# This script forcefully pulls latest code and redeploys everything
# Use this when server UI is outdated
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
GITHUB_REPO="https://github.com/Looplane/NexusVpnAn.git"
GITHUB_BRANCH="main"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "========================================="
echo "  🔄 Force Update from GitHub"
echo "========================================="
echo ""

# Check deployment directory
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    error "Deployment directory $DEPLOYMENT_DIR does not exist!"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

# Check git status
info "Checking git status..."
if [ ! -d ".git" ]; then
    error "Not a git repository!"
    exit 1
fi

# Show current commit
CURRENT_COMMIT=$(git rev-parse --short HEAD)
info "Current commit: $CURRENT_COMMIT"

# Configure git (if needed)
git config --global --get user.name > /dev/null 2>&1 || git config --global user.name "NexusVPN Server"
git config --global --get user.email > /dev/null 2>&1 || git config --global user.email "server@nexusvpn.local"

# Stash any local changes
info "Stashing local changes..."
git stash push -m "Pre-update stash $(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

# Fetch latest
log "Fetching latest from GitHub..."
git fetch origin "$GITHUB_BRANCH" || {
    error "Failed to fetch from GitHub"
    error "Check GitHub authentication or network connection"
    exit 1
}

# Get remote commit
REMOTE_COMMIT=$(git rev-parse --short origin/$GITHUB_BRANCH)
info "Remote commit: $REMOTE_COMMIT"

if [ "$CURRENT_COMMIT" = "$REMOTE_COMMIT" ]; then
    warn "Already at latest commit. Forcing rebuild anyway..."
else
    log "New commits detected. Updating code..."
fi

# Force reset to remote (discard all local changes)
log "Resetting to remote branch..."
git fetch origin "$GITHUB_BRANCH"
git reset --hard origin/"$GITHUB_BRANCH" || {
    error "Failed to reset to remote"
    exit 1
}

log "Code updated successfully!"

# Update Backend
if [ -d "backend" ]; then
    log "Updating backend dependencies..."
    cd backend
    
    # Remove node_modules for clean install
    if [ -d "node_modules" ]; then
        info "Removing old node_modules..."
        rm -rf node_modules
    fi
    
    # Install dependencies
    npm install --production || {
        error "Backend npm install failed!"
        exit 1
    }
    
    # Build backend
    log "Building backend..."
    npm run build || {
        error "Backend build failed!"
        exit 1
    }
    
    cd ..
    log "Backend updated and built"
fi

# Update Frontend
if [ -d "frontend" ]; then
    log "Updating frontend dependencies..."
    cd frontend
    
    # Remove node_modules for clean install
    if [ -d "node_modules" ]; then
        info "Removing old node_modules..."
        rm -rf node_modules
    fi
    
    # Remove .vite cache
    if [ -d ".vite" ]; then
        info "Clearing Vite cache..."
        rm -rf .vite
    fi
    
    # Install dependencies (including dev for vite)
    log "Installing frontend dependencies..."
    npm install || {
        error "Frontend npm install failed!"
        exit 1
    }
    
    cd ..
    log "Frontend updated"
fi

# Stop existing services
log "Stopping existing services..."
pm2 stop nexusvpn-backend 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Start Backend
log "Starting backend..."
cd backend
pm2 start dist/main.js --name nexusvpn-backend || pm2 restart nexusvpn-backend
pm2 save
cd ..
log "Backend started"

# Start Frontend
log "Starting frontend..."
cd frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 3
cd ..
log "Frontend started"

# Verify services
echo ""
log "Verifying services..."
sleep 5

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
echo "   Admin:    http://${SERVER_IP}:5173/#/admin"
echo ""
echo "📋 Next Steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R)"
echo "   2. Access admin panel: http://${SERVER_IP}:5173/#/admin"
echo "   3. You should see: Dashboard, VPN Servers, Users, etc."
echo ""

log "Update complete!"

