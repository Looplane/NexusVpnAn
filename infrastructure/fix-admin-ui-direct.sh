#!/bin/bash
# =============================================================================
# 🔧 Direct Fix for Admin UI - No Git Required
# =============================================================================
# This script directly updates Admin.tsx with new UI labels
# Use this when git pull fails due to authentication
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

ADMIN_FILE="/opt/nexusvpn/frontend/pages/Admin.tsx"

if [ ! -f "$ADMIN_FILE" ]; then
    echo "❌ Admin.tsx not found at $ADMIN_FILE"
    exit 1
fi

log "Backing up Admin.tsx..."
cp "$ADMIN_FILE" "${ADMIN_FILE}.backup.$(date +%Y%m%d-%H%M%S)"

log "Updating UI labels..."

# Replace old labels with new ones
sed -i "s/label: 'Overview'/label: 'Dashboard'/g" "$ADMIN_FILE"
sed -i "s/label: 'Nodes'/label: 'VPN Servers'/g" "$ADMIN_FILE"
sed -i "s/label: 'Configuration'/label: 'Settings'/g" "$ADMIN_FILE"

# Also update tab content headers if needed
sed -i "s/Overview Tab Content/Dashboard Tab Content/g" "$ADMIN_FILE"
sed -i "s/Infrastructure Nodes/Infrastructure Servers/g" "$ADMIN_FILE"

log "Verifying changes..."
if grep -q "label: 'Dashboard'" "$ADMIN_FILE" && grep -q "label: 'VPN Servers'" "$ADMIN_FILE"; then
    log "✅ UI labels updated successfully!"
else
    warn "⚠️  Some labels may not have been updated. Check manually."
fi

log "Restarting frontend..."
pkill -9 -f vite 2>/dev/null || true
sleep 2

cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 3

if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    log "✅ Frontend restarted successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Clear browser cache: Ctrl+Shift+R"
    echo "   2. Access: http://5.161.91.222:5173/#/admin"
    echo "   3. You should see: Dashboard, VPN Servers, Settings"
else
    warn "⚠️  Frontend may not have started. Check: tail -f /tmp/frontend.log"
fi

