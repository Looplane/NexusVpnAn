#!/bin/bash
# Complete NexusVPN Installation Script
# Run this after the main auto-install script

set -e

cd /opt/nexusvpn

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install --production && cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install --production && cd ..

# Get server IP and WireGuard key
SERVER_IP=$(hostname -I | awk '{print $1}')
WG_KEY=$(cat /etc/wireguard/publickey)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# Create backend .env
echo "Creating backend configuration..."
cat > backend/.env << EOF
DATABASE_URL=postgresql://nexusvpn:sCEAMgreErEqlV8zgP36p7R9Z@localhost:5432/nexusvpn
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nexusvpn
DB_PASSWORD=sCEAMgreErEqlV8zgP36p7R9Z
DB_DATABASE=nexusvpn
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
API_PREFIX=api
FRONTEND_URL=http://${SERVER_IP}:5173
MOCK_SSH=false
WG_SERVER_IP=${SERVER_IP}
WG_SERVER_PORT=51820
WG_SERVER_PUBLIC_KEY=${WG_KEY}
CORS_ORIGIN=http://${SERVER_IP}:5173
EOF

# Show summary
echo ""
echo "========================================="
echo "  ✅ INSTALLATION COMPLETE!"
echo "========================================="
echo ""
echo "📋 Database Credentials:"
echo "   Database: nexusvpn"
echo "   User: nexusvpn"
echo "   Password: sCEAMgreErEqlV8zgP36p7R9Z"
echo ""
echo "🔐 WireGuard Public Key:"
echo "   ${WG_KEY}"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://${SERVER_IP}:3000"
echo "   Frontend: http://${SERVER_IP}:5173"
echo ""
echo "📁 Deployment Directory: /opt/nexusvpn"
echo ""
echo "🚀 Next Steps:"
echo "   1. Start backend: cd /opt/nexusvpn/backend && npm run start:prod"
echo "   2. Start frontend: cd /opt/nexusvpn/frontend && npm run dev"
echo ""

