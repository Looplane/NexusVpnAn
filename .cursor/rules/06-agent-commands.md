# Agent Commands

**Document ID:** CURSOR-RULES-006  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## Quick Agent Commands

### Backend Development
```
@backend-nexusvpn-specialist: [Your task]
CONTEXT: [Background information]
PRIORITY: [Speed/Quality/Security]
OUTPUT: [Expected result]
```

### Frontend Development
```
@frontend-nexusvpn-specialist: [Your task]
CONTEXT: [Background information]
PRIORITY: [Speed/Quality/Security]
OUTPUT: [Expected result]
```

### Architecture Planning
```
@architecture-nexusvpn-specialist: [Your task]
CONTEXT: [Background information]
PRIORITY: [Speed/Quality/Security]
OUTPUT: [Expected result]
```

### Deployment
```
@Universal-Orchestrator: Deploy to [platform]
CONTEXT: [Deployment requirements]
PRIORITY: [Speed/Quality/Security]
OUTPUT: [Expected result]
```

## MCP Commands

### MCP Database Query
```
Use MCP Supabase tool: query_database
QUERY: [Your SQL query]
CONTEXT: [What you need to know]
```

### MCP Deployment
```
Use MCP Render tool: trigger_deploy
SERVICE: [Service name]
CONTEXT: [Deployment requirements]
```

## Agent Selection Guide

| Task Type | Recommended Agent | Command Format |
|-----------|------------------|----------------|
| API Development | `@backend-nexusvpn-specialist` | `@backend-nexusvpn-specialist: Create [endpoint]` |
| UI Components | `@frontend-nexusvpn-specialist` | `@frontend-nexusvpn-specialist: Build [component]` |
| System Design | `@architecture-nexusvpn-specialist` | `@architecture-nexusvpn-specialist: Design [system]` |
| Database Operations | Use MCP Supabase tools | `query_database`, `get_table_info` |
| Deployment | Use MCP Render tools | `trigger_deploy`, `update_env_vars` |
| Complex Tasks | `@Universal-Orchestrator` | `@Universal-Orchestrator: [Complex task]` |

## Priority Options

- `Speed` = Build it fast
- `Quality` = Build it right
- `Security` = Make it hack-proof
- `Learning` = Teach me while building

