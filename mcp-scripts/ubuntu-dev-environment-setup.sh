#!/bin/bash

# Ubuntu 24.04 Comprehensive Development Environment Setup Script
# For Hetzner VPS: 5.161.91.222
# Root credentials: #HaseebChaChu02110@

set -e

# Configuration Variables
SSH_USER="root"
SERVER_IP="5.161.91.222"
DEPLOYMENT_DIR="/opt/nexusvpn"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/nexusvpn-setup.log"
MONGO_USER="nexusvpn"
MONGO_PASS="NexusVPN_MongoDB_2024!"
REDIS_PASS="Redis_Secure_Password_2024!"
MYSQL_ROOT_PASS="MySQL_Root_Password_2024!"
MYSQL_NEXUS_PASS="NexusVPN_MySQL_2024!"
POSTGRES_NEXUS_PASS="NexusVPN_PostgreSQL_2024!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

# Create log file
touch "$LOG_FILE"
chmod 644 "$LOG_FILE"

log "🚀 Starting Ubuntu 24.04 Comprehensive Development Environment Setup"
log "📝 Server IP: $SERVER_IP"
log "📁 Deployment Directory: $DEPLOYMENT_DIR"

# Function to execute remote commands with error handling
remote_exec() {
    local command="$1"
    local description="$2"
    
    log "$description..."
    if eval "$command"; then
        log "✅ $description completed successfully"
    else
        error "❌ $description failed"
        exit 1
    fi
}

# Agent 1: System Setup and Docker Installation
agent_system_setup() {
    log "🤖 Agent 1: System Setup Agent starting..."
    
    # Update system
    remote_exec "apt update -y && apt upgrade -y" "Updating system packages"
    
    # Install essential packages
    remote_exec "apt install -y curl wget git rsync unzip net-tools ufw software-properties-common apt-transport-https ca-certificates gnupg lsb-release" "Installing essential packages"
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        log "Installing Docker..."
        curl -fsSL https://get.docker.com | sh
        usermod -aG docker $SSH_USER
        systemctl enable docker
        systemctl start docker
        log "✅ Docker installed successfully"
    else
        log "✅ Docker already installed"
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log "Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        log "✅ Docker Compose installed successfully"
    else
        log "✅ Docker Compose already installed"
    fi
    
    # Create deployment directories
    remote_exec "mkdir -p $DEPLOYMENT_DIR $BACKUP_DIR/{databases,system}" "Creating deployment directories"
    
    log "✅ Agent 1: System Setup completed"
}

# Agent 2: Database Installation and Configuration
agent_database_setup() {
    log "🤖 Agent 2: Database Setup Agent starting..."
    
    # Install MongoDB
    log "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt update
    apt install -y mongodb-org
    systemctl enable mongod
    systemctl start mongod
    
    # Configure MongoDB
    mongosh <<EOF
use admin
db.createUser({
  user: "$MONGO_USER",
  pwd: "$MONGO_PASS",
  roles: [{role: "userAdminAnyDatabase", db: "admin"}, {role: "readWriteAnyDatabase", db: "admin"}]
})
exit
EOF
    
    # Configure MongoDB for remote access
    cat > /etc/mongod.conf <<EOF
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
net:
  port: 27017
  bindIp: 0.0.0.0
security:
  authorization: enabled
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF
    
    systemctl restart mongod
    log "✅ MongoDB installed and configured"
    
    # Install Redis
    log "Installing Redis..."
    apt install -y redis-server
    
    # Configure Redis
    cat > /etc/redis/redis.conf <<EOF
bind 0.0.0.0
port 6379
requirepass $REDIS_PASS
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF
    
    systemctl enable redis-server
    systemctl restart redis-server
    log "✅ Redis installed and configured"
    
    # Install MySQL
    log "Installing MySQL..."
    apt install -y mysql-server
    
    # Configure MySQL
    mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
CREATE DATABASE nexusvpn;
CREATE USER 'nexusvpn'@'%' IDENTIFIED BY '$MYSQL_NEXUS_PASS';
GRANT ALL PRIVILEGES ON nexusvpn.* TO 'nexusvpn'@'%';
FLUSH PRIVILEGES;
EOF
    
    # Configure MySQL for remote access
    cat > /etc/mysql/mysql.conf.d/mysqld.cnf <<EOF
[mysqld]
bind-address = 0.0.0.0
mysqlx-bind-address = 0.0.0.0
EOF
    
    systemctl enable mysql
    systemctl restart mysql
    log "✅ MySQL installed and configured"
    
    # Install PostgreSQL
    log "Installing PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    
    # Configure PostgreSQL
    sudo -u postgres psql <<EOF
ALTER USER postgres PASSWORD '$POSTGRES_NEXUS_PASS';
CREATE DATABASE nexusvpn;
CREATE USER nexusvpn WITH PASSWORD '$POSTGRES_NEXUS_PASS';
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;
EOF
    
    # Configure PostgreSQL for remote access
    cat > /etc/postgresql/*/main/postgresql.conf <<EOF
listen_addresses = '*'
max_connections = 200
shared_buffers = 128MB
EOF
    
    cat > /etc/postgresql/*/main/pg_hba.conf <<EOF
local   all             all                                     peer
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
EOF
    
    systemctl enable postgresql
    systemctl restart postgresql
    log "✅ PostgreSQL installed and configured"
    
    log "✅ Agent 2: Database Setup completed"
}

# Agent 3: Security and Firewall Configuration
agent_security_setup() {
    log "🤖 Agent 3: Security Setup Agent starting..."
    
    # Configure UFW Firewall
    log "Configuring UFW Firewall..."
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow essential ports
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 3000/tcp  # Node.js apps
    ufw allow 3001/tcp  # Node.js apps
    ufw allow 8080/tcp  # Alternative web port
    ufw allow 51820/udp # WireGuard
    
    # Database ports (restrict to specific IPs if needed)
    ufw allow 27017/tcp # MongoDB
    ufw allow 6379/tcp  # Redis
    ufw allow 3306/tcp  # MySQL
    ufw allow 5432/tcp  # PostgreSQL
    
    # Web panel ports
    ufw allow 7800/tcp  # aaPanel
    ufw allow 9090/tcp  # Cockpit
    ufw allow 30000:40000/tcp # Passive FTP
    
    ufw --force enable
    log "✅ UFW Firewall configured"
    
    # Configure fail2ban
    apt install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    log "✅ Fail2ban installed and configured"
    
    # Create security script
    cat > /opt/security-check.sh <<'EOF'
#!/bin/bash
echo "=== Security Status Check ==="
echo "UFW Status:"
ufw status verbose
echo ""
echo "Fail2ban Status:"
fail2ban-client status
echo ""
echo "Recent failed SSH attempts:"
grep "Failed password" /var/log/auth.log | tail -10
echo ""
echo "Open ports:"
netstat -tlnp | grep LISTEN
EOF
    chmod +x /opt/security-check.sh
    
    log "✅ Agent 3: Security Setup completed"
}

# Agent 4: Web Hosting Panel and GUI Setup
agent_web_panel_setup() {
    log "🤖 Agent 4: Web Panel Setup Agent starting..."
    
    # Install aaPanel (open-source cPanel alternative)
    log "Installing aaPanel..."
    wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh
    bash install.sh
    log "✅ aaPanel installed"
    
    # Install Cockpit (Ubuntu GUI panel)
    log "Installing Cockpit..."
    apt install -y cockpit cockpit-docker cockpit-machines cockpit-packagekit
    systemctl enable cockpit
    systemctl start cockpit
    log "✅ Cockpit installed and started"
    
    # Install additional web tools
    apt install -y nginx apache2-utils
    systemctl enable nginx
    systemctl start nginx
    log "✅ Nginx installed and configured"
    
    log "✅ Agent 4: Web Panel Setup completed"
}

# Agent 5: Node.js Stack and Development Tools
agent_dev_stack_setup() {
    log "🤖 Agent 5: Development Stack Agent starting..."
    
    # Install Node.js 20.x
    log "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Install global npm packages
    npm install -g npm@latest
    npm install -g @nestjs/cli next express vite pm2 nodemon typescript ts-node
    
    # Install development tools
    apt install -y git curl wget vim nano htop tree jq
    
    # Install build tools
    apt install -y build-essential python3-pip
    
    log "✅ Node.js and development tools installed"
    
    # Create Node.js project template
    mkdir -p /opt/templates
    
    # NestJS template
    cd /opt/templates
    npx @nestjs/cli new nestjs-template --skip-git --package-manager npm
    
    # Next.js template
    npx create-next-app@latest nextjs-template --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
    
    # Express template
    mkdir -p /opt/templates/express-template
    cd /opt/templates/express-template
    npm init -y
    npm install express cors helmet morgan dotenv
    
    # Vite template
    npm create vite@latest vite-template --template react-ts
    
    log "✅ Development templates created"
    
    log "✅ Agent 5: Development Stack completed"
}

# WireGuard VPN Setup
setup_wireguard() {
    log "🔧 Setting up WireGuard VPN..."
    
    apt install -y wireguard qrencode
    
    # Generate WireGuard keys
    cd /etc/wireguard
    wg genkey | tee privatekey | wg pubkey > publickey
    
    # Configure WireGuard
    cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = $(cat privatekey)

# Save configuration
SaveConfig = true

# Enable IP forwarding
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on eth0
PreDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF
    
    # Enable IP forwarding
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
    echo "net.ipv6.ip_forward=1" >> /etc/sysctl.conf
    sysctl -p
    
    # Start WireGuard
    systemctl enable wg-quick@wg0
    systemctl start wg-quick@wg0
    
    log "✅ WireGuard VPN configured"
}

# SSL Certificate Setup
setup_ssl() {
    log "🔧 Setting up SSL certificates..."
    
    apt install -y certbot python3-certbot-nginx
    
    # Create SSL directory
    mkdir -p /etc/ssl/nexusvpn
    
    # Generate self-signed certificate for testing
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/nexusvpn/nexusvpn.key \
        -out /etc/ssl/nexusvpn/nexusvpn.crt \
        -subj "/C=US/ST=State/L=City/O=NexusVPN/CN=$SERVER_IP"
    
    log "✅ SSL certificates configured"
}

# Monitoring Setup
setup_monitoring() {
    log "🔧 Setting up monitoring..."
    
    # Install Prometheus
    wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
    tar xvf prometheus-2.45.0.linux-amd64.tar.gz
    cp prometheus-2.45.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
    cp -r prometheus-2.45.0.linux-amd64/{consoles,console_libraries} /etc/prometheus/
    
    # Create Prometheus config
    mkdir -p /etc/prometheus
    cat > /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
EOF
    
    # Install Node Exporter
    wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
    tar xvf node_exporter-1.6.1.linux-amd64.tar.gz
    cp node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
    
    # Create systemd services
    cat > /etc/systemd/system/prometheus.service <<EOF
[Unit]
Description=Prometheus
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF
    
    cat > /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF
    
    # Create directories and start services
    mkdir -p /var/lib/prometheus
    systemctl daemon-reload
    systemctl enable prometheus node_exporter
    systemctl start prometheus node_exporter
    
    log "✅ Monitoring setup completed"
}

# Backup Configuration
setup_backups() {
    log "🔧 Setting up automated backups..."
    
    # Install backup tools
    apt install -y rsync gzip
    
    # Create backup script
    cat > /opt/backup-databases.sh <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_DIR/databases"

# MongoDB backup
mongodump --host localhost --out \$BACKUP_DIR/mongodb_\$DATE

# MySQL backup
mysqldump -u root -p$MYSQL_ROOT_PASS --all-databases > \$BACKUP_DIR/mysql_all_databases_\$DATE.sql

# PostgreSQL backup
sudo -u postgres pg_dumpall > \$BACKUP_DIR/postgresql_all_databases_\$DATE.sql

# Redis backup (save current state)
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb \$BACKUP_DIR/redis_\$DATE.rdb

# Cleanup old backups (keep last 7 days)
find \$BACKUP_DIR -type d -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.rdb" -mtime +7 -delete
EOF
    
    chmod +x /opt/backup-databases.sh
    
    # Add to crontab for daily backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-databases.sh") | crontab -
    
    log "✅ Backup configuration completed"
}

# Verification Function
verify_installation() {
    log "🔍 Verifying installation..."
    
    # Check services
    services=("mongod" "redis-server" "mysql" "postgresql" "nginx" "cockpit" "fail2ban")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log "✅ $service is running"
        else
            error "❌ $service is not running"
        fi
    done
    
    # Check ports
    ports=("22" "80" "443" "3000" "3001" "5432" "3306" "27017" "6379" "9090" "7800")
    for port in "${ports[@]}"; do
        if netstat -tlnp | grep -q ":$port "; then
            log "✅ Port $port is listening"
        else
            warning "⚠️  Port $port is not listening"
        fi
    done
    
    # Check database connections
    log "Testing database connections..."
    
    # Test MongoDB
    if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        log "✅ MongoDB connection successful"
    else
        error "❌ MongoDB connection failed"
    fi
    
    # Test Redis
    if redis-cli ping | grep -q "PONG"; then
        log "✅ Redis connection successful"
    else
        error "❌ Redis connection failed"
    fi
    
    # Test MySQL
    if mysql -u root -p$MYSQL_ROOT_PASS -e "SELECT 1" > /dev/null 2>&1; then
        log "✅ MySQL connection successful"
    else
        error "❌ MySQL connection failed"
    fi
    
    # Test PostgreSQL
    if sudo -u postgres psql -c "SELECT 1" > /dev/null 2>&1; then
        log "✅ PostgreSQL connection successful"
    else
        error "❌ PostgreSQL connection failed"
    fi
    
    log "✅ Installation verification completed"
}

# Create documentation
create_documentation() {
    log "📚 Creating documentation..."
    
    mkdir -p /opt/documentation
    
    # Create comprehensive setup guide
    cat > /opt/documentation/SETUP_GUIDE.md <<EOF
# Ubuntu 24.04 Development Environment Setup Guide

## Server Information
- **IP Address**: $SERVER_IP
- **Username**: $SSH_USER
- **Deployment Directory**: $DEPLOYMENT_DIR

## Access Information

### Web Panels
- **Cockpit (Server Management)**: https://$SERVER_IP:9090
- **aaPanel (Web Hosting)**: http://$SERVER_IP:7800

### Database Access
- **MongoDB**: mongodb://$MONGO_USER:$MONGO_PASS@$SERVER_IP:27017/
- **Redis**: redis://:$REDIS_PASS@$SERVER_IP:6379/
- **MySQL**: mysql://root:$MYSQL_ROOT_PASS@$SERVER_IP:3306/
- **PostgreSQL**: postgresql://nexusvpn:$POSTGRES_NEXUS_PASS@$SERVER_IP:5432/nexusvpn

## Management Commands

### Service Management
\`\`\`bash
# Check all services
systemctl status mongod redis-server mysql postgresql nginx cockpit

# Restart services
systemctl restart mongod redis-server mysql postgresql
\`\`\`

### Database Management
\`\`\`bash
# MongoDB backup
/opt/backup-databases.sh

# Check database status
mongosh --eval "db.adminCommand('ping')"
redis-cli ping
mysql -u root -p$MYSQL_ROOT_PASS -e "SELECT 1"
sudo -u postgres psql -c "SELECT 1"
\`\`\`

### Security
\`\`\`bash
# Check firewall
ufw status verbose

# Check fail2ban
fail2ban-client status

# Run security check
/opt/security-check.sh
\`\`\`

### Monitoring
\`\`\`bash
# Check Prometheus
curl http://localhost:9090

# Check Node Exporter
curl http://localhost:9100/metrics
\`\`\`

## Troubleshooting

### Port Access Issues
If you can't access services, check:
1. UFW firewall status: \`ufw status\`
2. Service status: \`systemctl status [service-name]\`
3. Port listening: \`netstat -tlnp | grep [port]\`

### Database Connection Issues
1. Check service status
2. Verify credentials
3. Check firewall rules
4. Review logs in \`/var/log/\`

### Web Panel Access
- Cockpit: https://$SERVER_IP:9090 (accept self-signed certificate)
- aaPanel: http://$SERVER_IP:7800 (follow setup wizard)

## Next Steps
1. Configure aaPanel through web interface
2. Set up your domains in nginx
3. Deploy your applications
4. Configure SSL certificates with Let's Encrypt
5. Set up additional monitoring if needed

## Support
Check logs in \`/var/log/\` directory for detailed information.
EOF
    
    # Create quick reference
    cat > /opt/documentation/QUICK_REFERENCE.md <<EOF
# Quick Reference Card

## Server Details
- **IP**: $SERVER_IP
- **SSH**: ssh root@$SERVER_IP

## Quick Commands
\`\`\`bash
# Check system status
htop

# Check disk space
df -h

# Check memory
free -h

# Check services
systemctl status
\`\`\`

## Database URLs
- **MongoDB**: \`mongodb://$MONGO_USER:$MONGO_PASS@$SERVER_IP:27017/nexusvpn\`
- **Redis**: \`redis://:$REDIS_PASS@$SERVER_IP:6379\`
- **MySQL**: \`mysql://root:$MYSQL_ROOT_PASS@$SERVER_IP:3306/nexusvpn\`
- **PostgreSQL**: \`postgresql://nexusvpn:$POSTGRES_NEXUS_PASS@$SERVER_IP:5432/nexusvpn\`

## Web Access
- **Cockpit**: https://$SERVER_IP:9090
- **aaPanel**: http://$SERVER_IP:7800

## Backup Location
- **Database backups**: \`$BACKUP_DIR/databases/\`
- **System backups**: \`$BACKUP_DIR/system/\`

## Log Files
- **Setup log**: \`$LOG_FILE\`
- **MongoDB**: \`/var/log/mongodb/mongod.log\`
- **Redis**: \`/var/log/redis/redis-server.log\`
- **MySQL**: \`/var/log/mysql/error.log\`
- **PostgreSQL**: \`/var/log/postgresql/postgresql-*.log\`
EOF
    
    log "✅ Documentation created in /opt/documentation/"
}

# Main execution function
main() {
    log "🎯 Starting comprehensive setup..."
    
    # Run all agents
    agent_system_setup
    agent_database_setup
    agent_security_setup
    agent_web_panel_setup
    agent_dev_stack_setup
    
    # Additional setups
    setup_wireguard
    setup_ssl
    setup_monitoring
    setup_backups
    
    # Verification
    verify_installation
    
    # Documentation
    create_documentation
    
    # Final status
    log "🎉 Setup completed successfully!"
    log "📋 Summary:"
    log "   • All databases installed and configured"
    log "   • Security measures implemented"
    log "   • Web panels available (Cockpit & aaPanel)"
    log "   • Node.js development stack ready"
    log "   • WireGuard VPN configured"
    log "   • Monitoring and backups enabled"
    log "   • Documentation created"
    log ""
    log "🔗 Access your server at:"
    log "   • Cockpit: https://$SERVER_IP:9090"
    log "   • aaPanel: http://$SERVER_IP:7800"
    log "   • SSH: ssh root@$SERVER_IP"
    log ""
    log "📖 Check /opt/documentation/ for detailed guides"
    log "📝 Setup log: $LOG_FILE"
}

# Run main function
main "$@"