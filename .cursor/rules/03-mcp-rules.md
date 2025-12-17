# MCP (Model Context Protocol) Rules

**Document ID:** CURSOR-RULES-003  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## MCP Server Configuration

**Available MCP Servers:**
- **Supabase MCP** (`mcp-servers/supabase-mcp/`) - Database operations
- **Render MCP** (`mcp-servers/render-mcp/`) - Deployment operations
- **Firecrawl MCP** (if configured) - Web scraping and content extraction

## MCP Tools Available

### Supabase MCP Server
- `test_connection` - Test database connectivity
- `query_database` - Execute SQL queries
- `get_table_info` - Get schema information

### Render MCP Server
- `test_render_connection` - Test API connectivity
- `list_services` - List all services
- `get_service_info` - Get service details
- `get_service_logs` - Retrieve logs
- `trigger_deploy` - Trigger deployments
- `update_env_vars` - Update environment variables

### Firecrawl MCP Server
- `scrape_url` - Scrape web pages and extract structured data
- `crawl_site` - Crawl entire websites with intelligent link following
- `extract_content` - Extract specific content types (text, images, links)
- `search_and_scrape` - Search for content and scrape results
- `analyze_page` - Analyze page structure and metadata
- `monitor_credits` - Monitor Firecrawl API usage and credits

## MCP Server Configuration JSON

```json
{
  "mcpServers": {
    "supabase": {
      "command": "node",
      "args": ["mcp-servers/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://xorjbccyuinebimlxblu.supabase.co",
        "SUPABASE_KEY": "${SUPABASE_KEY}"
      }
    },
    "render": {
      "command": "node",
      "args": ["mcp-servers/render-mcp/dist/index.js"],
      "env": {
        "RENDER_API_KEY": "${RENDER_API_KEY}"
      }
    }
  }
}
```

## MCP Documentation

- Main Guide: `@--DOCUMENTATIONS--/05-MCP/01-MCP-README_17-12-2025_022243.md`
- API Keys: `@--DOCUMENTATIONS--/05-MCP/13-MCP-MCP_API_KEYS_GUIDE_17-12-2025_024425.md`
- Quick Setup: `@--DOCUMENTATIONS--/05-MCP/16-MCP-MCP_QUICK_SETUP_17-12-2025_024425.md`
- Integration: `@--DOCUMENTATIONS--/05-MCP/14-MCP-MCP_INTEGRATION_GUIDE_17-12-2025_024425.md`

## MCP Configuration File

- MCP Config: `@agents/MCP_AGENT_CONFIG.md`

## Usage Guidelines

1. **Use MCP servers** - Leverage MCP tools for database and deployment operations when available
2. **Never commit API keys** - Use environment variables
3. **Test connections** - Always test MCP connections before using tools
4. **Document operations** - Log all MCP operations in documentation

