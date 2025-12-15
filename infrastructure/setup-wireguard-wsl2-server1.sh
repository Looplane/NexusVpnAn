#!/bin/bash
# =============================================================================
# WireGuard Setup Script for WSL2 (Server 1: 46.62.201.216)
# =============================================================================
# Run this script inside WSL2 Ubuntu
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

echo "========================================="
echo "  WireGuard Setup - Server 1"
echo "  IP: 46.62.201.216"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Please run as root (use sudo)"
    exit 1
fi

log "Updating system packages..."
apt update > /dev/null 2>&1
apt upgrade -y > /dev/null 2>&1

log "Installing WireGuard..."
apt install -y wireguard wireguard-tools > /dev/null 2>&1

log "Creating WireGuard directory..."
mkdir -p /etc/wireguard
cd /etc/wireguard

log "Generating WireGuard keys..."
wg genkey | tee privatekey | wg pubkey | tee publickey > /dev/null

PUBLIC_KEY=$(cat publickey)
log "Public Key generated: ${PUBLIC_KEY}"

log "Creating WireGuard configuration..."
cat > /etc/wireguard/wg0.conf <<EOF
[Interface]
PrivateKey = $(cat privatekey)
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

log "Starting WireGuard..."
wg-quick up wg0 > /dev/null 2>&1

log "Enabling WireGuard on boot..."
systemctl enable wg-quick@wg0 > /dev/null 2>&1 || true

log "Configuring IP forwarding..."
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p > /dev/null 2>&1

echo ""
echo "========================================="
echo "  ✅ WireGuard Setup Complete!"
echo "========================================="
echo ""
echo "📋 Server Information:"
echo "   IP Address: 46.62.201.216"
echo "   Port: 51820"
echo "   Public Key: ${PUBLIC_KEY}"
echo ""
echo "💡 Add this server to NexusVPN admin panel with:"
echo "   - IP: 46.62.201.216"
echo "   - Public Key: ${PUBLIC_KEY}"
echo ""
echo "🔐 SSH Access:"
echo "   NexusVPN will need SSH access to manage this server."
echo "   Configure SSH in WSL2 or use Windows SSH server."
echo ""

