#!/bin/bash

# MCP Servers Installation Script
# This script installs and sets up all MCP servers for the project

set -e

echo "🚀 Setting up MCP servers for NexusVPN..."

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Create logs directory
mkdir -p logs

# Function to setup an MCP server
setup_mcp_server() {
    local server_name=$1
    local server_dir="mcp-servers/$server_name"
    
    echo "📦 Setting up $server_name MCP server..."
    
    if [ ! -d "$server_dir" ]; then
        echo "❌ Directory $server_dir not found"
        return 1
    fi
    
    cd "$server_dir"
    
    # Install dependencies
    echo "Installing dependencies for $server_name..."
    npm install
    
    # Build the server
    echo "Building $server_name..."
    npm run build
    
    # Return to project root
    cd "$PROJECT_ROOT"
    
    echo "✅ $server_name MCP server setup complete"
}

# Setup Supabase MCP server
echo "Setting up Supabase MCP server..."
setup_mcp_server "supabase-mcp"

# Setup Render MCP server
echo "Setting up Render MCP server..."
setup_mcp_server "render-mcp"

# Create environment configuration
echo "Creating environment configuration..."
cat > .env.mcp.example << EOF
# Supabase Configuration
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Render Configuration  
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id
EOF

echo "📝 Environment template created at .env.mcp.example"
echo "Please copy this file to .env.mcp and update with your actual credentials"

# Create MCP configuration
echo "Creating MCP configuration..."
cat > mcp-config.json << EOF
{
  "servers": {
    "supabase": {
      "name": "Supabase MCP Server",
      "description": "MCP server for Supabase database operations",
      "command": "node",
      "args": ["mcp-servers/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "\${SUPABASE_URL}",
        "SUPABASE_KEY": "\${SUPABASE_KEY}"
      }
    },
    "render": {
      "name": "Render MCP Server", 
      "description": "MCP server for Render service management",
      "command": "node",
      "args": ["mcp-servers/render-mcp/dist/index.js"],
      "env": {
        "RENDER_API_KEY": "\${RENDER_API_KEY}"
      }
    }
  }
}
EOF

echo "✨ MCP configuration created at mcp-config.json"

echo ""
echo "🎉 MCP servers setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.mcp.example to .env.mcp and update with your credentials"
echo "2. Test the servers with: npm run test-mcp"
echo "3. Start development mode with: ./mcp-scripts/dev-mcp.sh"
echo ""
echo "For IDE integration, use the mcp-config.json file with your preferred editor."