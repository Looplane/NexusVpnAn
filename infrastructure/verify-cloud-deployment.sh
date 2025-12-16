#!/bin/bash

# Cloud Deployment Verification Script
# Verifies Render backend and Vercel frontend deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 NexusVPN Cloud Deployment Verification${NC}"
echo "=========================================="
echo ""

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}❌ curl is required but not installed.${NC}" >&2; exit 1; }

# Get URLs from user or use defaults
read -p "Enter Render backend URL (default: https://nexusvpn-api.onrender.com): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-https://nexusvpn-api.onrender.com}

read -p "Enter Vercel frontend URL (default: https://nexusvpn.vercel.app): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://nexusvpn.vercel.app}

echo ""
echo -e "${YELLOW}Testing Backend...${NC}"

# Test backend health endpoint
echo -n "  Testing backend health endpoint... "
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/" || echo "ERROR")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "    Response: $BODY"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "    HTTP Code: $HTTP_CODE"
    echo "    Response: $BODY"
fi

# Test backend API endpoint
echo -n "  Testing backend API endpoint... "
API_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/health" || echo "ERROR")
API_HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
API_BODY=$(echo "$API_RESPONSE" | head -n-1)

if [ "$API_HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "    HTTP Code: $API_HTTP_CODE"
    echo "    (This is OK if /api/health doesn't exist)"
fi

echo ""
echo -e "${YELLOW}Testing Frontend...${NC}"

# Test frontend accessibility
echo -n "  Testing frontend accessibility... "
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" || echo "000")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "    HTTP Code: $FRONTEND_RESPONSE"
fi

# Test CORS
echo -n "  Testing CORS configuration... "
CORS_HEADERS=$(curl -s -I -X OPTIONS -H "Origin: ${FRONTEND_URL}" \
    -H "Access-Control-Request-Method: GET" \
    "${BACKEND_URL}/api/health" 2>/dev/null | grep -i "access-control" || echo "")

if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ OK${NC}"
    echo "    CORS Headers: $CORS_HEADERS"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "    CORS headers not found (may need to test from browser)"
fi

echo ""
echo -e "${YELLOW}Testing Database Connection...${NC}"
echo -n "  Checking backend logs for database errors... "
echo -e "${YELLOW}⚠️  Manual check required${NC}"
echo "    Go to Render dashboard → Your service → Logs"
echo "    Look for database connection errors"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Verification Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open ${FRONTEND_URL} in your browser"
echo "2. Check browser console (F12) for errors"
echo "3. Try logging in with admin credentials"
echo "4. Verify API calls are working"
echo ""

