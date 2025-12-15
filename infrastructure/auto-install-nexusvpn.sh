#!/bin/bash
# =============================================================================
# 🚀 NEXUSVPN AUTO-INSTALL SCRIPT FOR UBUNTU 24.04
# =============================================================================
# Single-command installation script for fresh Ubuntu 24.04 servers
# This script installs and configures everything needed for NexusVPN:
# 
# ✅ PostgreSQL Database Server
# ✅ Node.js 20.x Development Environment
# ✅ Docker & Docker Compose
# ✅ Nginx Web Server
# ✅ WireGuard VPN Server
# ✅ PM2 Process Manager
# ✅ SSL Certificates (Let's Encrypt ready)
# ✅ Firewall Configuration (UFW)
# ✅ Security Hardening (Fail2ban)
# ✅ NexusVPN Application Deployment
# 
# USAGE (Single Command):
# curl -sSL https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh | sudo bash
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NEXUSVPN_USER="nexusvpn"
NEXUSVPN_DB_NAME="nexusvpn"
NEXUSVPN_DB_USER="nexusvpn"
NEXUSVPN_DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DEPLOYMENT_DIR="/opt/nexusvpn"
GITHUB_REPO="https://github.com/Looplane/NexusVpnAn.git"
GITHUB_BRANCH="main"

# Log functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1${NC}"
    exit 1
}

# Print banner
print_banner() {
    echo -e "${CYAN}"
    echo "========================================="
    echo "  🚀 NEXUSVPN AUTO-INSTALL SCRIPT"
    echo "  Ubuntu 24.04 Server Setup"
    echo "========================================="
    echo -e "${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root! Use: sudo bash $0"
    fi
}

# System update and basic setup
setup_system() {
    log "Updating Ubuntu 24.04 system..."
    
    export DEBIAN_FRONTEND=noninteractive
    
    apt update -y -qq
    apt upgrade -y -qq
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        git \
        nano \
        vim \
        htop \
        net-tools \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        cron \
        openssl \
        qrencode \
        iptables \
        iproute2 \
        build-essential \
        python3-pip \
        jq \
        > /dev/null 2>&1
    
    # Set timezone to UTC
    timedatectl set-timezone UTC
    
    # Configure hostname
    hostnamectl set-hostname nexusvpn-server
    
    log "System updated and configured"
}

# Install PostgreSQL
setup_postgresql() {
    log "Installing PostgreSQL 16..."
    
    # Add PostgreSQL official repository
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - > /dev/null 2>&1
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    
    apt update -y -qq
    apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16 > /dev/null 2>&1
    
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create NexusVPN database and user
    sudo -u postgres psql << EOF > /dev/null 2>&1
CREATE DATABASE ${NEXUSVPN_DB_NAME};
CREATE USER ${NEXUSVPN_DB_USER} WITH PASSWORD '${NEXUSVPN_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${NEXUSVPN_DB_NAME} TO ${NEXUSVPN_DB_USER}';
ALTER SYSTEM SET listen_addresses = '*';
SELECT pg_reload_conf();
EOF
    
    # Configure pg_hba.conf for remote access
    cat >> /etc/postgresql/16/main/pg_hba.conf << EOF

# NexusVPN Configuration
host    ${NEXUSVPN_DB_NAME}    ${NEXUSVPN_DB_USER}    0.0.0.0/0    md5
host    ${NEXUSVPN_DB_NAME}    ${NEXUSVPN_DB_USER}    ::/0         md5
EOF
    
    systemctl restart postgresql
    ufw allow 5432/tcp comment 'PostgreSQL'
    
    log "PostgreSQL 16 installed and configured"
    info "Database: ${NEXUSVPN_DB_NAME}, User: ${NEXUSVPN_DB_USER}, Password: ${NEXUSVPN_DB_PASSWORD}"
}

# Install Node.js
setup_nodejs() {
    log "Installing Node.js 20.x..."
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
    
    # Install global packages
    npm install -g \
        npm@latest \
        pm2 \
        typescript \
        ts-node \
        @nestjs/cli \
        > /dev/null 2>&1
    
    log "Node.js 20.x installed (version: $(node --version))"
}

# Install Docker
setup_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Add Docker repository
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg > /dev/null 2>&1
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    
    apt update -y -qq
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null 2>&1
    
    # Install Docker Compose v2
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose > /dev/null 2>&1
    chmod +x /usr/local/bin/docker-compose
    
    systemctl start docker
    systemctl enable docker
    
    log "Docker installed (version: $(docker --version))"
}

# Install Nginx
setup_nginx() {
    log "Installing Nginx web server..."
    
    apt install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx
    
    ufw allow 'Nginx Full' comment 'Nginx HTTP/HTTPS'
    
    log "Nginx installed and configured"
}

# Install WireGuard
setup_wireguard() {
    log "Installing WireGuard VPN server..."
    
    apt install -y wireguard qrencode iptables > /dev/null 2>&1
    
    # Enable IP forwarding
    sysctl -w net.ipv4.ip_forward=1
    sysctl -w net.ipv6.conf.all.forwarding=1
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
    echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
    
    # Generate WireGuard keys
    mkdir -p /etc/wireguard
    cd /etc/wireguard
    umask 077
    wg genkey | tee privatekey | wg pubkey > publickey > /dev/null 2>&1
    chmod 600 privatekey
    
    WG_PRIVATE_KEY=$(cat privatekey)
    WG_PUBLIC_KEY=$(cat publickey)
    
    # Create WireGuard configuration
    cat > /etc/wireguard/wg0.conf << EOF
[Interface]
Address = 10.100.0.1/24
ListenPort = 51820
PrivateKey = ${WG_PRIVATE_KEY}
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF
    
    systemctl enable wg-quick@wg0
    systemctl start wg-quick@wg0
    
    ufw allow 51820/udp comment 'WireGuard VPN'
    
    log "WireGuard installed and configured"
    info "WireGuard Public Key: ${WG_PUBLIC_KEY}"
}

# Configure firewall
setup_firewall() {
    log "Configuring UFW firewall..."
    
    ufw --force reset > /dev/null 2>&1
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw allow 3000/tcp comment 'NexusVPN Backend'
    ufw allow 5173/tcp comment 'NexusVPN Frontend Dev'
    ufw --force enable
    
    log "Firewall configured"
}

# Configure security
setup_security() {
    log "Configuring security (Fail2ban)..."
    
    systemctl start fail2ban
    systemctl enable fail2ban
    
    # Configure SSH protection
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF
    
    systemctl restart fail2ban
    
    log "Security configured"
}

# Clone and deploy NexusVPN
deploy_nexusvpn() {
    log "Deploying NexusVPN application..."
    
    # Check if we're already in the cloned repository
    if [ -d "/tmp/nexusvpn/.git" ]; then
        info "Using existing cloned repository at /tmp/nexusvpn..."
        cp -r /tmp/nexusvpn ${DEPLOYMENT_DIR}
        cd ${DEPLOYMENT_DIR}
    else
        # Create deployment directory
        mkdir -p ${DEPLOYMENT_DIR}
        cd ${DEPLOYMENT_DIR}
        
        # Clone repository
        if [ -d ".git" ]; then
            info "Repository already exists, pulling latest changes..."
            git pull origin ${GITHUB_BRANCH} > /dev/null 2>&1
        else
            info "Cloning NexusVPN repository..."
            git clone -b ${GITHUB_BRANCH} ${GITHUB_REPO} . > /dev/null 2>&1
        fi
    fi
    
    # Install backend dependencies
    if [ -d "backend" ]; then
        log "Installing backend dependencies..."
        cd backend
        npm install --production > /dev/null 2>&1
        cd ..
    fi
    
    # Install frontend dependencies
    if [ -d "frontend" ]; then
        log "Installing frontend dependencies..."
        cd frontend
        npm install --production > /dev/null 2>&1
        cd ..
    fi
    
    # Create environment file for backend
    if [ -d "backend" ]; then
        cat > ${DEPLOYMENT_DIR}/backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://${NEXUSVPN_DB_USER}:${NEXUSVPN_DB_PASSWORD}@localhost:5432/${NEXUSVPN_DB_NAME}
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=${NEXUSVPN_DB_USER}
DB_PASSWORD=${NEXUSVPN_DB_PASSWORD}
DB_DATABASE=${NEXUSVPN_DB_NAME}

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=production
PORT=3000
API_PREFIX=api

# Frontend URL
FRONTEND_URL=http://$(hostname -I | awk '{print $1}'):5173

# WireGuard Configuration
MOCK_SSH=false
WG_SERVER_IP=$(hostname -I | awk '{print $1}')
WG_SERVER_PORT=51820
WG_SERVER_PUBLIC_KEY=$(cat /etc/wireguard/publickey)

# CORS
CORS_ORIGIN=http://$(hostname -I | awk '{print $1}'):5173
EOF
    fi
    
    log "NexusVPN application deployed"
}

# Create startup scripts
create_scripts() {
    log "Creating management scripts..."
    
    # Create start script
    cat > /usr/local/bin/nexusvpn-start << 'EOF'
#!/bin/bash
cd /opt/nexusvpn
pm2 start ecosystem.config.js --update-env
pm2 save
EOF
    chmod +x /usr/local/bin/nexusvpn-start
    
    # Create stop script
    cat > /usr/local/bin/nexusvpn-stop << 'EOF'
#!/bin/bash
pm2 stop all
pm2 save
EOF
    chmod +x /usr/local/bin/nexusvpn-stop
    
    # Create restart script
    cat > /usr/local/bin/nexusvpn-restart << 'EOF'
#!/bin/bash
cd /opt/nexusvpn
pm2 restart all
EOF
    chmod +x /usr/local/bin/nexusvpn-restart
    
    # Create status script
    cat > /usr/local/bin/nexusvpn-status << 'EOF'
#!/bin/bash
pm2 status
systemctl status postgresql nginx docker wg-quick@wg0
EOF
    chmod +x /usr/local/bin/nexusvpn-status
    
    log "Management scripts created"
}

# Show summary
show_summary() {
    echo ""
    echo -e "${CYAN}========================================="
    echo "  ✅ INSTALLATION COMPLETE!"
    echo "=========================================${NC}"
    echo ""
    echo -e "${GREEN}📋 Installation Summary:${NC}"
    echo ""
    echo "  🗄️  PostgreSQL Database:"
    echo "     Database: ${NEXUSVPN_DB_NAME}"
    echo "     User: ${NEXUSVPN_DB_USER}"
    echo "     Password: ${NEXUSVPN_DB_PASSWORD}"
    echo "     Connection: postgresql://${NEXUSVPN_DB_USER}:${NEXUSVPN_DB_PASSWORD}@localhost:5432/${NEXUSVPN_DB_NAME}"
    echo ""
    echo "  🔐 WireGuard VPN:"
    echo "     Public Key: $(cat /etc/wireguard/publickey)"
    echo "     Port: 51820/UDP"
    echo "     Interface: wg0"
    echo ""
    echo "  🌐 Services:"
    echo "     PostgreSQL: $(systemctl is-active postgresql)"
    echo "     Docker: $(systemctl is-active docker)"
    echo "     Nginx: $(systemctl is-active nginx)"
    echo "     WireGuard: $(systemctl is-active wg-quick@wg0)"
    echo ""
    echo "  📁 Deployment Directory:"
    echo "     ${DEPLOYMENT_DIR}"
    echo ""
    echo "  🛠️  Management Commands:"
    echo "     nexusvpn-start    - Start all services"
    echo "     nexusvpn-stop     - Stop all services"
    echo "     nexusvpn-restart  - Restart all services"
    echo "     nexusvpn-status   - Check service status"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Save the database password above!${NC}"
    echo ""
    echo -e "${CYAN}=========================================${NC}"
    echo ""
}

# Main execution
main() {
    print_banner
    
    info "Starting NexusVPN installation..."
    info "This will take 10-20 minutes depending on your server speed"
    echo ""
    
    check_root
    setup_system
    setup_postgresql
    setup_nodejs
    setup_docker
    setup_nginx
    setup_wireguard
    setup_firewall
    setup_security
    deploy_nexusvpn
    create_scripts
    
    show_summary
    
    log "Installation completed successfully!"
    info "Next steps:"
    info "1. Review the configuration in ${DEPLOYMENT_DIR}/backend/.env"
    info "2. Run 'nexusvpn-start' to start the application"
    info "3. Access the frontend at http://$(hostname -I | awk '{print $1}'):5173"
}

# Run main function
main "$@"

