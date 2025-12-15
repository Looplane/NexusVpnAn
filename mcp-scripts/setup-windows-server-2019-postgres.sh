#!/bin/bash
# 🪟 Windows Server 2019 PostgreSQL Setup Script
# This script configures PostgreSQL on Windows Server 2019 for NexusVPN

echo "🪟 Windows Server 2019 PostgreSQL Configuration for NexusVPN"
echo "============================================================"

# Configuration
POSTGRES_VERSION="14"
POSTGRES_DATA_DIR="C:\\Program Files\\PostgreSQL\\${POSTGRES_VERSION}\\data"
POSTGRES_SERVICE="postgresql-x64-${POSTGRES_VERSION}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Windows
if [[ "$OSTYPE" != "msys" ]] && [[ "$OSTYPE" != "cygwin" ]]; then
    print_error "This script should be run on Windows Server 2019"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

print_status "Starting Windows Server 2019 PostgreSQL configuration..."

# Step 1: Backup current configuration
print_status "Creating backup of current configuration..."
cp "${POSTGRES_DATA_DIR}/postgresql.conf" "${POSTGRES_DATA_DIR}/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)"
cp "${POSTGRES_DATA_DIR}/pg_hba.conf" "${POSTGRES_DATA_DIR}/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"
print_success "Configuration backed up"

# Step 2: Configure postgresql.conf for remote access
print_status "Configuring postgresql.conf for remote access..."
cat >> "${POSTGRES_DATA_DIR}/postgresql.conf" << 'EOF'

# NexusVPN Configuration - Added $(date)
listen_addresses = '*'
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 512MB
work_mem = 4MB
maintenance_work_mem = 64MB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF
print_success "postgresql.conf configured"

# Step 3: Configure pg_hba.conf for authentication
print_status "Configuring pg_hba.conf for authentication..."
cat >> "${POSTGRES_DATA_DIR}/pg_hba.conf" << 'EOF'

# NexusVPN Configuration - Added $(date)
# Allow connections from anywhere (adjust as needed for security)
host    nexusvpn    postgres        0.0.0.0/0       md5
host    nexusvpn    postgres        ::/0            md5

# Allow Render IP ranges (typical ranges - adjust as needed)
host    nexusvpn    postgres        100.20.0.0/16   md5
host    nexusvpn    postgres        100.21.0.0/16   md5
host    nexusvpn    postgres        34.102.0.0/16   md5
host    nexusvpn    postgres        35.184.0.0/16   md5
EOF
print_success "pg_hba.conf configured"

# Step 4: Windows Firewall Configuration
print_status "Configuring Windows Firewall..."
netsh advfirewall firewall add rule name="PostgreSQL-5432" dir=in action=allow protocol=TCP localport=5432
print_success "Windows Firewall configured"

# Step 5: Restart PostgreSQL service
print_status "Restarting PostgreSQL service..."
net stop "${POSTGRES_SERVICE}"
sleep 3
net start "${POSTGRES_SERVICE}"
print_success "PostgreSQL service restarted"

# Step 6: Create nexusvpn database
print_status "Creating nexusvpn database..."
createdb -U postgres nexusvpn
if [ $? -eq 0 ]; then
    print_success "Database 'nexusvpn' created"
else
    print_warning "Database 'nexusvpn' may already exist or creation failed"
fi

# Step 7: Test local connection
print_status "Testing local connection..."
if psql -h localhost -U postgres -d nexusvpn -c "SELECT version();" &> /dev/null; then
    print_success "Local connection test passed"
else
    print_error "Local connection test failed"
fi

# Step 8: Get server IP
SERVER_IP=$(ipconfig | grep -A 1 "IPv4 Address" | grep -v "IPv4 Address" | head -1 | awk '{print $NF}')
print_status "Server IP detected: ${SERVER_IP}"

# Step 9: Display configuration summary
echo ""
echo "============================================================"
echo -e "${GREEN}✅ Windows Server 2019 PostgreSQL Configuration Complete${NC}"
echo "============================================================"
echo ""
echo "📊 Configuration Summary:"
echo "  • PostgreSQL Version: ${POSTGRES_VERSION}"
echo "  • Server IP: ${SERVER_IP}:5432"
echo "  • Database: nexusvpn"
echo "  • User: postgres"
echo "  • Remote Access: Enabled"
echo "  • Windows Firewall: Port 5432 open"
echo ""
echo "🔗 Connection Test Command:"
echo "  psql -h ${SERVER_IP} -U postgres -d nexusvpn"
echo ""
echo "🌐 External Connection Test:"
echo "  From your local machine:"
echo "  psql -h 91.99.23.239 -U postgres -d nexusvpn"
echo ""
echo "⚠️  Security Notes:"
echo "  • Consider restricting IP ranges in pg_hba.conf"
echo "  • Use strong passwords for database users"
echo "  • Monitor firewall logs for unauthorized access"
echo "  • Consider VPN for additional security"
echo ""
echo "📁 Configuration Files:"
echo "  • postgresql.conf: ${POSTGRES_DATA_DIR}/postgresql.conf"
echo "  • pg_hba.conf: ${POSTGRES_DATA_DIR}/pg_hba.conf"
echo "  • Backups created with timestamp"
echo ""

# Step 10: Verification checklist
echo "🔍 Verification Checklist:"
echo "  [ ] PostgreSQL service is running"
echo "  [ ] Port 5432 is open in Windows Firewall"
echo "  [ ] Database 'nexusvpn' exists"
echo "  [ ] Remote connections are enabled"
echo "  [ ] Authentication is configured"
echo ""

# Final status check
if sc query "${POSTGRES_SERVICE}" | grep -q "RUNNING"; then
    print_success "PostgreSQL service is running - configuration complete!"
else
    print_error "PostgreSQL service is not running - please check configuration"
    exit 1
fi

print_success "Setup complete! Your Windows Server 2019 PostgreSQL is ready for NexusVPN deployment."
print_status "Next step: Deploy NexusVPN backend to Render with your PostgreSQL configuration."