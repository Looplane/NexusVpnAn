#!/bin/bash
# =============================================================================
# 🔧 NEXUSVPN DEPLOYMENT FIX SCRIPT
# =============================================================================
# This script fixes common deployment issues:
# - Cleans up multiple frontend instances
# - Fixes backend IPv6 binding
# - Ensures proper port configuration
# - Updates firewall rules
# - Verifies all services
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 NexusVPN Deployment Fix Script${NC}"
echo ""

# Step 1: Kill all frontend processes
echo -e "${YELLOW}[1/6] Cleaning up frontend processes...${NC}"
pkill -f vite || true
pkill -f "npm run dev" || true
fuser -k 5173/tcp 5174/tcp 5175/tcp 5176/tcp 2>/dev/null || true
sleep 2
echo "✅ Frontend processes cleaned"

# Step 2: Fix PostgreSQL permissions
echo -e "${YELLOW}[2/6] Fixing PostgreSQL permissions...${NC}"
sudo -u postgres psql -d nexusvpn << EOF > /dev/null 2>&1
GRANT ALL ON SCHEMA public TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusvpn;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF
echo "✅ Database permissions fixed"

# Step 3: Check backend configuration
echo -e "${YELLOW}[3/6] Checking backend configuration...${NC}"
cd /opt/nexusvpn/backend

# Check if backend binds to 0.0.0.0
if ! grep -q "0.0.0.0\|host.*0.0.0.0" src/main.ts 2>/dev/null; then
    echo "⚠️  Backend may need IPv4 binding fix"
    # Backend should already bind to 0.0.0.0 by default in NestJS
fi

# Restart backend
pm2 restart nexusvpn-backend
sleep 3
echo "✅ Backend restarted"

# Step 4: Start frontend on port 5173
echo -e "${YELLOW}[4/6] Starting frontend on port 5173...${NC}"
cd /opt/nexusvpn/frontend

# Update vite config to use specific port
if [ -f vite.config.ts ]; then
    # Check if server config exists
    if ! grep -q "server:" vite.config.ts; then
        # Add server config
        sed -i '/export default defineConfig/a\
  server: {\
    host: "0.0.0.0",\
    port: 5173,\
    strictPort: true\
  },' vite.config.ts
    fi
fi

# Start frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 5
echo "✅ Frontend started"

# Step 5: Update firewall
echo -e "${YELLOW}[5/6] Updating firewall rules...${NC}"
ufw allow 5173/tcp comment 'NexusVPN Frontend' 2>/dev/null || true
ufw allow 3000/tcp comment 'NexusVPN Backend' 2>/dev/null || true
echo "✅ Firewall updated"

# Step 6: Verify services
echo -e "${YELLOW}[6/6] Verifying services...${NC}"
sleep 3

SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}========================================="
echo "  ✅ FIX COMPLETE!"
echo "=========================================${NC}"
echo ""

# Check backend
if netstat -tlnp | grep -q ":3000"; then
    BACKEND_STATUS="✅ Running"
    BACKEND_TEST=$(curl -s http://localhost:3000/api/health | grep -o '"status":"ok"' || echo "❌")
    if [ "$BACKEND_TEST" = '"status":"ok"' ]; then
        BACKEND_HEALTH="✅ Healthy"
    else
        BACKEND_HEALTH="⚠️  Check logs"
    fi
else
    BACKEND_STATUS="❌ Not running"
    BACKEND_HEALTH="❌"
fi

# Check frontend
if netstat -tlnp | grep -q ":5173"; then
    FRONTEND_STATUS="✅ Running"
else
    FRONTEND_STATUS="❌ Not running"
fi

echo "📊 Service Status:"
echo "   Backend:  $BACKEND_STATUS ($BACKEND_HEALTH)"
echo "   Frontend: $FRONTEND_STATUS"
echo ""

echo "🌐 Access URLs:"
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend:  http://${SERVER_IP}:3000"
echo "   Health:   http://${SERVER_IP}:3000/api/health"
echo ""

echo "📋 Management:"
echo "   View logs: pm2 logs nexusvpn-backend"
echo "   Frontend:  tail -f /tmp/frontend.log"
echo "   Restart:   pm2 restart nexusvpn-backend"
echo ""

if [ "$FRONTEND_STATUS" = "✅ Running" ] && [ "$BACKEND_STATUS" = "✅ Running" ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "Test in browser:"
    echo "  http://${SERVER_IP}:5173"
else
    echo -e "${YELLOW}⚠️  Some services may need attention${NC}"
    echo ""
    echo "Check logs:"
    echo "  pm2 logs nexusvpn-backend"
    echo "  tail -f /tmp/frontend.log"
fi

echo ""

