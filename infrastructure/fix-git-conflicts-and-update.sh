#!/bin/bash
# =============================================================================
# 🔧 Fix Git Conflicts and Update to Latest Code
# =============================================================================
# This script handles local changes and updates to latest GitHub code
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

cd /opt/nexusvpn

# 1. Stash local changes
log "Stashing local changes..."
git stash push -m "Local changes before update $(date +%Y%m%d-%H%M%S)" || true

# 2. Reset to remote (discard any remaining local changes)
log "Resetting to remote branch..."
git fetch origin main
git reset --hard origin/main

# 3. Clean untracked files that might conflict
log "Cleaning untracked files..."
git clean -fd frontend/ 2>/dev/null || true

# 4. Verify we have the latest code
CURRENT=$(git rev-parse --short HEAD)
REMOTE=$(git rev-parse --short origin/main)
log "Current commit: $CURRENT (should match remote: $REMOTE)"

# 5. Verify Admin.tsx has new UI
if grep -q "label: 'Dashboard'" frontend/pages/Admin.tsx 2>/dev/null; then
    log "✅ New UI code confirmed in Admin.tsx"
else
    error "❌ Admin.tsx still has old UI!"
    exit 1
fi

# 6. Update backend
log "Updating backend..."
cd backend
rm -rf node_modules
npm install --production
npm run build
cd ..

# 7. Update frontend
log "Updating frontend..."
cd frontend
rm -rf node_modules .vite
npm install
cd ..

# 8. Restart backend
log "Restarting backend..."
cd backend
pm2 restart nexusvpn-backend || pm2 start dist/main.js --name nexusvpn-backend
pm2 save
cd ..

# 9. Restart frontend
log "Restarting frontend..."
pkill -9 -f vite 2>/dev/null || true
sleep 2
cd frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 3
cd ..

# 10. Verify
log "Verifying services..."
sleep 3

if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    log "✅ Frontend is running on port 5173"
else
    error "❌ Frontend not running. Check: tail -f /tmp/frontend.log"
fi

if pm2 list | grep -q "nexusvpn-backend.*online"; then
    log "✅ Backend is running"
else
    error "❌ Backend not running. Check: pm2 logs nexusvpn-backend"
fi

echo ""
log "Update complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Clear browser cache: Ctrl+Shift+R"
echo "   2. Access: http://5.161.91.222:5173/#/admin"
echo "   3. You should see: Dashboard, VPN Servers, Settings"
echo ""

