# Cursor IDE Setup Guide

**Document ID:** SET-CURSOR-001  
**Created:** 17-12-2025 | Time: 13:30:13  
**Last Updated:** 17-12-2025 | Time: 13:30:13

**Related Documents:**
- @.cursorrules (1-434) - Main project rules
- @.cursor/rules/07-cursor-rules.mdc (1-500) - Comprehensive cursor rules
- @agents/AGENTS.md (1-19) - Agent roles

---

## Overview

This guide provides step-by-step instructions for configuring Cursor IDE with all project rules, agents, documentation, and MCP servers for optimal development experience.

## Prerequisites

- Cursor IDE installed
- Project cloned locally
- Node.js 18+ installed
- Git configured

## Step 1: Open Project in Cursor

1. Launch Cursor IDE
2. File → Open Folder
3. Select the NexusVPN project root directory
4. Wait for Cursor to index the project

## Step 2: Configure Project Rules

### Access Rules Settings

1. Open Cursor Settings: `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
2. Navigate to **Rules and Commands** → **Project Rules**
3. Click **"+ Add Rule"** button

### Add Core Rules (Essential - Add First)

Add these files in order:

1. **`.cursorrules`** - Main project rules
   - Path: `.cursorrules` (project root)
   - Priority: Highest

2. **`agents/AGENTS.md`** - Agent roles and responsibilities
   - Path: `agents/AGENTS.md`
   - Priority: High

3. **`agents/AGENT_POLICY.md`** - Agent autonomy and execution rules
   - Path: `agents/AGENT_POLICY.md`
   - Priority: High

4. **`agents/SPEC.md`** - Execution spec (additive changes only)
   - Path: `agents/SPEC.md`
   - Priority: High

5. **`agents/TODO.md`** - Task tracking and priorities
   - Path: `agents/TODO.md`
   - Priority: High

### Add Agent Configuration Files

6. **`agents/MCP_AGENT_CONFIG.md`** - MCP server configuration
7. **`agents/ROADMAP.md`** - Project roadmap
8. **`agents/PHASES.md`** - Development phases
9. **`agents/README.md`** - Agent registry overview
10. **`agents/specialists/backend.agent.md`** - Backend specialist
11. **`agents/specialists/frontend.agent.md`** - Frontend specialist
12. **`agents/specialists/architecture.agent.md`** - Architecture specialist
13. **`agents/specialists/version-management.agent.md`** - Version management
14. **`agents/specialists/compatibility-checking.agent.md`** - Compatibility checking
15. **`agents/loader/agent.auto-loader.md`** - Agent auto-discovery

### Add Documentation References

16. **`--DOCUMENTATIONS--/00-INDEX-Documentation_Structure_17-12-2025_022243.md`** - Documentation index
17. **`--DOCUMENTATIONS--/01-Planning/02-PL-Task_Tracker_17-12-2025_022243.md`** - Task tracking
18. **`--DOCUMENTATIONS--/02-Architecture/01-AR-API_Schema_17-12-2025_022243.md`** - API schema
19. **`--DOCUMENTATIONS--/02-Architecture/02-AR-System_Architecture_17-12-2025_022243.md`** - System architecture
20. **`--DOCUMENTATIONS--/10-Configuration/03-CFG-VERSION_MANAGEMENT_GUIDE_17-12-2025_133013.md`** - Version management
21. **`--DOCUMENTATIONS--/10-Configuration/04-CFG-COMPATIBILITY_MATRIX_17-12-2025_133013.md`** - Compatibility matrix

### Add MCP Documentation

22. **`--DOCUMENTATIONS--/05-MCP/01-MCP-README_17-12-2025_022243.md`** - MCP overview
23. **`--DOCUMENTATIONS--/05-MCP/25-MCP-GITHUB_MCP_SETUP_17-12-2025_133013.md`** - GitHub MCP setup
24. **`--DOCUMENTATIONS--/05-MCP/26-MCP-FIGMA_MCP_SETUP_17-12-2025_133013.md`** - Figma MCP setup

### Add Comprehensive Cursor Rules

25. **`.cursor/rules/07-cursor-rules.mdc`** - Comprehensive cursor rules (this file is auto-applied)

## Step 3: Configure MCP Servers

### MCP Server Configuration

1. **Locate MCP Config**: `mcp-config.json` in project root
2. **Environment Variables**: Create `.env.mcp` from `.env.mcp.example`
3. **Add API Keys**: 
   - GitHub: Get token from https://github.com/settings/tokens
   - Figma: Get API key from https://www.figma.com/developers/api#access-tokens
   - Supabase: Get from Supabase dashboard
   - Render: Get from Render dashboard
   - Firecrawl: Get from Firecrawl dashboard

### Configure in Cursor

1. Open Cursor Settings
2. Navigate to **MCP Servers** or **Extensions** → **MCP**
3. Import configuration from `mcp-config.json`
4. Verify all servers are connected

## Step 4: Verify Configuration

### Test Agent Loading

1. Open a new chat in Cursor
2. Try: `@backend-nexusvpn-specialist: List all API endpoints`
3. Verify agent responds correctly

### Test MCP Servers

1. Try: `Use GitHub MCP tool: github_search_repositories QUERY: nexusvpn`
2. Verify GitHub MCP responds
3. Try: `Use Figma MCP tool: figma_get_file FILE_KEY: [your-file-key]`
4. Verify Figma MCP responds

### Test Documentation Access

1. Try: `Show me the version management guide`
2. Verify documentation is accessible
3. Try: `What are the current project priorities?`
4. Verify NEXT_STEPS.md is accessible

## Step 5: Configure Project Commands (Optional)

### Add Custom Commands

1. Open Cursor Settings
2. Navigate to **Rules and Commands** → **Project Commands**
3. Click **"+ Add Command"**

### Recommended Commands

**Backend Development:**
- Name: `Backend Development`
- Command: `@backend-nexusvpn-specialist: {input}`
- Description: Use backend specialist for API tasks

**Frontend Development:**
- Name: `Frontend Development`
- Command: `@frontend-nexusvpn-specialist: {input}`
- Description: Use frontend specialist for UI tasks

**Version Check:**
- Name: `Check Dependencies`
- Command: `@version-management-nexusvpn: Check for outdated packages in {input}`
- Description: Check for outdated packages

**Compatibility Check:**
- Name: `Check Compatibility`
- Command: `@compatibility-checking-nexusvpn: Verify compatibility for {input}`
- Description: Check dependency compatibility

## Troubleshooting

### Issue: Agents Not Loading

**Solution:**
- Verify all rule files are added correctly
- Check file paths are relative to project root
- Restart Cursor IDE
- Check Cursor logs for errors

### Issue: MCP Servers Not Connecting

**Solution:**
- Verify `.env.mcp` exists and has correct API keys
- Check `mcp-config.json` syntax is valid JSON
- Verify Node.js is installed and in PATH
- Check Cursor MCP server logs

### Issue: Documentation Not Accessible

**Solution:**
- Verify documentation files exist
- Check file paths in rules are correct
- Ensure files are not in .gitignore
- Try absolute paths if relative paths don't work

## Best Practices

1. **Keep Rules Updated**: Update rules files when project structure changes
2. **Regular Testing**: Test agent and MCP functionality regularly
3. **Document Changes**: Document any custom configurations
4. **Version Control**: Commit rule files to version control
5. **Team Sync**: Share rule configurations with team

## Quick Reference

### Essential Files to Add

**Minimum Required:**
1. `.cursorrules`
2. `agents/AGENTS.md`
3. `agents/AGENT_POLICY.md`
4. `agents/SPEC.md`
5. `agents/TODO.md`

**Recommended:**
- All specialist agent files
- Documentation index
- MCP setup guides
- Version management guide

### MCP Servers Available

1. **Supabase MCP** - Database operations
2. **Render MCP** - Deployment operations
3. **Firecrawl MCP** - Web scraping
4. **GitHub MCP** - Repository operations
5. **Figma MCP** - Design file access

---

**Last Updated:** 17-12-2025 | Time: 13:30:13
