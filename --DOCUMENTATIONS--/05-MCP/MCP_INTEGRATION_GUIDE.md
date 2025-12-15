# MCP Integration Guide for NexusVPN

This guide explains how to use the newly integrated Supabase and Render MCP servers to manage your deployment and database operations.

## 🚀 Quick Start

### 1. Setup MCP Servers
```bash
# Install and build all MCP servers
npm run mcp:install

# Or manually:
cd mcp-servers/supabase-mcp && npm install && npm run build
cd ../render-mcp && npm install && npm run build
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.mcp.example .env.mcp

# Edit .env.mcp with your actual credentials
```

### 3. Test Integration
```bash
# Test all MCP servers
npm run mcp:test
```

## 📋 Available MCP Tools

### Supabase MCP Tools

#### `test_connection`
Test connectivity to your Supabase database.
```json
{
  "method": "tools/call",
  "params": {
    "name": "test_connection"
  }
}
```

#### `query_database`
Execute SQL queries on your Supabase database.
```json
{
  "method": "tools/call", 
  "params": {
    "name": "query_database",
    "arguments": {
      "query": "SELECT * FROM users LIMIT 10"
    }
  }
}
```

#### `get_table_info`
Get schema information about database tables.
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_table_info",
    "arguments": {
      "tableName": "users"
    }
  }
}
```

### Render MCP Tools

#### `test_render_connection`
Test connectivity to Render API.
```json
{
  "method": "tools/call",
  "params": {
    "name": "test_render_connection"
  }
}
```

#### `list_services`
List all your Render services.
```json
{
  "method": "tools/call",
  "params": {
    "name": "list_services",
    "arguments": {
      "limit": 20
    }
  }
}
```

#### `get_service_info`
Get detailed information about a specific service.
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_service_info",
    "arguments": {
      "serviceId": "your-service-id"
    }
  }
}
```

#### `get_service_logs`
Retrieve logs for a service.
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_service_logs",
    "arguments": {
      "serviceId": "your-service-id",
      "lines": 100
    }
  }
}
```

#### `trigger_deploy`
Trigger a new deployment.
```json
{
  "method": "tools/call",
  "params": {
    "name": "trigger_deploy",
    "arguments": {
      "serviceId": "your-service-id",
      "clearCache": false
    }
  }
}
```

#### `update_env_vars`
Update environment variables for a service.
```json
{
  "method": "tools/call",
  "params": {
    "name": "update_env_vars",
    "arguments": {
      "serviceId": "your-service-id",
      "envVars": {
        "DATABASE_URL": "your-database-url",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🔧 IDE Integration

### Trae IDE Configuration
The MCP servers are automatically configured for Trae IDE. The configuration is in `trae-mcp-config.json`.

### Other IDEs
Use `mcp-config.json` for other IDE integrations.

## 🛠️ Development Workflow

### 1. Start Development Servers
```bash
npm run mcp:dev
```
This starts both MCP servers in development mode with live logging.

### 2. Monitor Logs
```bash
# View Supabase MCP logs
tail -f logs/supabase-mcp-dev.log

# View Render MCP logs  
tail -f logs/render-mcp-dev.log
```

### 3. Stop Development Servers
```bash
npm run mcp:stop
```

## 🐛 Troubleshooting

### Connection Issues
1. **Supabase Connection**: Ensure your database allows connections and credentials are correct
2. **Render API**: Verify your API key has necessary permissions
3. **IPv6 Issues**: Refer to main deployment documentation for IPv6 troubleshooting

### Environment Variables
Double-check all environment variables in `.env.mcp`:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon key
- `RENDER_API_KEY`: Your Render API key

### Build Issues
If servers fail to build:
```bash
# Clean and rebuild
cd mcp-servers/supabase-mcp && rm -rf node_modules dist && npm install && npm run build
cd ../render-mcp && rm -rf node_modules dist && npm install && npm run build
```

## 📊 Common Use Cases

### Debugging Deployment Issues
1. Use `get_service_logs` to check recent logs
2. Use `get_service_info` to verify service status
3. Use `test_connection` to check database connectivity

### Database Management
1. Use `query_database` to run diagnostic queries
2. Use `get_table_info` to understand schema
3. Use `test_connection` to verify connectivity

### Automated Deployment
1. Use `update_env_vars` to update environment variables
2. Use `trigger_deploy` to deploy changes
3. Use `get_service_logs` to monitor deployment progress

## 🔗 Related Documentation

- [Supabase Setup Guide](../SUPABASE_SETUP.md)
- [Render Deployment Guide](../CLOUD_DEPLOYMENT.md)
- [Main Deployment Steps](../DEPLOYMENT_STEPS.md)
- [MCP Server Documentation](../../mcp-servers/README.md)