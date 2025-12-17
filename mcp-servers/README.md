# MCP Servers Configuration

This directory contains MCP (Model Context Protocol) servers for integrating with Supabase and Render services.

## Supabase MCP Server

The Supabase MCP server provides tools for interacting with your Supabase database.

### Features
- Execute SQL queries
- Get table information
- Test database connection
- Manage database operations

### Setup
1. Navigate to the supabase-mcp directory:
   ```bash
   cd mcp-servers/supabase-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

4. Set environment variables:
   Create a `.env.mcp` file in the project root or set environment variables:
   ```bash
   # Option 1: Create .env.mcp file (recommended)
   cp .env.mcp.example .env.mcp
   # Then edit .env.mcp with your actual credentials
   
   # Option 2: Set environment variables directly
   export SUPABASE_URL="your-supabase-url-here"
   export SUPABASE_KEY="your-supabase-anon-key-here"
   ```

### Usage
Run the server:
```bash
npm start
```

## Render MCP Server

The Render MCP server provides tools for managing your Render services and deployments.

### Features
- List services
- Get service information
- Retrieve service logs
- Trigger deployments
- Update environment variables
- Test API connection

### Setup
1. Navigate to the render-mcp directory:
   ```bash
   cd mcp-servers/render-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the server:
   ```bash
   npm run build
   ```

4. Set environment variables:
   ```bash
   export RENDER_API_KEY="your-render-api-key"
   ```

### Usage
Run the server:
```bash
npm start
```

## Integration with IDE

To integrate these MCP servers with your IDE (like Trae), add the following configuration to your MCP settings:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["mcp-servers/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    },
    "render": {
      "command": "node",
      "args": ["mcp-servers/render-mcp/dist/index.js"],
      "env": {
        "RENDER_API_KEY": "your-render-api-key"
      }
    }
  }
}
```

## Available Tools

### Supabase Tools
- `query_database`: Execute SQL queries
- `get_table_info`: Get table schema information
- `test_connection`: Test database connectivity

### Render Tools
- `list_services`: List all Render services
- `get_service_info`: Get detailed service information
- `get_service_logs`: Retrieve service logs
- `trigger_deploy`: Trigger new deployments
- `update_env_vars`: Update environment variables
- `test_render_connection`: Test API connectivity

## Troubleshooting

If you encounter connection issues:

1. **Supabase Connection**: Ensure your database allows connections from your IP address and that the connection string is correct.

2. **Render API**: Make sure your Render API key has the necessary permissions.

3. **IPv6 Issues**: If you're experiencing IPv6 connectivity issues, refer to the main deployment documentation for troubleshooting steps.

4. **Environment Variables**: Double-check that all required environment variables are properly set.