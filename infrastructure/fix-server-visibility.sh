#!/bin/bash
# =============================================================================
# 🔧 Fix Server Visibility in Admin Panel
# =============================================================================
# This script ensures servers are visible in the admin panel by checking
# and updating the isActive status in the database.
# =============================================================================

DB_NAME="nexusvpn"
SERVER_IP="${1:-91.99.23.239}"

echo "========================================="
echo "  🔧 Fixing Server Visibility"
echo "========================================="
echo ""

echo "Checking server with IP: ${SERVER_IP}..."
sudo -u postgres psql -d ${DB_NAME} -c "SELECT id, name, ipv4, \"isActive\", \"sshUser\" FROM servers WHERE ipv4 = '${SERVER_IP}';"

echo ""
read -p "Do you want to activate this server? (y/n): " ACTIVATE

if [ "$ACTIVATE" = "y" ] || [ "$ACTIVATE" = "Y" ]; then
    echo "Activating server..."
    sudo -u postgres psql -d ${DB_NAME} -c "UPDATE servers SET \"isActive\" = true WHERE ipv4 = '${SERVER_IP}';"
    
    echo ""
    echo "Verification:"
    sudo -u postgres psql -d ${DB_NAME} -c "SELECT id, name, ipv4, \"isActive\", \"sshUser\" FROM servers WHERE ipv4 = '${SERVER_IP}';"
    
    echo ""
    echo "✅ Server activated! Refresh the admin panel to see it."
else
    echo "Server status unchanged."
fi

echo ""
echo "Listing all servers:"
sudo -u postgres psql -d ${DB_NAME} -c "SELECT id, name, ipv4, \"isActive\", \"sshUser\", city, country FROM servers ORDER BY \"createdAt\" DESC;"

