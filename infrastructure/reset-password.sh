#!/bin/bash
# Reset password for a user in NexusVPN

echo "========================================="
echo "  🔐 Reset User Password"
echo "========================================="
echo ""

# Get user email
read -p "Enter email address: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Email is required!"
    exit 1
fi

# Generate new password
NEW_PASSWORD="NexusVPN2025!"
echo "Setting password to: $NEW_PASSWORD"
echo ""

# Hash password using Node.js
cd /opt/nexusvpn/backend
PASSWORD_HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$NEW_PASSWORD', 10).then(hash => console.log(hash));")

# Update user in database
sudo -u postgres psql -d nexusvpn << EOF
UPDATE users 
SET 
  "passwordHash" = '$PASSWORD_HASH',
  role = 'admin',
  plan = 'pro'
WHERE email = '$USER_EMAIL';

SELECT email, role, plan, "fullName" 
FROM users 
WHERE email = '$USER_EMAIL';
EOF

echo ""
echo "✅ Password reset complete!"
echo ""
echo "📋 Login credentials:"
echo "   Email: $USER_EMAIL"
echo "   Password: $NEW_PASSWORD"
echo ""
echo "🌐 Login at: http://5.161.91.222:5173/#/login"
echo "🔧 Admin panel: http://5.161.91.222:5173/#/admin"
echo ""

