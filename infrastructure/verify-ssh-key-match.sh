#!/bin/bash
# =============================================================================
# 🔍 Verify SSH Key Match Between Backend and Windows Server
# =============================================================================
# This script checks if the SSH key on backend matches what Windows expects
# =============================================================================

echo "========================================="
echo "  🔍 SSH Key Verification"
echo "========================================="
echo ""

# Try multiple possible key locations
KEY_PATHS=(
    "/root/.ssh/nexusvpn_key.pub"
    "/root/.ssh/id_rsa.pub"
    "/opt/nexusvpn/.ssh/id_rsa.pub"
    "/opt/nexusvpn/.ssh/nexusvpn_key.pub"
    "$HOME/.ssh/id_rsa.pub"
)

PUBLIC_KEY=""
KEY_PATH=""

for keyPath in "${KEY_PATHS[@]}"; do
    if [ -f "$keyPath" ]; then
        PUBLIC_KEY=$(cat "$keyPath")
        KEY_PATH="$keyPath"
        echo "✅ Found SSH public key at: $keyPath"
        echo ""
        break
    fi
done

if [ -z "$PUBLIC_KEY" ]; then
    echo "❌ ERROR: SSH public key not found!"
    echo ""
    echo "Searched in:"
    for keyPath in "${KEY_PATHS[@]}"; do
        echo "  - $keyPath"
    done
    echo ""
    echo "Please generate a key pair:"
    echo "  ssh-keygen -t rsa -b 4096 -f /root/.ssh/nexusvpn_key -N ''"
    exit 1
fi

echo "========================================="
echo "  📋 SSH Public Key (Copy this to Windows)"
echo "========================================="
echo ""
echo "$PUBLIC_KEY"
echo ""
echo "========================================="
echo "  🔍 Key Details"
echo "========================================="
echo ""
echo "Key Type: $(echo "$PUBLIC_KEY" | awk '{print $1}')"
echo "Key Length: $(echo "$PUBLIC_KEY" | awk '{print $2}' | wc -c) characters"
echo "Comment: $(echo "$PUBLIC_KEY" | awk '{print $3}')"
echo ""
echo "========================================="
echo "  ✅ Verification"
echo "========================================="
echo ""
echo "This key should match EXACTLY what's in:"
echo "  - C:\\Users\\Administrator\\.ssh\\authorized_keys"
echo "  - C:\\ProgramData\\ssh\\administrators_authorized_keys"
echo ""
echo "If they don't match, copy the key above to Windows Server."
echo ""

