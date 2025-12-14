#!/bin/bash
#
# NexusVPN Node Provisioning Script
# Ubuntu 24.04 LTS
# Run as root: curl -sSL https://setup.nexusvpn.com/install.sh | sudo bash
#

set -e

echo "========================================="
echo "  NexusVPN Node Provisioning v1.0"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "ERROR: Please run as root (use sudo)"
  exit 1
fi

# Variables
WG_INTERFACE="wg0"
WG_PORT="${WG_PORT:-51820}"
WG_SUBNET="${WG_SUBNET:-10.100.0.0/24}"
BACKEND_PUBLIC_KEY="${BACKEND_PUBLIC_KEY:-}"

echo "[1/6] Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq

echo "[2/6] Installing WireGuard..."
apt-get install -y wireguard qrencode iptables

echo "[3/6] Enabling IP forwarding..."
sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv6.conf.all.forwarding=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf

echo "[4/6] Generating WireGuard keys..."
mkdir -p /etc/wireguard
cd /etc/wireguard
umask 077
wg genkey | tee privatekey | wg pubkey > publickey
chmod 600 privatekey

PRIVATE_KEY=$(cat privatekey)
PUBLIC_KEY=$(cat publickey)

echo "[5/6] Creating WireGuard configuration..."
cat > /etc/wireguard/${WG_INTERFACE}.conf <<EOF
[Interface]
Address = 10.100.0.1/24
ListenPort = ${WG_PORT}
PrivateKey = ${PRIVATE_KEY}
PostUp = iptables -A FORWARD -i ${WG_INTERFACE} -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i ${WG_INTERFACE} -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

echo "[6/6] Starting WireGuard..."
systemctl enable wg-quick@${WG_INTERFACE}
systemctl start wg-quick@${WG_INTERFACE}

echo ""
echo "========================================="
echo "  ✅ Installation Complete!"
echo "========================================="
echo ""
echo "Server Public Key:"
echo "${PUBLIC_KEY}"
echo ""
echo "Add this key to your NexusVPN backend:"
echo "  Location -> Edit -> Server Public Key"
echo ""
echo "WireGuard is running on port ${WG_PORT}"
echo ""
