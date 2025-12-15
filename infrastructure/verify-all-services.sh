#!/bin/bash
# Verify all NexusVPN services are running

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "  ✅ NexusVPN Services Verification"
echo "========================================="
echo ""

# Check PostgreSQL
echo -n "PostgreSQL: "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Check Backend (PM2)
echo -n "Backend (PM2): "
if pm2 list | grep -q "nexusvpn-backend.*online"; then
    echo -e "${GREEN}✅ Running${NC}"
    pm2 list | grep nexusvpn-backend
else
    echo -e "${RED}❌ Not Running${NC}"
fi

# Check Frontend
echo -n "Frontend (Port 5173): "
if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    echo -e "${GREEN}✅ Running${NC}"
    netstat -tlnp | grep 5173
else
    echo -e "${RED}❌ Not Running${NC}"
    echo -e "${YELLOW}   Starting frontend...${NC}"
    cd /opt/nexusvpn/frontend
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
    sleep 3
    if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
        echo -e "${GREEN}   ✅ Frontend started!${NC}"
    else
        echo -e "${RED}   ❌ Failed to start frontend${NC}"
    fi
fi

# Check Backend Port
echo -n "Backend API (Port 3000): "
if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    echo -e "${GREEN}✅ Listening${NC}"
else
    echo -e "${RED}❌ Not Listening${NC}"
fi

# Check Database Connection
echo -n "Database Connection: "
if sudo -u postgres psql -d nexusvpn -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected${NC}"
else
    echo -e "${RED}❌ Connection Failed${NC}"
fi

# Check Windows Server in DB
echo ""
echo "Windows Server in Database:"
sudo -u postgres psql -d nexusvpn -c "SELECT name, ipv4, \"sshUser\" FROM servers WHERE ipv4 = '91.99.23.239';"

echo ""
echo "========================================="
echo "  🌐 Access URLs"
echo "========================================="
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Frontend: http://${SERVER_IP}:5173"
echo "Backend:  http://${SERVER_IP}:3000/api"
echo "Admin:    http://${SERVER_IP}:5173/#/admin"
echo ""

