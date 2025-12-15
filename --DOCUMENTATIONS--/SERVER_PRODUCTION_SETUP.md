# 🚀 Server-Side Production Setup (Run on Server)

## Quick Setup

**Copy and paste this entire command on your server:**

```bash
cd /opt/nexusvpn && cat > /tmp/create-prod.sh << 'EOF'
#!/bin/bash
cat > /opt/nexusvpn/infrastructure/setup-production.sh << 'PRODSCRIPT'
#!/bin/bash
set -e
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
DEPLOYMENT_DIR="/opt/nexusvpn"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "========================================="
echo "  🚀 Production Setup"
echo "========================================="
log "Configuring production environment..."
cd "$DEPLOYMENT_DIR/backend"
DB_PASSWORD=$(grep "DB_PASSWORD" .env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo "sCEAMgreErEqlV8zgP36p7R9Z")
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
cat > .env.production << ENVFILE
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=nexusvpn
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=nexusvpn
DATABASE_URL=postgresql://nexusvpn:${DB_PASSWORD}@localhost:5432/nexusvpn
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d
FRONTEND_URL=http://${SERVER_IP}:5173
CORS_ORIGIN=http://${SERVER_IP}:5173
SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
SSH_PUBLIC_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa.pub
MOCK_SSH=false
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
LOG_LEVEL=info
SWAGGER_ENABLED=false
ENVFILE
sed -i 's/MOCK_SSH=.*/MOCK_SSH=false/g' .env 2>/dev/null || echo "MOCK_SSH=false" >> .env
log "Backend configured (REAL DATA MODE)"
cd "$DEPLOYMENT_DIR/frontend"
cat > .env.production << ENVFILE
VITE_API_URL=http://${SERVER_IP}:3000/api
VITE_APP_NAME=NexusVPN
VITE_APP_VERSION=1.0.0
ENVFILE
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://${SERVER_IP}:3000/api|g" .env 2>/dev/null || echo "VITE_API_URL=http://${SERVER_IP}:3000/api" >> .env
log "Frontend configured"
mkdir -p /opt/nexusvpn/.ssh /var/log/nexusvpn
chmod 700 /opt/nexusvpn/.ssh
if [ ! -f "/opt/nexusvpn/.ssh/id_rsa" ]; then
    ssh-keygen -t rsa -b 4096 -f /opt/nexusvpn/.ssh/id_rsa -N "" -q
    log "SSH key generated"
fi
chmod 600 /opt/nexusvpn/.ssh/id_rsa
chmod 644 /opt/nexusvpn/.ssh/id_rsa.pub
log "SSH keys ready"
cat > "$DEPLOYMENT_DIR/backend/ecosystem.config.js" << PM2FILE
module.exports = {
  apps: [{
    name: 'nexusvpn-backend',
    script: './dist/main.js',
    cwd: '/opt/nexusvpn/backend',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3000 },
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/nexusvpn/backend-error.log',
    out_file: '/var/log/nexusvpn/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
};
PM2FILE
log "PM2 configured"
cat > /etc/nginx/sites-available/nexusvpn << NGINXFILE
upstream nexusvpn_backend { server localhost:3000; keepalive 64; }
upstream nexusvpn_frontend { server localhost:5173; keepalive 64; }
server {
    listen 80;
    server_name ${SERVER_IP};
    location /api { proxy_pass http://nexusvpn_backend; proxy_http_version 1.1; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; }
    location / { proxy_pass http://nexusvpn_frontend; proxy_http_version 1.1; proxy_set_header Host \$host; }
}
NGINXFILE
ln -sf /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
log "Nginx configured"
cat > "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh" << DEPLOYFILE
#!/bin/bash
cd /opt/nexusvpn && git fetch origin main && LOCAL=\$(git rev-parse HEAD) && REMOTE=\$(git rev-parse origin/main) && if [ "\$LOCAL" != "\$REMOTE" ]; then git pull origin main && cd backend && npm ci --production && npm run build && pm2 restart nexusvpn-backend && cd ../frontend && npm ci && pkill -f vite; sleep 2 && nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 & fi
DEPLOYFILE
chmod +x "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"
(crontab -l 2>/dev/null | grep -v "github-auto-deploy.sh"; echo "*/5 * * * * $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh >> /var/log/nexusvpn-deploy.log 2>&1") | crontab -
log "Auto-deployment configured"
cd "$DEPLOYMENT_DIR/backend"
pm2 delete nexusvpn-backend 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start dist/main.js --name nexusvpn-backend
pm2 save
pkill -f vite || true
sleep 2
cd "$DEPLOYMENT_DIR/frontend"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
echo ""
echo "========================================="
echo "  ✅ Production Setup Complete!"
echo "========================================="
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend: http://${SERVER_IP}:3000/api"
echo "   Proxy: http://${SERVER_IP}"
echo ""
echo "🔧 Mode: REAL DATA (MOCK_SSH=false)"
echo "📋 Auto-deploy: Every 5 minutes"
echo ""
PRODSCRIPT
chmod +x /opt/nexusvpn/infrastructure/setup-production.sh
/opt/nexusvpn/infrastructure/setup-production.sh
EOF
chmod +x /tmp/create-prod.sh && /tmp/create-prod.sh
```

## What This Does

1. ✅ Creates production setup script
2. ✅ Configures REAL DATA mode (MOCK_SSH=false)
3. ✅ Generates SSH keys for WireGuard management
4. ✅ Sets up PM2 ecosystem
5. ✅ Configures Nginx reverse proxy
6. ✅ Enables GitHub auto-deployment
7. ✅ Restarts services

## After Setup

- **Frontend**: http://5.161.91.222:5173
- **Backend**: http://5.161.91.222:3000/api
- **Nginx**: http://5.161.91.222

## Real Data Mode

- ✅ MOCK_SSH=false (real WireGuard management)
- ✅ SSH keys generated
- ✅ Real database connections
- ✅ Production logging

## Next Steps

1. Add real VPN servers in admin panel
2. Configure SSH access to VPN nodes
3. Setup SSL certificates

