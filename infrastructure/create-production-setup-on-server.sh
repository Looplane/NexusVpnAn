#!/bin/bash
# =============================================================================
# 🚀 Create Production Setup Script on Server
# =============================================================================
# Run this on your server to create and execute production setup
# =============================================================================

cat > /opt/nexusvpn/infrastructure/setup-production.sh << 'PRODUCTION_SCRIPT'
#!/bin/bash
# =============================================================================
# 🚀 NexusVPN Production Setup Script
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

DEPLOYMENT_DIR="/opt/nexusvpn"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "========================================="
echo "  🚀 Setting Up Production Environment"
echo "========================================="
echo ""

# =============================================================================
# 1. Setup Production Environment Variables
# =============================================================================
log "Configuring production environment variables..."

# Backend .env.production
if [ -d "$DEPLOYMENT_DIR/backend" ]; then
    cd "$DEPLOYMENT_DIR/backend"
    
    # Get database password from existing .env or use existing
    if [ -f ".env" ]; then
        DB_PASSWORD=$(grep "DB_PASSWORD" .env | cut -d '=' -f2 | tr -d ' ' || echo "sCEAMgreErEqlV8zgP36p7R9Z")
    else
        DB_PASSWORD="sCEAMgreErEqlV8zgP36p7R9Z"
    fi
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    cat > .env.production << EOF
# Production Environment - REAL DATA MODE
NODE_ENV=production
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=nexusvpn
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=nexusvpn
DATABASE_URL=postgresql://nexusvpn:${DB_PASSWORD}@localhost:5432/nexusvpn

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d

# CORS
FRONTEND_URL=http://${SERVER_IP}:5173
CORS_ORIGIN=http://${SERVER_IP}:5173

# SSH - REAL MODE (not mock)
SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
SSH_PUBLIC_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa.pub
MOCK_SSH=false

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
SWAGGER_ENABLED=false
EOF
    
    # Update existing .env with production values
    if [ -f ".env" ]; then
        # Update MOCK_SSH to false
        sed -i 's/MOCK_SSH=true/MOCK_SSH=false/g' .env || true
        sed -i 's/MOCK_SSH=.*/MOCK_SSH=false/g' .env || true
        # Add MOCK_SSH if not exists
        if ! grep -q "MOCK_SSH" .env; then
            echo "MOCK_SSH=false" >> .env
        fi
    else
        cp .env.production .env
    fi
    
    log "Backend production environment configured (REAL DATA MODE)"
fi

# Frontend .env.production
if [ -d "$DEPLOYMENT_DIR/frontend" ]; then
    cd "$DEPLOYMENT_DIR/frontend"
    
    cat > .env.production << EOF
# Production Environment
VITE_API_URL=http://${SERVER_IP}:3000/api
VITE_APP_NAME=NexusVPN
VITE_APP_VERSION=1.0.0
EOF
    
    if [ ! -f ".env" ]; then
        cp .env.production .env
    else
        # Update API URL
        sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://${SERVER_IP}:3000/api|g" .env || true
    fi
    
    log "Frontend production environment configured"
fi

# =============================================================================
# 2. Setup SSH Keys for Real WireGuard Management
# =============================================================================
log "Setting up SSH keys for real WireGuard management..."

mkdir -p /opt/nexusvpn/.ssh
chmod 700 /opt/nexusvpn/.ssh

# Generate SSH key if it doesn't exist
if [ ! -f "/opt/nexusvpn/.ssh/id_rsa" ]; then
    ssh-keygen -t rsa -b 4096 -f /opt/nexusvpn/.ssh/id_rsa -N "" -q
    log "SSH key generated"
else
    info "SSH key already exists"
fi

chmod 600 /opt/nexusvpn/.ssh/id_rsa
chmod 644 /opt/nexusvpn/.ssh/id_rsa.pub

log "SSH keys configured"

# =============================================================================
# 3. Setup PM2 Ecosystem
# =============================================================================
log "Configuring PM2 ecosystem..."

mkdir -p /var/log/nexusvpn

cat > "$DEPLOYMENT_DIR/backend/ecosystem.config.js" << 'PM2_CONFIG'
module.exports = {
  apps: [{
    name: 'nexusvpn-backend',
    script: './dist/main.js',
    cwd: '/opt/nexusvpn/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/nexusvpn/backend-error.log',
    out_file: '/var/log/nexusvpn/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
  }],
};
PM2_CONFIG

log "PM2 ecosystem configured"

# =============================================================================
# 4. Setup Nginx Reverse Proxy
# =============================================================================
log "Configuring Nginx reverse proxy..."

cat > /etc/nginx/sites-available/nexusvpn << NGINX_CONFIG
upstream nexusvpn_backend {
    server localhost:3000;
    keepalive 64;
}

upstream nexusvpn_frontend {
    server localhost:5173;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_IP};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location /api {
        proxy_pass http://nexusvpn_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location / {
        proxy_pass http://nexusvpn_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONFIG

# Enable site
if [ ! -L /etc/nginx/sites-enabled/nexusvpn ]; then
    ln -s /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/
fi

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx

log "Nginx reverse proxy configured"

# =============================================================================
# 5. Setup GitHub Auto-Deployment
# =============================================================================
log "Setting up GitHub auto-deployment..."

cat > "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh" << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e
DEPLOYMENT_DIR="/opt/nexusvpn"
cd "$DEPLOYMENT_DIR"
git fetch origin main
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    git pull origin main
    cd backend && npm ci --production && npm run build
    cd ../frontend && npm ci
    pm2 restart nexusvpn-backend
    pkill -f vite || true
    sleep 2
    cd "$DEPLOYMENT_DIR/frontend"
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
fi
DEPLOY_SCRIPT

chmod +x "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"

# Create cron job
(crontab -l 2>/dev/null | grep -v "github-auto-deploy.sh"; echo "*/5 * * * * $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh >> /var/log/nexusvpn-deploy.log 2>&1") | crontab -

log "GitHub auto-deployment configured"

# =============================================================================
# 6. Restart Services with Production Config
# =============================================================================
log "Restarting services with production configuration..."

# Restart backend
cd "$DEPLOYMENT_DIR/backend"
pm2 delete nexusvpn-backend 2>/dev/null || true
pm2 start ecosystem.config.js || pm2 start dist/main.js --name nexusvpn-backend
pm2 save

# Restart frontend
pkill -f vite || true
sleep 2
cd "$DEPLOYMENT_DIR/frontend"
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================="
echo "  ✅ Production Setup Complete!"
echo "========================================="
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://${SERVER_IP}:5173"
echo "   Backend API: http://${SERVER_IP}:3000/api"
echo "   Nginx Proxy: http://${SERVER_IP}"
echo ""
echo "🔧 Configuration:"
echo "   Mode: REAL DATA (MOCK_SSH=false)"
echo "   SSH Keys: /opt/nexusvpn/.ssh/id_rsa"
echo "   Auto-Deploy: Every 5 minutes"
echo ""
echo "📋 Next Steps:"
echo "   1. Add real VPN servers in admin panel"
echo "   2. Configure SSH access to VPN nodes"
echo "   3. Setup SSL certificates"
echo ""
PRODUCTION_SCRIPT

chmod +x /opt/nexusvpn/infrastructure/setup-production.sh
log "Production setup script created!"

# Run it
echo ""
echo "Running production setup..."
/opt/nexusvpn/infrastructure/setup-production.sh

