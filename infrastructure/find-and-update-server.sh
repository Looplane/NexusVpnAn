#!/bin/bash
# =============================================================================
# 🔍 Find and Update Server in Database
# =============================================================================
# This script helps find a server by IP and update its sshUser
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

SERVER_IP="${1:-91.99.23.239}"
SSH_USER="${2:-Administrator}"

echo "========================================="
echo "  🔍 Finding Server: ${SERVER_IP}"
echo "========================================="
echo ""

# Find server by IP
log "Searching for server with IP: ${SERVER_IP}"

sudo -u postgres psql -d nexusvpn << EOF
-- Find server by IP
SELECT id, name, ipv4, "sshUser", city, country 
FROM servers 
WHERE ipv4 = '${SERVER_IP}' 
   OR ipv4 LIKE '%${SERVER_IP}%'
   OR name LIKE '%${SERVER_IP}%'
ORDER BY "createdAt" DESC;
EOF

echo ""
warn "If server not found above, listing ALL servers:"
echo ""

sudo -u postgres psql -d nexusvpn << EOF
-- List all servers
SELECT id, name, ipv4, "sshUser", city, country, "createdAt"
FROM servers 
ORDER BY "createdAt" DESC;
EOF

echo ""
log "To update sshUser, run:"
echo ""
echo "  sudo -u postgres psql -d nexusvpn"
echo ""
echo "Then in psql:"
echo ""
echo "  UPDATE servers SET \"sshUser\" = '${SSH_USER}' WHERE ipv4 = '${SERVER_IP}';"
echo "  SELECT id, name, ipv4, \"sshUser\" FROM servers WHERE ipv4 = '${SERVER_IP}';"
echo "  \\q"
echo ""

