#!/bin/bash
# =============================================================================
# 🔄 GitHub Auto-Deployment Script for NexusVPN
# =============================================================================
# This script automatically pulls latest changes from GitHub and redeploys
# Can be triggered via:
# 1. GitHub Webhook (recommended)
# 2. Cron job (polling)
# 3. Manual execution
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOYMENT_DIR="/opt/nexusvpn"
GITHUB_REPO="https://github.com/Looplane/NexusVpnAn.git"
GITHUB_BRANCH="main"
LOG_FILE="/var/log/nexusvpn-deploy.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Create log file if it doesn't exist
touch "$LOG_FILE"

log "🚀 Starting auto-deployment..."

# Check if deployment directory exists
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    error "Deployment directory $DEPLOYMENT_DIR does not exist!"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

# Check if it's a git repository
if [ ! -d ".git" ]; then
    error "Not a git repository. Cloning..."
    rm -rf "$DEPLOYMENT_DIR"/*
    git clone -b "$GITHUB_BRANCH" "$GITHUB_REPO" "$DEPLOYMENT_DIR"
    cd "$DEPLOYMENT_DIR"
else
    # Fetch latest changes
    info "Fetching latest changes from GitHub..."
    git fetch origin "$GITHUB_BRANCH" || {
        error "Failed to fetch from GitHub"
        exit 1
    }
    
    # Check if there are updates
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$GITHUB_BRANCH)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        info "Already up to date. No deployment needed."
        exit 0
    fi
    
    info "New changes detected. Preparing to pull latest code..."
    
    # Handle local changes and conflicts gracefully
    # Stash local changes to server-specific files
    info "Stashing local server-specific changes..."
    git stash push -m "Server-specific changes $(date +%Y%m%d-%H%M%S)" || true
    
    # Remove untracked files that might conflict (server-specific configs)
    info "Cleaning up server-specific untracked files..."
    git clean -fd infrastructure/ || true
    
    # Pull latest code
    info "Pulling latest code from GitHub..."
    git pull origin "$GITHUB_BRANCH" || {
        error "Failed to pull from GitHub. Attempting reset..."
        # If pull fails, reset to remote (discard local changes)
        git fetch origin "$GITHUB_BRANCH"
        git reset --hard origin/"$GITHUB_BRANCH" || {
            error "Failed to reset to remote branch"
            exit 1
        }
    }
    
    info "Successfully updated code from GitHub"
fi

# Install/Update Backend Dependencies
if [ -d "backend" ]; then
    log "Installing backend dependencies..."
    cd backend
    npm ci --production || npm install --production
    npm run build || {
        error "Backend build failed!"
        exit 1
    }
    cd ..
fi

# Install/Update Frontend Dependencies
if [ -d "frontend" ]; then
    log "Installing frontend dependencies..."
    cd frontend
    # Try npm ci first, fall back to npm install if lock file is out of sync
    if ! npm ci 2>/dev/null; then
        info "package-lock.json out of sync, updating..."
        npm install
    fi
    cd ..
fi

# Restart Backend with PM2
if command -v pm2 &> /dev/null; then
    log "Restarting backend with PM2..."
    cd "$DEPLOYMENT_DIR/backend"
    pm2 restart nexusvpn-backend || pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
fi

# Restart Frontend
log "Restarting frontend..."
pkill -f "vite" || true
sleep 2
cd "$DEPLOYMENT_DIR/frontend"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &

# Get server IP dynamically
SERVER_IP=$(hostname -I | awk '{print $1}')

log "✅ Deployment completed successfully!"
log "Backend: http://${SERVER_IP}:3000"
log "Frontend: http://${SERVER_IP}:5173"

exit 0

