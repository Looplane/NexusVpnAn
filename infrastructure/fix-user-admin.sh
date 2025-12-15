#!/bin/bash
# Fix user to admin - correct version

EMAIL="genzicode@gmail.com"
NEW_PASSWORD="Admin123!"

echo "========================================="
echo "  🔐 Making User Admin"
echo "========================================="
echo ""

# First check column name
echo "Checking database schema..."
sudo -u postgres psql -d nexusvpn -c "\d users" | grep -i password

echo ""
echo "Updating user: $EMAIL"

# Hash password using Node.js
cd /opt/nexusvpn/backend
PASSWORD_HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 10).then(h => console.log(h));")

# Wait a moment for async
sleep 2

# Try with passwordHash (camelCase)
sudo -u postgres psql -d nexusvpn << EOF
UPDATE users 
SET 
  "passwordHash" = '$PASSWORD_HASH',
  role = 'admin',
  plan = 'pro'
WHERE email = '$EMAIL';

SELECT email, role, plan, "fullName" 
FROM users 
WHERE email = '$EMAIL';
EOF

echo ""
echo "✅ Done!"
echo ""
echo "📋 Login with:"
echo "   Email: $EMAIL"
echo "   Password: $NEW_PASSWORD"
echo ""

