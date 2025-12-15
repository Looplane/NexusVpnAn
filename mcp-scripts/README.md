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
SUPABASE_URL=https://xorjbccyuinebimlxblu.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Render Configuration
RENDER_API_KEY=your-render-api-key
RENDER_SERVICE_ID=your-render-service-id
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