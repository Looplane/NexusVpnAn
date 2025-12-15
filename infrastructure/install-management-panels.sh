#!/bin/bash
# =============================================================================
# 🖥️  Install Server Management Panels
# =============================================================================
# Installs:
# - Cockpit (Server GUI Management)
# - aaPanel (Web Hosting Control Panel)
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

SERVER_IP=$(hostname -I | awk '{print $1}')

echo "========================================="
echo "  🖥️  Installing Management Panels"
echo "========================================="
echo ""

# =============================================================================
# Install Cockpit (Server GUI)
# =============================================================================
log "Installing Cockpit (Server Management GUI)..."

if ! command -v cockpit &> /dev/null; then
    apt update
    apt install -y cockpit cockpit-docker cockpit-networkmanager cockpit-storaged
    
    # Enable and start Cockpit
    systemctl enable cockpit.socket
    systemctl start cockpit.socket
    
    # Allow Cockpit through firewall
    ufw allow 9090/tcp comment 'Cockpit Web UI'
    
    log "Cockpit installed and started"
    info "Access Cockpit at: https://${SERVER_IP}:9090"
else
    info "Cockpit already installed"
fi

# =============================================================================
# Install aaPanel (Web Hosting Control Panel)
# =============================================================================
log "Installing aaPanel (Web Hosting Control Panel)..."

if [ ! -f "/usr/bin/bt" ]; then
    # Download and install aaPanel
    wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh
    bash install.sh aapanel
    
    # Get installation info
    if [ -f "/etc/init.d/bt" ]; then
        /etc/init.d/bt default
        
        log "aaPanel installed successfully"
        info "Access aaPanel at: http://${SERVER_IP}:7800"
        info "Default username and password shown above"
    else
        info "aaPanel installation may require manual setup"
    fi
else
    info "aaPanel already installed"
    info "Run '/etc/init.d/bt default' to see login info"
fi

# =============================================================================
# Configure Firewall
# =============================================================================
log "Configuring firewall for management panels..."

ufw allow 7800/tcp comment 'aaPanel Web UI' 2>/dev/null || true
ufw allow 8888/tcp comment 'aaPanel PHPMyAdmin' 2>/dev/null || true

log "Firewall configured"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "========================================="
echo "  ✅ Management Panels Installed"
echo "========================================="
echo ""
echo "🖥️  Cockpit (Server Management):"
echo "   URL: https://${SERVER_IP}:9090"
echo "   Login: Use your server root credentials"
echo ""
echo "🌐 aaPanel (Web Hosting):"
echo "   URL: http://${SERVER_IP}:7800"
echo "   Run: /etc/init.d/bt default (to see login info)"
echo ""
echo "📋 Next Steps:"
echo "   1. Access Cockpit to manage your server"
echo "   2. Access aaPanel to manage web hosting"
echo "   3. Configure SSL certificates for production"
echo ""

