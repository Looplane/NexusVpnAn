#!/bin/bash
# Add Windows Server 91.99.23.239 to database

sudo -u postgres psql -d nexusvpn << 'EOF'
INSERT INTO servers (name, city, country, "countryCode", ipv4, "sshUser", "isActive", "wgPort")
VALUES ('Server 1-91.99', 'Nuremberg', 'Germany', 'DE', '91.99.23.239', 'Administrator', true, 51820)
RETURNING id, name, ipv4, "sshUser", city, country;
EOF

