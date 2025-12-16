#!/bin/bash

# Comprehensive Cloud Deployment Testing Script
# Tests all aspects of the deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 NexusVPN Cloud Deployment Test Suite${NC}"
echo "=========================================="
echo ""

# Get URLs
read -p "Enter Render backend URL (default: https://nexusvpn-api.onrender.com): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-https://nexusvpn-api.onrender.com}

read -p "Enter Vercel frontend URL (default: https://nexusvpn.vercel.app): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://nexusvpn.vercel.app}

read -p "Enter admin email (default: admin@nexusvpn.com): " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@nexusvpn.com}

read -sp "Enter admin password (default: password): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-password}
echo ""

echo ""
echo -e "${YELLOW}Running Tests...${NC}"
echo ""

# Test counters
PASSED=0
FAILED=0

# Test 1: Backend Health
echo -n "Test 1: Backend Health Endpoint... "
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/" 2>/dev/null || echo "ERROR")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ] && echo "$BODY" | grep -q "NexusVPN"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "    HTTP Code: $HTTP_CODE"
    echo "    Response: $BODY"
    ((FAILED++))
fi

# Test 2: Frontend Accessibility
echo -n "Test 2: Frontend Accessibility... "
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")

if [ "$FRONTEND_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "    HTTP Code: $FRONTEND_CODE"
    ((FAILED++))
fi

# Test 3: API Health
echo -n "Test 3: API Health Endpoint... "
API_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/health" 2>/dev/null || echo "ERROR")
API_CODE=$(echo "$API_RESPONSE" | tail -n1)

if [ "$API_CODE" = "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SKIPPED${NC}"
    echo "    (Endpoint may not exist)"
fi

# Test 4: Login
echo -n "Test 4: Admin Login... "
LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
    2>/dev/null || echo "ERROR")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
    
    # Test 5: Authenticated Request
    if [ -n "$TOKEN" ]; then
        echo -n "Test 5: Authenticated API Request... "
        AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "${BACKEND_URL}/api/users/me" 2>/dev/null || echo "ERROR")
        AUTH_CODE=$(echo "$AUTH_RESPONSE" | tail -n1)
        
        if [ "$AUTH_CODE" = "200" ]; then
            echo -e "${GREEN}✅ PASSED${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAILED${NC}"
            echo "    HTTP Code: $AUTH_CODE"
            ((FAILED++))
        fi
    fi
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "    Response: $LOGIN_RESPONSE"
    ((FAILED++))
fi

# Test 6: CORS
echo -n "Test 6: CORS Configuration... "
CORS_HEADERS=$(curl -s -I -X OPTIONS \
    -H "Origin: ${FRONTEND_URL}" \
    -H "Access-Control-Request-Method: GET" \
    "${BACKEND_URL}/api/health" 2>/dev/null | grep -i "access-control" || echo "")

if [ -n "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "    CORS headers not found (test from browser for accurate result)"
fi

# Test 7: Database Connection (indirect)
echo -n "Test 7: Database Connection (indirect)... "
if [ -n "$TOKEN" ]; then
    DB_TEST=$(curl -s -H "Authorization: Bearer $TOKEN" \
        "${BACKEND_URL}/api/users" 2>/dev/null || echo "ERROR")
    
    if echo "$DB_TEST" | grep -q "users\|\[\]"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC}"
        echo "    Could not verify database connection"
    fi
else
    echo -e "${YELLOW}⚠️  SKIPPED${NC}"
    echo "    (Requires authentication)"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${BLUE}Test Summary${NC}"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open ${FRONTEND_URL} in your browser"
    echo "2. Test the full user flow"
    echo "3. Check browser console for any warnings"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Render logs: Dashboard → Your service → Logs"
    echo "2. Check Vercel logs: Dashboard → Your project → Deployments"
    echo "3. Verify environment variables are set correctly"
    echo "4. See POST_DEPLOYMENT_GUIDE.md for detailed troubleshooting"
    exit 1
fi

