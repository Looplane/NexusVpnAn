#!/bin/bash
# Make a user admin in NexusVPN

echo "========================================="
echo "  🔐 Make User Admin"
echo "========================================="
echo ""

# Get user email
read -p "Enter your email address: " USER_EMAIL

if [ -z "$USER_EMAIL" ]; then
    echo "❌ Email is required!"
    exit 1
fi

# Make user admin
sudo -u postgres psql -d nexusvpn << EOF
UPDATE users 
SET role = 'admin', plan = 'pro' 
WHERE email = '$USER_EMAIL';

SELECT email, role, plan, "fullName" 
FROM users 
WHERE email = '$USER_EMAIL';
EOF

echo ""
echo "✅ User updated to admin!"
echo ""
echo "📋 Next steps:"
echo "   1. Log out and log back in"
echo "   2. Go to: http://5.161.91.222:5173/#/admin"
echo "   3. You'll see the admin dashboard"
echo ""

