#!/bin/bash
# =============================================================================
# 🔧 COMPLETE FIX & START SCRIPT FOR NEXUSVPN
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}🔧 Fixing and Starting NexusVPN Services${NC}"
echo ""

# Step 1: Clean up
echo -e "${YELLOW}[1/7] Cleaning up processes...${NC}"
pkill -f vite || true
pkill -f "npm run dev" || true
fuser -k 5173/tcp 5174/tcp 5175/tcp 5176/tcp 2>/dev/null || true
sleep 2

# Step 2: Fix database
echo -e "${YELLOW}[2/7] Fixing database...${NC}"
sudo -u postgres psql -d nexusvpn << EOF > /dev/null 2>&1
GRANT ALL ON SCHEMA public TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusvpn;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Step 3: Update backend .env with correct frontend URL
echo -e "${YELLOW}[3/7] Updating backend configuration...${NC}"
cd /opt/nexusvpn/backend
if [ -f .env ]; then
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://${SERVER_IP}:5173|" .env
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=http://${SERVER_IP}:5173|" .env
fi

# Step 4: Restart backend
echo -e "${YELLOW}[4/7] Restarting backend...${NC}"
pm2 restart nexusvpn-backend
sleep 3

# Step 5: Create frontend .env file
echo -e "${YELLOW}[5/7] Configuring frontend...${NC}"
cd /opt/nexusvpn/frontend
cat > .env << EOF
VITE_API_URL=http://${SERVER_IP}:3000/api
EOF

# Step 6: Start frontend
echo -e "${YELLOW}[6/7] Starting frontend...${NC}"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &

# Step 7: Update firewall
echo -e "${YELLOW}[7/7] Updating firewall...${NC}"
ufw allow 5173/tcp comment 'NexusVPN Frontend' 2>/dev/null || true

# Wait and verify
echo ""
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Final status
echo ""
echo -e "${GREEN}========================================="
echo "  ✅ SERVICES STARTED!"
echo "=========================================${NC}"
echo ""

# Check services
BACKEND_UP=$(netstat -tlnp | grep -q ":3000" && echo "✅" || echo "❌")
FRONTEND_UP=$(netstat -tlnp | grep -q ":5173" && echo "✅" || echo "❌")

echo "📊 Service Status:"
echo "   Backend:  $BACKEND_UP"
echo "   Frontend: $FRONTEND_UP"
echo ""

echo "🌐 Access URLs:"
echo "   ${GREEN}Frontend: http://${SERVER_IP}:5173${NC}  ← Use this in your browser!"
echo "   Backend API: http://${SERVER_IP}:3000"
echo "   API Docs: http://${SERVER_IP}:3000/api/docs"
echo "   Health: http://${SERVER_IP}:3000/api/health"
echo ""

# Test backend
echo "🧪 Testing backend..."
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo "   ✅ Backend health check passed"
else
    echo "   ⚠️  Backend health check failed"
fi

echo ""
echo "📋 Management:"
echo "   Backend logs: pm2 logs nexusvpn-backend"
echo "   Frontend logs: tail -f /tmp/frontend.log"
echo "   Restart backend: pm2 restart nexusvpn-backend"
echo ""

if [ "$FRONTEND_UP" = "✅" ] && [ "$BACKEND_UP" = "✅" ]; then
    echo -e "${GREEN}✅ All services running!${NC}"
    echo ""
    echo "Open in browser: http://${SERVER_IP}:5173"
else
    echo -e "${YELLOW}⚠️  Check logs if services aren't running${NC}"
fi

echo ""

