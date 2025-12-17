# Documentation Rules

**Document ID:** CURSOR-RULES-004  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## Documentation Structure

**All documentation must be in @--DOCUMENTATIONS--/ folder:**
- @--DOCUMENTATIONS--/01-Planning/ - Planning and task tracking
- @--DOCUMENTATIONS--/02-Architecture/ - Architecture documentation
- @--DOCUMENTATIONS--/03-Logs/ - Session logs and development history
- @--DOCUMENTATIONS--/04-Guides/ - Deployment and setup guides
- @--DOCUMENTATIONS--/05-MCP/ - MCP server documentation

## File Naming Convention

**Format:** `[Serial]-[Prefix]-[Name]_[DD-MM-YYYY]_[HHmmss].md`

**Example:** `01-BE-Production_Status_17-12-2025_021916.md`

**Date Format:**
- Filename: `DD-MM-YYYY_HHmmss` (e.g., `17-12-2025_021916`)
- Content: `DD-MM-YYYY | Time: HH:mm:ss` (e.g., `17-12-2025 | Time: 02:19:16`)

## Document Format

Every documentation file must include:
- Document ID (e.g., BE-STATUS-001)
- Created/Last Updated with proper date format
- Agent declaration
- Related documents with @filename.md (line-range) format

## Prefixes

- `PL-` = Planning
- `AR-` = Architecture
- `BE-` = Backend
- `FE-` = Frontend
- `MOB-` = Mobile
- `DEP-` = Deployment
- `GD-` = Guides
- `LG-` = Logs
- `MCP-` = MCP Integration
- `STAT-` = Status
- `FIX-` = Fixes
- `SET-` = Setup
- `CFG-` = Configuration

## Key Documentation Files

**Master Index:**
- `@--DOCUMENTATIONS--/00-INDEX-Documentation_Structure_17-12-2025_022243.md`

**Planning:**
- `@--DOCUMENTATIONS--/01-Planning/01-PL-Master_Plan_17-12-2025_022243.md`
- `@--DOCUMENTATIONS--/01-Planning/02-PL-Task_Tracker_17-12-2025_022243.md`

**Architecture:**
- `@--DOCUMENTATIONS--/02-Architecture/01-AR-API_Schema_17-12-2025_022243.md`
- `@--DOCUMENTATIONS--/02-Architecture/02-AR-System_Architecture_17-12-2025_022243.md`

**Backend Documentation:**
- `@--DOCUMENTATIONS--/02-Architecture/BACKEND/01-Status/` - Status documents
- `@--DOCUMENTATIONS--/02-Architecture/BACKEND/02-Fixes/` - Fix documentation
- `@--DOCUMENTATIONS--/02-Architecture/BACKEND/03-Agents/` - Agent declarations
- `@--DOCUMENTATIONS--/02-Architecture/BACKEND/04-Handover/` - Handover guides

## Documentation Commands

### Create New Documentation
```
Format: [Serial]-[Prefix]-[Name]_[DD-MM-YYYY]_[HHmmss].md
Example: 01-BE-Production_Status_17-12-2025_021916.md
Location: @--DOCUMENTATIONS--/[Category]/
```

### Update Existing Documentation
- Always include "Last Updated" timestamp
- Add related document references
- Declare active agent
- Update status if applicable

### Reference Documentation
- Use format: `@filename.md (line-range)`
- Always include line numbers for precision
- Cross-reference related documents

