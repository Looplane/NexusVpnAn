#!/bin/bash
# Check user and reset password

EMAIL="onetenstore@gmail.com"
NEW_PASSWORD="Admin123!"

echo "========================================="
echo "  🔍 Checking User & Resetting Password"
echo "========================================="
echo ""

# Check if user exists
echo "Checking user..."
sudo -u postgres psql -d nexusvpn -c "SELECT email, role, plan FROM users WHERE email = '$EMAIL';"

echo ""
echo "Resetting password and making admin..."

# Use Node.js to hash password
cd /opt/nexusvpn/backend
PASSWORD_HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 10).then(h => console.log(h));")

# Wait for hash
sleep 2

# Update user
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

