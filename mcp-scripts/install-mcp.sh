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
# Get your Supabase URL and anon key from: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here

# Render Configuration  
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id

# GitHub Configuration
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
GITHUB_TOKEN=your-github-personal-access-token

# Figma Configuration
# Get your API key from: https://www.figma.com/developers/api#access-tokens
FIGMA_API_KEY=your-figma-api-key
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
    },
    "firecrawl": {
      "name": "Firecrawl MCP Server",
      "description": "MCP server for web scraping and data extraction using Firecrawl",
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "\${FIRECRAWL_API_KEY}",
        "FIRECRAWL_RETRY_MAX_ATTEMPTS": "3",
        "FIRECRAWL_RETRY_INITIAL_DELAY": "1000",
        "FIRECRAWL_RETRY_MAX_DELAY": "10000",
        "FIRECRAWL_RETRY_BACKOFF_FACTOR": "2",
        "FIRECRAWL_CREDIT_WARNING_THRESHOLD": "1000",
        "FIRECRAWL_CREDIT_CRITICAL_THRESHOLD": "100"
      }
    },
    "github": {
      "name": "GitHub MCP Server",
      "description": "MCP server for GitHub repository operations, PR management, and issue tracking",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "\${GITHUB_TOKEN}"
      }
    },
    "figma": {
      "name": "Figma MCP Server",
      "description": "MCP server for Figma design file access and design-to-code workflows",
      "command": "npx",
      "args": ["-y", "figma-developer-mcp@0.6.3"],
      "env": {
        "FIGMA_API_KEY": "\${FIGMA_API_KEY}"
      }
    }
  }
}
EOF

echo "✨ MCP configuration created at mcp-config.json"

# Note about GitHub and Figma MCP servers
echo ""
echo "📦 Note: GitHub and Figma MCP servers use npx and will be installed on first use"
echo "   They don't require separate installation steps."
echo ""

echo ""
echo "🎉 MCP servers setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.mcp.example to .env.mcp and update with your credentials"
echo "2. Get GitHub token from: https://github.com/settings/tokens (scopes: repo, read:org, read:user)"
echo "3. Get Figma API key from: https://www.figma.com/developers/api#access-tokens"
echo "4. Test the servers with: npm run test-mcp"
echo "5. Start development mode with: ./mcp-scripts/dev-mcp.sh"
echo ""
echo "For IDE integration, use the mcp-config.json file with your preferred editor."