# MCP Integration Scripts

This directory contains utility scripts for managing MCP servers and their integration with the project.

## Installation Script

The `install-mcp.sh` script sets up all MCP servers and configures them for use.

### Usage
```bash
chmod +x install-mcp.sh
./install-mcp.sh
```

This script will:
1. Install dependencies for all MCP servers
2. Build all servers
3. Create configuration files
4. Set up environment variables

## Development Script

The `dev-mcp.sh` script runs all MCP servers in development mode.

### Usage
```bash
chmod +x dev-mcp.sh
./dev-mcp.sh
```

## Environment Setup

Create a `.env.mcp` file in the project root with the following variables:

```bash
# Supabase Configuration
# Get your Supabase URL and anon key from: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_KEY=your-supabase-service-key-here

# Render Configuration
# Get your API key from: https://dashboard.render.com/account/api-keys
RENDER_API_KEY=your-render-api-key-here
RENDER_SERVICE_ID=your-render-service-id-here

# Firecrawl Configuration
# Get your API key from: https://firecrawl.dev
FIRECRAWL_API_KEY=your-firecrawl-api-key-here

# GitHub Configuration
# Get your token from: https://github.com/settings/tokens
# Required scopes: repo, read:org, read:user
GITHUB_TOKEN=your-github-personal-access-token

# Figma Configuration
# Get your API key from: https://www.figma.com/developers/api#access-tokens
FIGMA_API_KEY=your-figma-api-key-here
```

## MCP Configuration File

The `mcp-config.json` file contains the configuration for integrating MCP servers with various IDEs and tools.

### Example Configuration
```json
{
  "servers": {
    "supabase": {
      "name": "Supabase MCP Server",
      "description": "MCP server for Supabase database operations",
      "command": "node",
      "args": ["mcp-servers/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    },
    "render": {
      "name": "Render MCP Server",
      "description": "MCP server for Render service management",
      "command": "node",
      "args": ["mcp-servers/render-mcp/dist/index.js"],
      "env": {
        "RENDER_API_KEY": "${RENDER_API_KEY}"
      }
    }
  }
}
```