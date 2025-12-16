#!/bin/bash

# Supabase Database Setup Script
# Helps set up and migrate database to Supabase

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️  NexusVPN Supabase Database Setup${NC}"
echo "=========================================="
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  psql is not installed.${NC}"
    echo ""
    echo "You can still run the migration using Supabase SQL Editor:"
    echo "1. Go to your Supabase project → SQL Editor"
    echo "2. Copy the contents of setup_db.sql"
    echo "3. Paste and run in SQL Editor"
    echo ""
    read -p "Continue with manual instructions? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 0
    fi
    echo ""
    echo -e "${BLUE}Manual Setup Instructions:${NC}"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to SQL Editor"
    echo "4. Copy contents of setup_db.sql:"
    echo "   cat setup_db.sql"
    echo "5. Paste into SQL Editor and run"
    echo ""
    exit 0
fi

# Get connection details
echo -e "${BLUE}Enter Supabase Connection Details:${NC}"
echo ""

read -p "Database Host (e.g., db.xxxxx.supabase.co): " DB_HOST
read -p "Database Port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "Database Name (default: postgres): " DB_NAME
DB_NAME=${DB_NAME:-postgres}
read -p "Database User (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}
read -sp "Database Password: " DB_PASSWORD
echo ""

# Construct connection string
CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
echo -e "${YELLOW}Testing connection...${NC}"

# Test connection
if psql "$CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection successful!${NC}"
else
    echo -e "${RED}❌ Connection failed!${NC}"
    echo ""
    echo "Please check:"
    echo "1. Database credentials are correct"
    echo "2. IP address is whitelisted in Supabase (Settings → Database → Connection Pooling)"
    echo "3. Connection string format is correct"
    exit 1
fi

echo ""
echo -e "${YELLOW}Running database migration...${NC}"

# Check if setup_db.sql exists
if [ ! -f "setup_db.sql" ]; then
    echo -e "${RED}❌ setup_db.sql not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Run migration
if psql "$CONNECTION_STRING" < setup_db.sql; then
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
else
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Check the error messages above."
    exit 1
fi

echo ""
echo -e "${YELLOW}Verifying database setup...${NC}"

# Verify tables were created
TABLES=$(psql "$CONNECTION_STRING" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLES" -gt "0" ]; then
    echo -e "${GREEN}✅ Found $TABLES tables in database${NC}"
    
    # List tables
    echo ""
    echo "Tables created:"
    psql "$CONNECTION_STRING" -c "\dt" | grep -v "public | schema | table" | grep -v "^$" | grep -v "^-" || true
else
    echo -e "${YELLOW}⚠️  No tables found. Migration may have failed.${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update Render backend with DATABASE_URL:"
echo "   $CONNECTION_STRING"
echo "2. Or use individual variables:"
echo "   DB_HOST=$DB_HOST"
echo "   DB_PORT=$DB_PORT"
echo "   DB_NAME=$DB_NAME"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo ""

