#!/bin/bash
# =============================================================================
# 🚀 NexusVPN Production Setup Script
# =============================================================================
# This script configures production-ready settings:
# - Production environment variables
# - PM2 ecosystem configuration
# - Nginx reverse proxy
# - GitHub auto-deployment
# - Management panels (Cockpit & aaPanel)
# =============================================================================

set -e

# Colors
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
    
    # Get database password from existing .env or generate new
    if [ -f ".env" ]; then
        DB_PASSWORD=$(grep "DB_PASSWORD" .env | cut -d '=' -f2 | tr -d ' ')
    else
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    fi
    
    # Generate JWT secret if not exists
    JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    cat > .env.production << EOF
# Production Environment
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

# SSH
SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
MOCK_SSH=true

# Security
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
SWAGGER_ENABLED=false
EOF
    
    # Copy to .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.production .env
    fi
    
    log "Backend production environment configured"
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
    
    # Copy to .env if it doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.production .env
    fi
    
    log "Frontend production environment configured"
fi

# =============================================================================
# 2. Setup PM2 Ecosystem
# =============================================================================
log "Configuring PM2 ecosystem..."

if [ -f "$DEPLOYMENT_DIR/infrastructure/pm2.ecosystem.config.js" ]; then
    cp "$DEPLOYMENT_DIR/infrastructure/pm2.ecosystem.config.js" "$DEPLOYMENT_DIR/backend/"
    
    # Create log directory
    mkdir -p /var/log/nexusvpn
    
    log "PM2 ecosystem configured"
fi

# =============================================================================
# 3. Setup Nginx Reverse Proxy
# =============================================================================
log "Configuring Nginx reverse proxy..."

if [ -f "$DEPLOYMENT_DIR/infrastructure/nginx-nexusvpn.conf" ]; then
    cp "$DEPLOYMENT_DIR/infrastructure/nginx-nexusvpn.conf" /etc/nginx/sites-available/nexusvpn
    
    # Enable site
    if [ ! -L /etc/nginx/sites-enabled/nexusvpn ]; then
        ln -s /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/
    fi
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    log "Nginx reverse proxy configured"
    info "Access via: http://${SERVER_IP} (port 80)"
fi

# =============================================================================
# 4. Setup GitHub Auto-Deployment
# =============================================================================
log "Setting up GitHub auto-deployment..."

if [ -f "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh" ]; then
    chmod +x "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"
    
    # Create cron job for auto-deployment (every 5 minutes)
    (crontab -l 2>/dev/null | grep -v "github-auto-deploy.sh"; echo "*/5 * * * * $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh >> /var/log/nexusvpn-deploy.log 2>&1") | crontab -
    
    log "GitHub auto-deployment configured (checks every 5 minutes)"
    info "Manual deploy: $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"
fi

# =============================================================================
# 5. Install Management Panels
# =============================================================================
read -p "Install management panels (Cockpit & aaPanel)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$DEPLOYMENT_DIR/infrastructure/install-management-panels.sh" ]; then
        chmod +x "$DEPLOYMENT_DIR/infrastructure/install-management-panels.sh"
        bash "$DEPLOYMENT_DIR/infrastructure/install-management-panels.sh"
    fi
fi

# =============================================================================
# 6. Restart Services
# =============================================================================
log "Restarting services..."

# Restart backend with PM2
if command -v pm2 &> /dev/null; then
    cd "$DEPLOYMENT_DIR/backend"
    pm2 delete nexusvpn-backend 2>/dev/null || true
    pm2 start ecosystem.config.js || pm2 start dist/main.js --name nexusvpn-backend
    pm2 save
fi

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
echo "📋 Management:"
echo "   Auto-Deploy: Checks GitHub every 5 minutes"
echo "   Manual Deploy: $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"
echo "   PM2 Status: pm2 list"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure SSL certificates (Let's Encrypt)"
echo "   2. Set up domain name (update CORS_ORIGIN)"
echo "   3. Configure email service (optional)"
echo "   4. Set up Stripe keys (for payments)"
echo ""

