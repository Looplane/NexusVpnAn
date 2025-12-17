# 🎯 MCP (Model Context Protocol) Agent Configuration

This file contains the agent configuration for managing MCP servers and API key setup.

## 📋 Agent Tasks

### Primary Responsibilities
1. **MCP Server Management**: Build, test, and maintain Supabase/Render MCP servers
2. **API Key Configuration**: Guide users through obtaining and configuring API keys
3. **Documentation**: Create and maintain MCP-related documentation
4. **Integration**: Ensure MCP servers work with existing project structure

### Execution Rules
- **Autonomous Operation**: Follow AGENT_POLICY.md guidelines
- **Documentation First**: Always create/update documentation before implementation
- **Project Structure**: Respect existing folder structure (--DOCUMENTATIONS--, @agents/)
- **Windows Compatibility**: Ensure all scripts work on Windows (PowerShell/batch)

## 🚀 Current MCP Status

### ✅ Completed Tasks
- [x] Supabase MCP server built and tested
- [x] Render MCP server built and tested  
- [x] Firecrawl MCP server configured and integrated
- [x] API keys configured in .env.mcp
- [x] Documentation moved to --DOCUMENTATIONS--/05-MCP/
- [x] Windows test scripts created
- [x] Setup helpers created (batch/PowerShell)

### 🔧 MCP Tools Available

**Supabase MCP Server**:
- `test_connection` - Test database connectivity
- `query_database` - Execute SQL queries
- `get_table_info` - Get schema information

**Render MCP Server**:
- `test_render_connection` - Test API connectivity
- `list_services` - List all services
- `get_service_info` - Get service details
- `get_service_logs` - Retrieve logs
- `trigger_deploy` - Trigger deployments
- `update_env_vars` - Update environment variables

**Firecrawl MCP Server**:
- `scrape_url` - Scrape web pages and extract structured data
- `crawl_site` - Crawl entire websites with intelligent link following
- `extract_content` - Extract specific content types (text, images, links)
- `search_and_scrape` - Search for content and scrape results
- `analyze_page` - Analyze page structure and metadata
- `monitor_credits` - Monitor Firecrawl API usage and credits

## 📁 File Structure

```
--DOCUMENTATIONS--/
└── 05-MCP/
    ├── 01-MCP-README_17-12-2025_022243.md
    ├── 13-MCP-MCP_API_KEYS_GUIDE_17-12-2025_024425.md
    ├── 16-MCP-MCP_QUICK_SETUP_17-12-2025_024425.md
    ├── 14-MCP-MCP_INTEGRATION_GUIDE_17-12-2025_024425.md
    ├── 15-MCP-MCP_KEYS_ACTION_PLAN_17-12-2025_024425.md
    ├── 17-MCP-MCP_SETUP_COMPLETE_17-12-2025_024425.md
    └── 07-MCP-FIRECRAWL_INTEGRATION_17-12-2025_024425.md

mcp-servers/
├── supabase-mcp/
├── render-mcp/
├── firecrawl-mcp/
└── README.md

mcp-scripts/
├── install-mcp.sh
├── dev-mcp.sh
├── stop-dev.sh
├── test-mcp.sh
├── setup-helper.bat
├── setup-simple.ps1
└── test-firecrawl.sh
```

## 🎯 Next Actions

### Immediate Actions (High Priority)
- [ ] Update main project README with MCP integration info
- [ ] Add MCP commands to package.json scripts
- [ ] Test full integration with existing deployment workflow
- [ ] Test Firecrawl MCP server functionality

### Future Enhancements (Medium Priority)
- [ ] Create MCP server for Vercel management
- [ ] Add database migration tools to Supabase MCP
- [ ] Create unified MCP dashboard
- [ ] Add monitoring and alerting via MCP

## 🔗 Related Files

- **Main Documentation**: `@--DOCUMENTATIONS--/05-MCP/01-MCP-README_17-12-2025_022243.md`
- **API Keys Guide**: `@--DOCUMENTATIONS--/05-MCP/13-MCP-MCP_API_KEYS_GUIDE_17-12-2025_024425.md`
- **Quick Setup**: `@--DOCUMENTATIONS--/05-MCP/16-MCP-MCP_QUICK_SETUP_17-12-2025_024425.md`
- **Integration Guide**: `@--DOCUMENTATIONS--/05-MCP/14-MCP-MCP_INTEGRATION_GUIDE_17-12-2025_024425.md`
- **Agent Policy**: `@agents/AGENT_POLICY.md`
- **System Instructions**: `@agents/SYSTEM_INSTRUCTIONS.json`
- **Project TODO**: `@agents/TODO.md`

## 🚨 Important Notes

1. **API Keys**: Never commit actual API keys to version control
2. **Windows Scripts**: Always test PowerShell/batch files on Windows
3. **Documentation**: Keep all MCP docs in --DOCUMENTATIONS--/05-MCP/
4. **Integration**: Ensure MCP tools work with existing deployment guides

This configuration ensures autonomous operation while maintaining project structure and Windows compatibility.