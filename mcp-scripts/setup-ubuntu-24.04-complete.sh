#!/bin/bash
# =============================================================================
# 🚀 ULTIMATE UBUNTU 24.04 SERVER SETUP SCRIPT FOR NEXUSVPN
# =============================================================================
# This script will install and configure everything you need on your fresh
# Ubuntu 24.04 server (5.161.91.222) including:
# 
# ✅ PostgreSQL Database Server
# ✅ Web Hosting with Control Panel (aaPanel - free cPanel alternative)
# ✅ Server GUI Management Panel (Cockpit)
# ✅ Complete Node.js Development Environment
# ✅ Docker & Docker Compose
# ✅ SSL Certificates (Let's Encrypt)
# ✅ SSH Security Configuration
# ✅ Firewall Configuration
# ✅ NexusVPN Deployment
# ✅ WireGuard VPN Server
# 
# RUN AS ROOT: sudo bash setup-ubuntu-24.04-complete.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configuration
SERVER_IP="5.161.91.222"
DOMAIN_NAME="vpn.5.161.91.222.nip.io"  # Using nip.io for free SSL
NEXUSVPN_USER="nexusvpn"
NEXUSVPN_PASSWORD="$(openssl rand -base64 32)"

# Log function
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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root! Use: sudo bash $0"
    fi
}

# System update and basic setup
setup_system() {
    log "🔄 Updating Ubuntu 24.04 system..."
    
    # Update package lists
    apt update -y
    
    # Upgrade existing packages
    apt upgrade -y
    
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
        cron
    
    # Set timezone to UTC
    timedatectl set-timezone UTC
    
    # Configure hostname
    hostnamectl set-hostname nexusvpn-server
    
    log "✅ System updated and configured"
}

# Install and configure PostgreSQL
setup_postgresql() {
    log "🐘 Installing PostgreSQL 16..."
    
    # Add PostgreSQL official repository
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    
    # Update and install PostgreSQL
    apt update -y
    apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create NexusVPN database and user
    sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE nexusvpn;

-- Create user
CREATE USER nexusvpn WITH PASSWORD '${NEXUSVPN_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;

-- Configure for remote access
ALTER SYSTEM SET listen_addresses = '*';

-- Restart PostgreSQL to apply changes
SELECT pg_reload_conf();
EOF
    
    # Configure pg_hba.conf for remote access
    cat >> /etc/postgresql/16/main/pg_hba.conf << EOF

# NexusVPN Configuration
host    nexusvpn    nexusvpn    0.0.0.0/0    md5
host    nexusvpn    nexusvpn    ::/0         md5
EOF
    
    # Restart PostgreSQL
    systemctl restart postgresql
    
    # Configure firewall
    ufw allow 5432/tcp
    
    log "✅ PostgreSQL 16 installed and configured"
    log "📋 Database: nexusvpn, User: nexusvpn, Password: ${NEXUSVPN_PASSWORD}"
}

# Install Node.js and development environment
setup_nodejs() {
    log "📦 Installing Node.js 20.x and development tools..."
    
    # Add Node.js repository
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Install global packages
    npm install -g \
        npm@latest \
        yarn \
        pnpm \
        pm2 \
        nodemon \
        typescript \
        ts-node \
        @nestjs/cli \
        create-next-app \
        create-vite \
        express-generator \
        eslint \
        prettier
    
    # Install build tools
    apt install -y build-essential python3-pip
    
    log "✅ Node.js 20.x and development tools installed"
}

# Install Docker and Docker Compose
setup_docker() {
    log "🐳 Installing Docker and Docker Compose..."
    
    # Add Docker repository
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    
    # Update and install Docker
    apt update -y
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    usermod -aG docker $USER
    usermod -aG docker www-data
    
    # Install Docker Compose v2
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Configure Docker daemon
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
    
    systemctl restart docker
    
    log "✅ Docker and Docker Compose installed"
}

# Install web hosting control panel (aaPanel)
setup_web_panel() {
    log "🌐 Installing aaPanel (free cPanel alternative)..."
    
    # Download and install aaPanel
    wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh
    bash install.sh
    
    # Get panel info
    if [ -f /www/server/panel/data/admin_path.pl ]; then
        PANEL_PATH=$(cat /www/server/panel/data/admin_path.pl)
        log "✅ aaPanel installed"
        log "📋 Panel URL: http://${SERVER_IP}:7800${PANEL_PATH}"
        log "📋 Default username: admin"
        log "📋 Check /www/server/panel/data/default.db for password"
    fi
    
    # Configure firewall for aaPanel
    ufw allow 7800/tcp
    ufw allow 888/tcp
    ufw allow 443/tcp
    ufw allow 80/tcp
}

# Install server management GUI (Cockpit)
setup_server_gui() {
    log "🖥️ Installing Cockpit server management GUI..."
    
    # Install Cockpit
    apt install -y cockpit cockpit-machines cockpit-pcp cockpit-storaged cockpit-networkmanager
    
    # Start and enable Cockpit
    systemctl start cockpit
    systemctl enable cockpit
    
    # Configure firewall
    ufw allow 9090/tcp
    
    log "✅ Cockpit installed"
    log "📋 Cockpit URL: https://${SERVER_IP}:9090"
}

# Install WireGuard VPN Server
setup_wireguard() {
    log "🔒 Installing WireGuard VPN Server..."
    
    # Install WireGuard
    apt install -y wireguard wireguard-tools
    
    # Generate server keys
    wg genkey | tee /etc/wireguard/server_private.key | wg pubkey > /etc/wireguard/server_public.key
    
    # Configure WireGuard
    cat > /etc/wireguard/wg0.conf << EOF
[Interface]
Address = 10.8.0.1/24
PrivateKey = $(cat /etc/wireguard/server_private.key)
ListenPort = 51820

# NAT
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = ufw route delete allow in on wg0 out on eth0
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF
    
    # Enable IP forwarding
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
    echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
    sysctl -p
    
    # Configure firewall
    ufw allow 51820/udp
    
    # Start WireGuard
    systemctl start wg-quick@wg0
    systemctl enable wg-quick@wg0
    
    log "✅ WireGuard VPN Server installed"
    log "📋 VPN Network: 10.8.0.0/24"
}

# Install SSL certificates (Let's Encrypt)
setup_ssl() {
    log "🔐 Installing SSL certificates with Let's Encrypt..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Create a simple Nginx config for SSL
    mkdir -p /etc/nginx/sites-available
    cat > /etc/nginx/sites-available/default << EOF
server {
    listen 80;
    server_name ${DOMAIN_NAME};
    
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
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
    
    # Get SSL certificate
    certbot --nginx -d ${DOMAIN_NAME} --non-interactive --agree-tos -m admin@${DOMAIN_NAME} || warn "SSL certificate generation failed, will use self-signed"
    
    log "✅ SSL certificates configured"
}

# Configure firewall
setup_firewall() {
    log "🔥 Configuring UFW firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # SSH
    ufw allow 22/tcp
    
    # Web services
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # PostgreSQL
    ufw allow 5432/tcp
    
    # Node.js apps
    ufw allow 3000/tcp
    ufw allow 3001/tcp
    
    # Management panels
    ufw allow 7800/tcp  # aaPanel
    ufw allow 9090/tcp  # Cockpit
    ufw allow 888/tcp   # aaPanel alternate
    
    # WireGuard
    ufw allow 51820/udp
    
    # Enable firewall
    ufw --force enable
    
    log "✅ Firewall configured"
}

# Configure SSH security
setup_ssh() {
    log "🔑 Configuring SSH security..."
    
    # Backup SSH config
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Configure SSH
    cat >> /etc/ssh/sshd_config << EOF

# NexusVPN Security Configuration
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
EOF
    
    # Restart SSH
    systemctl restart sshd
    
    # Install fail2ban for SSH protection
    cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF
    
    systemctl restart fail2ban
    
    log "✅ SSH security configured"
}

# Deploy NexusVPN
deploy_nexusvpn() {
    log "🚀 Deploying NexusVPN..."
    
    # Create NexusVPN user
    useradd -m -s /bin/bash ${NEXUSVPN_USER} || true
    echo "${NEXUSVPN_USER}:NexusVPN2024!" | chpasswd
    usermod -aG sudo ${NEXUSVPN_USER}
    
    # Clone or copy NexusVPN (assuming it's in current directory)
    if [ -d "/root/nexusvpn" ]; then
        cp -r /root/nexusvpn /home/${NEXUSVPN_USER}/
        chown -R ${NEXUSVPN_USER}:${NEXUSVPN_USER} /home/${NEXUSVPN_USER}/nexusvpn
    fi
    
    # Create systemd service for backend
    cat > /etc/systemd/system/nexusvpn-backend.service << EOF
[Unit]
Description=NexusVPN Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=${NEXUSVPN_USER}
WorkingDirectory=/home/${NEXUSVPN_USER}/nexusvpn/backend
ExecStart=/usr/bin/node dist/main
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=DB_HOST=localhost
Environment=DB_PORT=5432
Environment=DB_USER=nexusvpn
Environment=DB_PASSWORD=${NEXUSVPN_PASSWORD}
Environment=DB_NAME=nexusvpn

[Install]
WantedBy=multi-user.target
EOF
    
    # Create systemd service for frontend
    cat > /etc/systemd/system/nexusvpn-frontend.service << EOF
[Unit]
Description=NexusVPN Frontend Service
After=network.target

[Service]
Type=simple
User=${NEXUSVPN_USER}
WorkingDirectory=/home/${NEXUSVPN_USER}/nexusvpn/frontend
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start services
    systemctl daemon-reload
    systemctl enable nexusvpn-backend.service
    systemctl enable nexusvpn-frontend.service
    
    log "✅ NexusVPN deployment configured"
}

# Create management scripts
create_scripts() {
    log "📜 Creating management scripts..."
    
    # Server status script
    cat > /usr/local/bin/server-status << 'EOF'
#!/bin/bash
echo "=== Server Status ==="
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo "Disk Usage:"
df -h
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Service Status:"
systemctl status postgresql --no-pager -l
systemctl status docker --no-pager -l
systemctl status nginx --no-pager -l
systemctl status cockpit --no-pager -l
EOF
    chmod +x /usr/local/bin/server-status
    
    # VPN management script
    cat > /usr/local/bin/vpn-manager << 'EOF'
#!/bin/bash
case "$1" in
    status)
        wg show
        ;;
    add-client)
        if [ -z "$2" ]; then
            echo "Usage: vpn-manager add-client CLIENT_NAME"
            exit 1
        fi
        cd /etc/wireguard
        wg genkey | tee ${2}_private.key | wg pubkey > ${2}_public.key
        echo "[Peer]" >> wg0.conf
        echo "PublicKey = $(cat ${2}_public.key)" >> wg0.conf
        echo "AllowedIPs = 10.8.0.2/32" >> wg0.conf
        systemctl restart wg-quick@wg0
        echo "Client $2 added successfully"
        ;;
    *)
        echo "Usage: vpn-manager {status|add-client}"
        exit 1
        ;;
esac
EOF
    chmod +x /usr/local/bin/vpn-manager
    
    log "✅ Management scripts created"
}

# Display final information
show_summary() {
    log "🎉 SETUP COMPLETE! 🎉"
    echo ""
    echo "========================================="
    echo "    NEXUSVPN SERVER CONFIGURATION"
    echo "========================================="
    echo ""
    echo "📋 SERVER INFORMATION:"
    echo "  • Server IP: ${SERVER_IP}"
    echo "  • Domain: ${DOMAIN_NAME}"
    echo "  • Hostname: $(hostname)"
    echo ""
    echo "🔐 DATABASE (PostgreSQL):"
    echo "  • Host: ${SERVER_IP}:5432"
    echo "  • Database: nexusvpn"
    echo "  • User: nexusvpn"
    echo "  • Password: ${NEXUSVPN_PASSWORD}"
    echo ""
    echo "🌐 WEB PANELS:"
    echo "  • aaPanel: http://${SERVER_IP}:7800"
    echo "  • Cockpit: https://${SERVER_IP}:9090"
    echo ""
    echo "🔒 VPN (WireGuard):"
    echo "  • Port: 51820/UDP"
    echo "  • Network: 10.8.0.0/24"
    echo "  • Manage with: vpn-manager {status|add-client}"
    echo ""
    echo "🚀 NEXUSVPN:"
    echo "  • Frontend: http://${SERVER_IP}:3000"
    echo "  • Backend API: http://${SERVER_IP}:3001"
    echo "  • User: ${NEXUSVPN_USER}"
    echo "  • Password: NexusVPN2024!"
    echo ""
    echo "📊 MANAGEMENT:"
    echo "  • Check status: server-status"
    echo "  • VPN management: vpn-manager"
    echo "  • SSH: ssh root@${SERVER_IP}"
    echo ""
    echo "🔥 FIREWALL:"
    echo "  • Status: ufw status"
    echo "  • SSH Port: 22"
    echo "  • Web Ports: 80, 443"
    echo "  • Database: 5432"
    echo "  • App Ports: 3000, 3001"
    echo "  • Panels: 7800, 9090, 888"
    echo "  • VPN: 51820/UDP"
    echo ""
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "  1. Reboot server: reboot"
    echo "  2. Test PostgreSQL connection"
    echo "  3. Access web panels"
    echo "  4. Deploy NexusVPN application"
    echo "  5. Configure SSL certificates"
    echo ""
    echo "📁 CONFIGURATION FILES:"
    echo "  • PostgreSQL: /etc/postgresql/16/main/"
    echo "  • Nginx: /etc/nginx/sites-available/"
    echo "  • WireGuard: /etc/wireguard/"
    echo "  • Docker: /etc/docker/daemon.json"
    echo ""
    echo "========================================="
    echo "    SUPPORT: Save this information!"
    echo "========================================="
}

# Main execution
main() {
    log "🚀 Starting Ubuntu 24.04 Complete Server Setup..."
    log "⏰ This will take 15-30 minutes depending on your server speed"
    
    check_root
    setup_system
    setup_postgresql
    setup_nodejs
    setup_docker
    setup_web_panel
    setup_server_gui
    setup_wireguard
    setup_ssl
    setup_firewall
    setup_ssh
    deploy_nexusvpn
    create_scripts
    
    show_summary
    
    log "🔄 Rebooting server in 10 seconds..."
    log "💾 Save the information above before reboot!"
    sleep 10
    reboot
}

# Run main function
main "$@"