#!/bin/bash
# =============================================================================
# 🔄 Complete Frontend Update - Force Clear Cache
# =============================================================================
# This script completely updates the frontend and clears all caches
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
GITHUB_BRANCH="main"

echo "========================================="
echo "  🔄 Complete Frontend Update"
echo "========================================="
echo ""

cd "$DEPLOYMENT_DIR"

# 1. Verify git status
info "Checking git status..."
CURRENT=$(git rev-parse --short HEAD)
REMOTE=$(git rev-parse --short origin/$GITHUB_BRANCH)
info "Current: $CURRENT | Remote: $REMOTE"

if [ "$CURRENT" != "$REMOTE" ]; then
    log "Pulling latest code..."
    git fetch origin "$GITHUB_BRANCH"
    git reset --hard origin/"$GITHUB_BRANCH"
else
    warn "Code is up to date, but forcing frontend rebuild..."
fi

# 2. Check Admin.tsx file to verify it has new UI
info "Checking Admin.tsx for new UI..."
if grep -q "label: 'Dashboard'" frontend/pages/Admin.tsx 2>/dev/null; then
    log "✅ New UI code found in Admin.tsx"
else
    error "❌ Old UI code still present! Git pull may have failed."
    error "Current Admin.tsx content:"
    grep -A 5 "activeTab === 'overview'" frontend/pages/Admin.tsx 2>/dev/null || echo "File not found or different structure"
    exit 1
fi

# 3. Stop frontend completely
log "Stopping frontend..."
pkill -9 -f "vite" 2>/dev/null || true
pkill -9 -f "node.*5173" 2>/dev/null || true
sleep 3

# 4. Clean frontend completely
log "Cleaning frontend..."
cd frontend

# Remove all caches and build artifacts
rm -rf node_modules
rm -rf .vite
rm -rf dist
rm -rf .next
rm -rf build
rm -f package-lock.json

# 5. Fresh install
log "Installing fresh dependencies..."
npm install

# 6. Verify Admin.tsx is correct
info "Verifying Admin.tsx has correct tabs..."
if grep -q "label: 'Dashboard'" pages/Admin.tsx && grep -q "label: 'VPN Servers'" pages/Admin.tsx; then
    log "✅ Admin.tsx has correct new UI"
else
    error "❌ Admin.tsx still has old UI!"
    error "Showing relevant lines:"
    grep -A 10 "activeTab === 'overview'" pages/Admin.tsx || grep -A 10 "Dashboard\|VPN Servers" pages/Admin.tsx
    exit 1
fi

# 7. Start frontend
log "Starting frontend..."
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 5

# 8. Verify frontend is running
if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    log "✅ Frontend is running on port 5173"
else
    error "❌ Frontend failed to start!"
    error "Check logs: tail -f /tmp/frontend.log"
    exit 1
fi

# 9. Check what's actually being served
info "Checking frontend response..."
RESPONSE=$(curl -s http://localhost:5173 2>/dev/null | head -20)
if echo "$RESPONSE" | grep -q "nexusvpn\|vite\|react"; then
    log "✅ Frontend is serving content"
else
    warn "⚠️  Frontend response looks unusual"
    echo "$RESPONSE"
fi

echo ""
echo "========================================="
echo "  ✅ Frontend Update Complete"
echo "========================================="
echo ""
echo "📋 Next Steps:"
echo "   1. Clear browser cache completely:"
echo "      - Chrome: Settings → Privacy → Clear browsing data → Cached images"
echo "      - Or use Incognito/Private window"
echo ""
echo "   2. Access: http://5.161.91.222:5173/#/admin"
echo ""
echo "   3. You should see:"
echo "      ✅ Dashboard (not Overview)"
echo "      ✅ VPN Servers (not Nodes)"
echo "      ✅ Settings (not Configuration)"
echo ""
echo "   4. If still old UI, check:"
echo "      tail -f /tmp/frontend.log"
echo "      curl http://localhost:5173 | grep -i 'dashboard\|overview'"
echo ""

