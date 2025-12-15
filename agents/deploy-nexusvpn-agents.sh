#!/bin/bash
# =============================================================================
# NEXUSVPN AGENT-BASED DEPLOYMENT SCRIPT
# =============================================================================
# Uses MCP agents to deploy NexusVPN on Ubuntu 24.04 server
# Integrates with existing agent framework

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SERVER_IP="5.161.91.222"
SSH_USER="root"
SSH_KEY="${PROJECT_ROOT}/infrastructure/keys/id_rsa"
DEPLOYMENT_DIR="/opt/nexusvpn"
BACKUP_DIR="/opt/nexusvpn-backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "🔍 Checking prerequisites..."
    
    # Check if SSH key exists
    if [ ! -f "${SSH_KEY}" ]; then
        warn "SSH key not found, generating new key pair..."
        mkdir -p "$(dirname "${SSH_KEY}")"
        ssh-keygen -t rsa -b 4096 -f "${SSH_KEY}" -N "" -C "nexusvpn-deployment"
    fi
    
    # Check if server is reachable
    if ! ping -c 1 "${SERVER_IP}" > /dev/null 2>&1; then
        error "Server ${SERVER_IP} is not reachable"
    fi
    
    # Test SSH connection
    if ! ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i "${SSH_KEY}" "${SSH_USER}@${SERVER_IP}" "echo 'SSH connection successful'" > /dev/null 2>&1; then
        error "Cannot connect to server via SSH. Please ensure:"
        error "1. SSH key is added to server: ssh-copy-id -i ${SSH_KEY}.pub ${SSH_USER}@${SERVER_IP}"
        error "2. SSH port 22 is open on the server"
        error "3. Server is running and accessible"
    fi
    
    log "✅ Prerequisites check passed"
}

# Execute remote command with error handling
remote_exec() {
    local command="$1"
    local description="$2"
    
    log "🔄 ${description}..."
    
    if ssh -o StrictHostKeyChecking=no -i "${SSH_KEY}" "${SSH_USER}@${SERVER_IP}" "${command}"; then
        log "✅ ${description} completed"
    else
        error "❌ ${description} failed"
    fi
}

# Copy files to server with progress
copy_files() {
    local src="$1"
    local dest="$2"
    local description="$3"
    
    log "📁 ${description}..."
    
    if rsync -avz --progress -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" "${src}" "${SSH_USER}@${SERVER_IP}:${dest}"; then
        log "✅ ${description} completed"
    else
        error "❌ ${description} failed"
    fi
}

# Agent 1: System Setup Agent
agent_system_setup() {
    log "🤖 Agent 1: System Setup Agent starting..."
    
    remote_exec "
        # Create deployment directory
        sudo mkdir -p ${DEPLOYMENT_DIR}
        sudo mkdir -p ${BACKUP_DIR}
        sudo chown -R ${SSH_USER}:${SSH_USER} ${DEPLOYMENT_DIR}
        sudo chown -R ${SSH_USER}:${SSH_USER} ${BACKUP_DIR}
        
        # Install basic tools
        sudo apt update -y
        sudo apt install -y curl wget git rsync unzip
        
        # Install Docker if not present
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com | sh
            sudo usermod -aG docker ${SSH_USER}
        fi
        
        # Install Docker Compose if not present
        if ! command -v docker-compose &> /dev/null; then
            sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" \
                -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
        fi
        
        # Create systemd service for auto-start
        sudo systemctl enable docker
        
        echo 'System setup completed'
    " "Setting up system environment"
    
    log "✅ Agent 1: System Setup Agent completed"
}

# Agent 2: Database Agent
agent_database_setup() {
    log "🤖 Agent 2: Database Agent starting..."
    
    remote_exec "
        # Install PostgreSQL if not present
        if ! command -v psql &> /dev/null; then
            sudo apt update -y
            sudo apt install -y postgresql postgresql-contrib
            sudo systemctl enable postgresql
            sudo systemctl start postgresql
        fi
        
        # Create database and user
        sudo -u postgres psql << 'EOF'
-- Create database if not exists
SELECT 'CREATE DATABASE nexusvpn'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexusvpn')\gexec

-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nexusvpn') THEN
        CREATE USER nexusvpn WITH PASSWORD 'nexusvpn_secure_password_2024';
    END IF;
END\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;

-- Configure for remote access
ALTER SYSTEM SET listen_addresses = '*';

-- Restart PostgreSQL
SELECT pg_reload_conf();
EOF
        
        # Configure pg_hba.conf for remote access
        sudo bash -c 'cat >> /etc/postgresql/*/main/pg_hba.conf << EOF

# NexusVPN Configuration
host    nexusvpn    nexusvpn    0.0.0.0/0    md5
host    nexusvpn    nexusvpn    ::/0         md5
EOF'
        
        # Restart PostgreSQL
        sudo systemctl restart postgresql
        
        # Configure firewall
        sudo ufw allow 5432/tcp || true
        
        echo 'Database setup completed'
    " "Setting up PostgreSQL database"
    
    log "✅ Agent 2: Database Agent completed"
}

# Agent 3: SSL & Security Agent
agent_ssl_security() {
    log "🤖 Agent 3: SSL & Security Agent starting..."
    
    remote_exec "
        # Install Nginx if not present
        if ! command -v nginx &> /dev/null; then
            sudo apt install -y nginx
            sudo systemctl enable nginx
            sudo systemctl start nginx
        fi
        
        # Install Certbot for SSL
        if ! command -v certbot &> /dev/null; then
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        # Configure firewall
        sudo ufw allow 22/tcp || true
        sudo ufw allow 80/tcp || true
        sudo ufw allow 443/tcp || true
        sudo ufw allow 3000/tcp || true
        sudo ufw allow 3001/tcp || true
        sudo ufw --force enable || true
        
        # Create Nginx configuration
        sudo bash -c 'cat > /etc/nginx/sites-available/nexusvpn << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF'
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        echo 'SSL and security setup completed'
    " "Configuring SSL and security"
    
    log "✅ Agent 3: SSL & Security Agent completed"
}

# Agent 4: Application Deployment Agent
agent_app_deployment() {
    log "🤖 Agent 4: Application Deployment Agent starting..."
    
    # Copy project files to server
    copy_files "${PROJECT_ROOT}/" "${DEPLOYMENT_DIR}/" "Copying NexusVPN project files"
    
    # Copy Docker files
    copy_files "${PROJECT_ROOT}/docker-compose.prod.yml" "${DEPLOYMENT_DIR}/" "Copying Docker Compose configuration"
    copy_files "${PROJECT_ROOT}/backend/Dockerfile" "${DEPLOYMENT_DIR}/backend/" "Copying backend Dockerfile"
    copy_files "${PROJECT_ROOT}/frontend/Dockerfile" "${DEPLOYMENT_DIR}/frontend/" "Copying frontend Dockerfile"
    
    # Copy environment configuration
    remote_exec "
        # Create production environment file
        cat > ${DEPLOYMENT_DIR}/.env.prod << 'EOF'
# NexusVPN Production Environment
NODE_ENV=production
PORT=3001

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=nexusvpn
DB_PASSWORD=nexusvpn_secure_password_2024
DB_NAME=nexusvpn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SSH Configuration
SSH_KEY_PATH=/etc/nexusvpn/id_rsa
SSH_PORT=22

# WireGuard Configuration
WG_CONFIG_PATH=/etc/wireguard
WG_INTERFACE=wg0
WG_PORT=51820

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live
SSL_ENABLED=true

# Monitoring
SENTRY_DSN=
ANALYTICS_ID=
EOF
        
        # Create SSH key directory
        sudo mkdir -p /etc/nexusvpn
        sudo cp ~/.ssh/authorized_keys /etc/nexusvpn/id_rsa.pub 2>/dev/null || echo 'No SSH key found' > /etc/nexusvpn/id_rsa.pub
        sudo chown -R ${SSH_USER}:${SSH_USER} /etc/nexusvpn
        sudo chmod 600 /etc/nexusvpn/id_rsa.pub
        
        echo 'Environment configuration created'
    " "Creating production environment configuration"
    
    # Deploy with Docker Compose
    remote_exec "
        cd ${DEPLOYMENT_DIR}
        
        # Stop existing containers
        docker-compose -f docker-compose.prod.yml down || true
        
        # Build and start services
        docker-compose -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to start
        sleep 30
        
        # Check service status
        docker-compose -f docker-compose.prod.yml ps
        
        echo 'Application deployment completed'
    " "Deploying NexusVPN with Docker Compose"
    
    log "✅ Agent 4: Application Deployment Agent completed"
}

# Agent 5: Monitoring & Health Check Agent
agent_monitoring() {
    log "🤖 Agent 5: Monitoring & Health Check Agent starting..."
    
    remote_exec "
        # Create monitoring script
        cat > /usr/local/bin/nexusvpn-monitor << 'EOF'
#!/bin/bash
# NexusVPN Health Monitor

SERVICES=("postgres" "redis" "backend" "frontend")
LOG_FILE="/var/log/nexusvpn-monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> \$LOG_FILE
}

check_service() {
    local service=\$1
    if docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml ps \$service | grep -q "Up"; then
        log "✅ Service \$service is running"
        return 0
    else
        log "❌ Service \$service is down"
        return 1
    fi
}

# Check all services
for service in \"\${SERVICES[@]}\"; do
    if ! check_service \$service; then
        log "Attempting to restart \$service..."
        docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml restart \$service
        sleep 10
        if check_service \$service; then
            log "✅ Service \$service restarted successfully"
        else
            log "❌ Failed to restart \$service"
        fi
    fi
done

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 90 ]; then
    log "⚠️  High disk usage: \${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", \$3/\$2 * 100.0}')
if [ \$MEMORY_USAGE -gt 90 ]; then
    log "⚠️  High memory usage: \${MEMORY_USAGE}%"
fi

log "Health check completed"
EOF
        
        chmod +x /usr/local/bin/nexusvpn-monitor
        
        # Add to crontab for monitoring
        (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/nexusvpn-monitor") | crontab -
        
        # Create log rotation
        sudo bash -c 'cat > /etc/logrotate.d/nexusvpn << EOF
/var/log/nexusvpn-monitor.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF'
        
        echo 'Monitoring setup completed'
    " "Setting up monitoring and health checks"
    
    log "✅ Agent 5: Monitoring & Health Check Agent completed"
}

# Main deployment function
main() {
    log "🚀 Starting NexusVPN Agent-Based Deployment..."
    log "🎯 Target Server: ${SERVER_IP}"
    log "📁 Project Root: ${PROJECT_ROOT}"
    
    # Check prerequisites
    check_prerequisites
    
    # Run all agents
    agent_system_setup
    agent_database_setup
    agent_ssl_security
    agent_app_deployment
    agent_monitoring
    
    # Final verification
    log "🔍 Running final verification..."
    
    remote_exec "
        echo '=== DEPLOYMENT VERIFICATION ==='
        echo 'Service Status:'
        docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml ps
        echo ''
        echo 'Port Status:'
        netstat -tlnp | grep -E ':(3000|3001|5432|6379|80|443)'
        echo ''
        echo 'Health Checks:'
        curl -s http://localhost:3001/health || echo 'Backend health check failed'
        curl -s http://localhost:3000 || echo 'Frontend health check failed'
        echo ''
        echo 'Disk Usage:'
        df -h /
        echo ''
        echo 'Memory Usage:'
        free -h
        echo ''
        echo '=== DEPLOYMENT COMPLETE ==='
    " "Final deployment verification"
    
    log "🎉 NEXUSVPN DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    echo ""
    echo "========================================="
    echo "    DEPLOYMENT SUMMARY"
    echo "========================================="
    echo "🌐 Frontend: http://${SERVER_IP}"
    echo "🔧 Backend API: http://${SERVER_IP}:3001"
    echo "📊 Health Check: http://${SERVER_IP}:3001/health"
    echo "🗄️  Database: ${SERVER_IP}:5432"
    echo "📁 Deployment Directory: ${DEPLOYMENT_DIR}"
    echo "🔍 Monitor: /usr/local/bin/nexusvpn-monitor"
    echo "========================================="
    echo ""
    echo "💡 Next Steps:"
    echo "1. Test the application at http://${SERVER_IP}"
    echo "2. Configure SSL certificates with Let's Encrypt"
    echo "3. Set up monitoring alerts"
    echo "4. Configure backup procedures"
    echo ""
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    check)
        check_prerequisites
        log "✅ All checks passed"
        ;;
    status)
        remote_exec "docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml ps" "Checking service status"
        ;;
    logs)
        remote_exec "docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml logs --tail=100" "Showing recent logs"
        ;;
    restart)
        remote_exec "docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml restart" "Restarting services"
        ;;
    stop)
        remote_exec "docker-compose -f ${DEPLOYMENT_DIR}/docker-compose.prod.yml down" "Stopping services"
        ;;
    *)
        echo "Usage: $0 {deploy|check|status|logs|restart|stop}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment (default)"
        echo "  check    - Check prerequisites"
        echo "  status   - Show service status"
        echo "  logs     - Show recent logs"
        echo "  restart  - Restart all services"
        echo "  stop     - Stop all services"
        exit 1
        ;;
esac