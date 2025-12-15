#!/bin/bash

# Interactive MCP Configuration Setup Script
# This script guides you through setting up your MCP configuration

set -e

echo "🚀 MCP Configuration Setup Wizard"
echo "================================="
echo ""
echo "This wizard will help you set up the required API keys for your MCP servers."
echo ""

# Function to prompt for input
prompt_for_input() {
    local prompt_text=$1
    local default_value=$2
    local input_value
    
    if [ -n "$default_value" ]; then
        echo -n "$prompt_text [$default_value]: "
    else
        echo -n "$prompt_text: "
    fi
    
    read input_value
    
    if [ -z "$input_value" ] && [ -n "$default_value" ]; then
        echo "$default_value"
    else
        echo "$input_value"
    fi
}

# Check if .env.mcp exists, create if not
if [ ! -f .env.mcp ]; then
    echo "Creating .env.mcp file..."
    cp .env.mcp.example .env.mcp
fi

# Backup existing config
if [ -f .env.mcp ]; then
    cp .env.mcp .env.mcp.backup
    echo "✅ Backed up existing configuration to .env.mcp.backup"
fi

echo ""
echo "🔑 SUPABASE CONFIGURATION"
echo "-------------------------"
echo ""
echo "Your Supabase project URL is: https://xorjbccyuinebimlxblu.supabase.co"
echo ""
echo "To get your API keys:"
echo "1. Go to: https://app.supabase.com/project/xorjbccyuinebimlxblu/settings/api"
echo "2. Copy the 'anon public' key"
echo "3. Copy the 'service_role' key (for admin operations)"
echo ""

SUPABASE_URL="https://xorjbccyuinebimlxblu.supabase.co"
SUPABASE_KEY=$(prompt_for_input "Enter your Supabase anon key" "")
SUPABASE_SERVICE_KEY=$(prompt_for_input "Enter your Supabase service_role key" "")

echo ""
echo "🔑 RENDER CONFIGURATION"
echo "----------------------"
echo ""
echo "To get your Render API key:"
echo "1. Go to: https://dashboard.render.com/account/api-keys"
echo "2. Create a new API key if you don't have one"
echo "3. Copy the API key (starts with 'rnd_')"
echo ""
echo "To get your service ID:"
echo "1. Go to: https://dashboard.render.com"
echo "2. Find your NexusVPN service"
echo "3. Copy the service ID from the URL or service settings"
echo ""

RENDER_API_KEY=$(prompt_for_input "Enter your Render API key" "")
RENDER_SERVICE_ID=$(prompt_for_input "Enter your Render service ID" "")

echo ""
echo "📝 Creating configuration file..."

# Create new .env.mcp file
cat > .env.mcp << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Render Configuration
RENDER_API_KEY=$RENDER_API_KEY
RENDER_SERVICE_ID=$RENDER_SERVICE_ID
EOF

echo "✅ Configuration file created successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "------------------------"
echo "Supabase URL: $SUPABASE_URL"
echo "Supabase Key: ${SUPABASE_KEY:0:10}..."
echo "Render API Key: ${RENDER_API_KEY:0:10}..."
echo "Render Service ID: $RENDER_SERVICE_ID"
echo ""
echo "🧪 Testing Configuration..."
echo ""

# Test configuration
if [ -n "$SUPABASE_KEY" ] && [ -n "$RENDER_API_KEY" ]; then
    echo "✅ Configuration appears complete"
    echo ""
    echo "🚀 Next steps:"
    echo "1. Test the MCP servers: npm run mcp:test"
    echo "2. Start development mode: npm run mcp:dev"
    echo "3. Use MCP tools to manage your deployment"
else
    echo "⚠️  Some configuration values are missing"
    echo "Please update .env.mcp with the missing values"
fi

echo ""
echo "🎉 Setup complete! Your MCP servers are ready to use."