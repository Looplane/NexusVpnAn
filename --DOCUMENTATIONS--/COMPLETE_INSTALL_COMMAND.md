# 🚀 Complete Installation Command

## Single Command to Finish Installation

After running the main auto-install script, run this single command:

```bash
cd /opt/nexusvpn && bash -c 'cd backend && npm install --production && cd ../frontend && npm install --production && cd .. && SERVER_IP=$(hostname -I | awk '\''{print $1}'\'') && WG_KEY=$(cat /etc/wireguard/publickey) && JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64) && cat > backend/.env << EOF
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
echo "" && echo "=========================================" && echo "  ✅ INSTALLATION COMPLETE!" && echo "=========================================" && echo "" && echo "📋 Database: nexusvpn / nexusvpn / sCEAMgreErEqlV8zgP36p7R9Z" && echo "🔐 WireGuard Key: ${WG_KEY}" && echo "🌐 Backend: http://${SERVER_IP}:3000" && echo "🌐 Frontend: http://${SERVER_IP}:5173" && echo ""'
```

---

## Alternative: Download and Run Script

```bash
# Download the completion script
wget -O /tmp/complete.sh https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/complete-installation.sh

# Run it
chmod +x /tmp/complete.sh
bash /tmp/complete.sh
```

---

## Or: Copy-Paste This Block

```bash
cd /opt/nexusvpn
cd backend && npm install --production && cd ..
cd frontend && npm install --production && cd ..
SERVER_IP=$(hostname -I | awk '{print $1}')
WG_KEY=$(cat /etc/wireguard/publickey)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
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
echo ""
echo "========================================="
echo "  ✅ INSTALLATION COMPLETE!"
echo "========================================="
echo ""
echo "📋 Database: nexusvpn / nexusvpn / sCEAMgreErEqlV8zgP36p7R9Z"
echo "🔐 WireGuard Key: ${WG_KEY}"
echo "🌐 Backend: http://${SERVER_IP}:3000"
echo "🌐 Frontend: http://${SERVER_IP}:5173"
echo ""
```

