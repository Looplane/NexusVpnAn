#!/bin/bash

# MCP Configuration Helper Script
# This script helps you gather and verify your API keys and configuration

set -e

echo "🔍 MCP Configuration Helper for NexusVPN"
echo "========================================"
echo ""

# Check if .env.mcp exists
if [ -f .env.mcp ]; then
    echo "✅ .env.mcp file found"
else
    echo "❌ .env.mcp file not found"
    echo "Creating from template..."
    cp .env.mcp.example .env.mcp
    echo "✅ Created .env.mcp from template"
fi

echo ""
echo "📋 Required Configuration Details:"
echo ""

echo "1️⃣ SUPABASE CONFIGURATION:"
echo "   Project URL: https://xorjbccyuinebimlxblu.supabase.co"
echo "   Get your keys at: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api"
echo "   Required: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY"
echo ""

echo "2️⃣ RENDER CONFIGURATION:"
echo "   Get API key at: https://dashboard.render.com/account/api-keys"
echo "   Find service ID at: https://dashboard.render.com"
echo "   Required: RENDER_API_KEY, RENDER_SERVICE_ID"
echo ""

echo "📝 Current .env.mcp contents:"
echo "----------------------------------------"
cat .env.mcp
echo "----------------------------------------"
echo ""

echo "🔧 Next Steps:"
echo "1. Visit the URLs above to get your API keys"
echo "2. Edit .env.mcp with your actual keys"
echo "3. Run: npm run mcp:test"
echo ""

echo "💡 Tips:"
echo "- Supabase anon key starts with 'eyJ'"
echo "- Render API key starts with 'rnd_'"
echo "- Service ID looks like 'srv-xxxxxxxxxxxxxxxxxxxxx'"
echo "- Keep your service_role key secret!"
echo ""

# Function to test configuration
test_config() {
    if [ -f .env.mcp ]; then
        source .env.mcp
        
        echo "🔍 Testing current configuration..."
        
        # Check if keys are still placeholders
        if [[ "$SUPABASE_KEY" == *"your-anon-key"* ]] || [[ "$RENDER_API_KEY" == *"your-render-api-key"* ]]; then
            echo "⚠️  Configuration contains placeholder values"
            echo "Please update .env.mcp with your actual API keys"
        else
            echo "✅ Configuration appears to be set up"
            echo "You can now test with: npm run mcp:test"
        fi
    fi
}

test_config