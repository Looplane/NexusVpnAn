#!/bin/bash
# PostgreSQL Setup Script for NexusVPN on Your Server
# Run this script on your PostgreSQL server (91.99.23.239)

echo "🔧 PostgreSQL Server Setup for NexusVPN"
echo "========================================"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run as root or with sudo"
    exit 1
fi

echo "📋 This script will:"
echo "  1. Configure PostgreSQL to accept external connections"
echo "  2. Create nexusvpn database and user"
echo "  3. Set up proper authentication"
echo "  4. Restart PostgreSQL service"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

# Find PostgreSQL version and directories
PG_VERSION=$(ls /etc/postgresql/ | head -1)
PG_CONF_DIR="/etc/postgresql/$PG_VERSION/main"
PG_DATA_DIR="/var/lib/postgresql/$PG_VERSION/main"

echo "🔍 Found PostgreSQL version: $PG_VERSION"
echo "📁 Configuration directory: $PG_CONF_DIR"

# Backup original files
echo "💾 Backing up original configuration files..."
cp "$PG_CONF_DIR/postgresql.conf" "$PG_CONF_DIR/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)"
cp "$PG_CONF_DIR/pg_hba.conf" "$PG_CONF_DIR/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"

# Update postgresql.conf
echo "⚙️  Updating postgresql.conf..."
cat >> "$PG_CONF_DIR/postgresql.conf" << EOF

# NexusVPN Configuration
listen_addresses = '*'
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 512MB
maintenance_work_mem = 32MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

# Update pg_hba.conf
echo "🔐 Updating pg_hba.conf..."
cat >> "$PG_CONF_DIR/pg_hba.conf" << EOF

# NexusVPN Authentication
# Allow connections from any IP (adjust as needed for security)
host    nexusvpn    nexusvpn    0.0.0.0/0    md5
host    nexusvpn    nexusvpn    ::/0         md5

# Allow local connections
local   nexusvpn    nexusvpn                 md5
host    nexusvpn    nexusvpn    127.0.0.1/32  md5
host    nexusvpn    nexusvpn    ::1/128       md5
EOF

# Create database and user
echo "🗄️ Creating database and user..."
sudo -u postgres psql << EOF
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE nexusvpn'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexusvpn')\gexec

-- Create user if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'nexusvpn') THEN
        CREATE USER nexusvpn WITH PASSWORD 'nexusvpn_secure_2024';
    END IF;
END
\$\$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn;

-- Grant schema privileges
\c nexusvpn;
GRANT ALL ON SCHEMA public TO nexusvpn;
GRANT ALL ON ALL TABLES IN SCHEMA public TO nexusvpn;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO nexusvpn;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO nexusvpn;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO nexusvpn;

\q
EOF

# Restart PostgreSQL service
echo "🔄 Restarting PostgreSQL service..."
if systemctl is-active --quiet postgresql; then
    systemctl restart postgresql
    echo "✅ PostgreSQL restarted successfully"
else
    service postgresql restart
    echo "✅ PostgreSQL restarted successfully (using service)"
fi

# Check if PostgreSQL is running
if systemctl is-active --quiet postgresql || service postgresql status > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Test local connection
echo "🧪 Testing local connection..."
if sudo -u postgres psql -d nexusvpn -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Local connection successful"
else
    echo "⚠️  Local connection test failed"
fi

# Configure firewall (if ufw is available)
if command -v ufw > /dev/null 2>&1; then
    echo "🔥 Configuring firewall..."
    ufw allow 5432/tcp
    echo "✅ Firewall configured to allow PostgreSQL connections"
fi

echo ""
echo "🎉 PostgreSQL Setup Complete!"
echo "================================"
echo "📋 Configuration Summary:"
echo "  🗄️  Database: nexusvpn"
echo "  👤 User: nexusvpn"
echo "  🔑 Password: nexusvpn_secure_2024"
echo "  🌐 Allowed from: Any IP address"
echo "  🔒 SSL: Disabled (for now)"
echo ""
echo "🔧 Next steps:"
echo "  1. Test connection from your local machine"
echo "  2. Update environment variables in your project"
echo "  3. Deploy to Render"
echo ""
echo "🧪 Test command:"
echo "  psql -h 91.99.23.239 -U nexusvpn -d nexusvpn"
echo ""
echo "⚠️  Security Note: Consider restricting IP access for production use"

# Log configuration
echo "$(date): PostgreSQL configured for NexusVPN" >> /var/log/postgresql-setup.log