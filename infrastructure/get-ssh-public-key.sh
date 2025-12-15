#!/bin/bash
# =============================================================================
# 🔑 Get NexusVPN SSH Public Key
# =============================================================================
# This script displays the SSH public key that needs to be added to
# remote VPN servers for auto-configuration to work.
# =============================================================================

echo "========================================="
echo "  🔑 NexusVPN SSH Public Key"
echo "========================================="
echo ""

# Try multiple possible key locations
KEY_PATHS=(
    "/root/.ssh/nexusvpn_key.pub"
    "/root/.ssh/id_rsa.pub"
    "/opt/nexusvpn/.ssh/id_rsa.pub"
    "/opt/nexusvpn/.ssh/nexusvpn_key.pub"
    "/etc/nexusvpn/id_rsa.pub"
)

PUBLIC_KEY=""

for keyPath in "${KEY_PATHS[@]}"; do
    if [ -f "$keyPath" ]; then
        PUBLIC_KEY=$(cat "$keyPath")
        echo "✅ Found SSH public key at: $keyPath"
        echo ""
        break
    fi
done

if [ -z "$PUBLIC_KEY" ]; then
    echo "❌ ERROR: SSH public key not found!"
    echo ""
    echo "Please check these locations:"
    for keyPath in "${KEY_PATHS[@]}"; do
        echo "  - $keyPath"
    done
    echo ""
    echo "Or generate a new key pair:"
    echo "  ssh-keygen -t rsa -b 4096 -f /root/.ssh/nexusvpn_key -N ''"
    echo "  cat /root/.ssh/nexusvpn_key.pub"
    exit 1
fi

echo "========================================="
echo "  📋 SSH Public Key (Copy this):"
echo "========================================="
echo ""
echo "$PUBLIC_KEY"
echo ""
echo "========================================="
echo "  📝 Next Steps:"
echo "========================================="
echo ""
echo "1. Copy the SSH public key above"
echo "2. On your Windows Server, run:"
echo "   infrastructure/setup-windows-ssh-key.ps1"
echo ""
echo "3. Or manually add it to:"
echo "   C:\\Users\\Administrator\\.ssh\\authorized_keys"
echo "   C:\\ProgramData\\ssh\\administrators_authorized_keys"
echo ""
echo "4. Test connection:"
echo "   ssh Administrator@YOUR_SERVER_IP"
echo ""

