#!/bin/bash
# List all servers in the database

sudo -u postgres psql -d nexusvpn -c "SELECT id, name, ipv4, \"sshUser\", city, country, \"createdAt\" FROM servers ORDER BY \"createdAt\" DESC;"

