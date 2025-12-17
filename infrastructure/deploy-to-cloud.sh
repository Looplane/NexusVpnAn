#!/bin/bash

# Cloud Deployment Automation Script
# Guides through the complete cloud deployment process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🚀 NexusVPN Cloud Deployment Automation Script      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git is not installed${NC}"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Not in a git repository${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 0
    fi
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found${NC}"
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "frontend/vercel.json" ]; then
    echo -e "${RED}❌ frontend/vercel.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Step 1: Database Setup
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Supabase Database Setup${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Have you created a Supabase project? (y/n): " SUPABASE_CREATED

if [ "$SUPABASE_CREATED" != "y" ]; then
    echo ""
    echo -e "${YELLOW}Please create a Supabase project first:${NC}"
    echo "1. Go to https://supabase.com"
    echo "2. Create a new project"
    echo "3. Save the database password"
    echo ""
    read -p "Press Enter when done..."
fi

echo ""
read -p "Do you want to run the database migration script? (y/n): " RUN_MIGRATION

if [ "$RUN_MIGRATION" = "y" ]; then
    if [ -f "infrastructure/setup-supabase-db.sh" ]; then
        echo ""
        echo -e "${GREEN}Running database setup script...${NC}"
        chmod +x infrastructure/setup-supabase-db.sh
        ./infrastructure/setup-supabase-db.sh
    else
        echo -e "${YELLOW}⚠️  Database setup script not found${NC}"
        echo "Please run the migration manually in Supabase SQL Editor"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database migration${NC}"
    echo "Remember to run the migration before deploying backend!"
fi

echo ""
read -p "Press Enter to continue to backend deployment..."

# Step 2: Backend Deployment
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2: Backend Deployment (Render)${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if code is pushed to GitHub
echo -e "${YELLOW}Checking git status...${NC}"
if [ -d ".git" ]; then
    GIT_STATUS=$(git status --porcelain)
    if [ -n "$GIT_STATUS" ]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
        read -p "Do you want to commit and push? (y/n): " PUSH_CODE
        
        if [ "$PUSH_CODE" = "y" ]; then
            echo ""
            read -p "Enter commit message (default: 'Deploy to cloud'): " COMMIT_MSG
            COMMIT_MSG=${COMMIT_MSG:-Deploy to cloud}
            
            git add .
            git commit -m "$COMMIT_MSG"
            
            read -p "Push to GitHub? (y/n): " PUSH_NOW
            if [ "$PUSH_NOW" = "y" ]; then
                git push origin main || git push origin master
                echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
            fi
        fi
    else
        echo -e "${GREEN}✅ Working directory is clean${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Render Deployment Instructions:${NC}"
echo ""
echo "1. Go to https://render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Render will auto-detect render.yaml"
echo "5. Link your Supabase database (or set DATABASE_URL manually)"
echo "6. Click 'Create Web Service'"
echo ""
read -p "Press Enter when backend is deployed..."

echo ""
read -p "Enter your Render backend URL (e.g., https://nexusvpn-api.onrender.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}❌ Backend URL is required${NC}"
    exit 1
fi

# Test backend
echo ""
echo -e "${YELLOW}Testing backend...${NC}"
HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/" || echo "ERROR")

if echo "$HEALTH_RESPONSE" | grep -q "NexusVPN"; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

# Step 3: Frontend Deployment
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Frontend Deployment (Vercel)${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}Vercel Deployment Instructions:${NC}"
echo ""
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New' → 'Project'"
echo "3. Import from GitHub"
echo "4. Select your repository"
echo "5. Configure:"
echo "   - Root Directory: frontend"
echo "   - Framework Preset: Vite (auto-detected)"
echo "6. Add Environment Variable:"
echo "   - Key: VITE_API_URL"
echo "   - Value: ${BACKEND_URL}/api"
echo "7. Click 'Deploy'"
echo ""
read -p "Press Enter when frontend is deployed..."

echo ""
read -p "Enter your Vercel frontend URL (e.g., https://nexusvpn.vercel.app): " FRONTEND_URL

if [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}❌ Frontend URL is required${NC}"
    exit 1
fi

# Step 4: Update CORS
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 4: Update CORS Configuration${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}You need to update CORS in Render:${NC}"
echo ""
echo "1. Go to Render dashboard → Your service → Environment"
echo "2. Update these variables:"
echo "   - FRONTEND_URL = ${FRONTEND_URL}"
echo "   - CORS_ORIGIN = ${FRONTEND_URL}"
echo "3. Save changes (backend will auto-redeploy)"
echo ""
read -p "Press Enter when CORS is updated..."

# Step 5: Verification
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 5: Verification${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Do you want to run the verification script? (y/n): " RUN_VERIFY

if [ "$RUN_VERIFY" = "y" ]; then
    if [ -f "infrastructure/test-cloud-deployment.sh" ]; then
        echo ""
        chmod +x infrastructure/test-cloud-deployment.sh
        ./infrastructure/test-cloud-deployment.sh
    else
        echo -e "${YELLOW}⚠️  Test script not found${NC}"
    fi
fi

# Summary
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Summary${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Backend URL:${NC} ${BACKEND_URL}"
echo -e "${BLUE}Frontend URL:${NC} ${FRONTEND_URL}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Test login: ${FRONTEND_URL}/#/login"
echo "2. Default admin: admin@nexusvpn.com / password"
echo "3. Change admin password immediately!"
echo "4. Check deployment checklist: --DOCUMENTATIONS--/06-Deployment/27-DEP-Deployment_Checklist_17-12-2025_032824.md"
echo ""
echo -e "${GREEN}🎉 Deployment process complete!${NC}"
echo ""

