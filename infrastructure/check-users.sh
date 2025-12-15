#!/bin/bash
# Check all users in database

echo "========================================="
echo "  👥 All Users in Database"
echo "========================================="
echo ""

sudo -u postgres psql -d nexusvpn -c "SELECT email, role, plan, \"fullName\", \"createdAt\" FROM users ORDER BY \"createdAt\" DESC;"

echo ""
echo "========================================="
echo ""

