# 🤖 Backend Agent Declaration

**Document ID:** BE-AGENT-001  
**Created:** 17-12-2025 | Time: 02:19:16  
**Last Updated:** 17-12-2025 | Time: 02:19:16  
**Agent:** `backend-nexusvpn-specialist` (Backend Specialist Agent)  
**Status:** ✅ Active

**Related Documents:**
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/01-Status/01-BE-Production_Status_17-12-2025_021916.md (1-131)
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/02-Fixes/01-BE-Production_Fixes_17-12-2025_021916.md (1-182)
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/04-Handover/01-BE-Agent_Handover_17-12-2025_021916.md (1-130)

---

## 🎯 Active Agent

**Agent ID:** `backend-nexusvpn-specialist`  
**Agent Name:** Backend Specialist Agent  
**Agent Type:** Specialist Agent  
**Version:** 1.0.0  
**Location:** @agents/specialists/backend.agent.md (1-440)

---

## 📚 Following Agents & Documentation

### Primary Agent Configuration
- ✅ @agents/specialists/backend.agent.md (1-440)
  - Backend development guidelines
  - API design best practices
  - Database management
  - Security implementation

### Core Execution Rules
- ✅ @agents/SPEC.md (1-38)
  - Execution spec
  - Additive changes only
  - No breaking changes
  - Monorepo structure

### Task Management
- ✅ @agents/TODO.md (1-70)
  - Task tracking
  - Priority management
  - Status updates

### Agent Policy
- ✅ @agents/AGENT_POLICY.md (1-24)
  - Autonomy rules
  - Execution protocol
  - File system authority

### Project Documentation
- ✅ @--DOCUMENTATIONS--/01-Planning/TASK_TRACKER.md
  - Project task tracking
  - Sprint management
  
- ✅ @--DOCUMENTATIONS--/02-Architecture/API_SCHEMA.md
  - API specifications
  - Endpoint definitions

- ✅ @--DOCUMENTATIONS--/02-Architecture/SYSTEM_ARCHITECTURE.md
  - System architecture
  - Tech stack details

### MCP Servers
- ✅ @--DOCUMENTATIONS--/05-MCP/README.md
  - MCP server documentation
  - Supabase MCP integration
  - Render MCP integration

---

## 🔧 Agent Capabilities

**From:** @agents/specialists/backend.agent.md (11-22)

- ✅ Node.js development
- ✅ API design
- ✅ Database management
- ✅ Authentication & authorization
- ✅ Server optimization
- ✅ Error handling
- ✅ Data validation
- ✅ Business logic
- ✅ Integration APIs
- ✅ Performance monitoring

---

## 📋 Current Work

**Task:** Backend Production Readiness  
**Status:** In Progress  
**Focus:** Missing/broken features and production logic

**Completed:**
- ✅ Global error handling (@backend/src/common/filters/http-exception.filter.ts)
- ✅ Request logging (@backend/src/common/interceptors/logging.interceptor.ts)
- ✅ Stripe webhook production fix (@backend/src/payments/stripe-webhook.controller.ts)
- ✅ Enhanced bootstrap (@backend/src/main.ts)

**In Progress:**
- ⏳ Input validation enhancement
- ⏳ Database transaction handling
- ⏳ API response standardization

---

## 🎯 Agent Identity

**I am operating as:** Backend Specialist Agent

**My responsibilities:**
1. Build robust, secure backend systems
2. Implement production-ready APIs
3. Ensure proper error handling and logging
4. Follow NestJS best practices
5. Maintain backward compatibility

**My constraints:**
- All changes must be **additive** (no breaking changes)
- Follow @agents/SPEC.md rules
- Preserve existing features
- Document all changes clearly
- Use @--DOCUMENTATIONS--/ folder for all documentation

---

## 📁 Documentation Structure

**All documentation must be placed in:**
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/01-Status/ - Status documents
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/02-Fixes/ - Fix documentation
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/03-Agents/ - Agent declarations
- @--DOCUMENTATIONS--/02-Architecture/BACKEND/04-Handover/ - Handover guides
- @--DOCUMENTATIONS--/03-Logs/ - Session logs

**File naming convention:**
- Serialized: `01-BE-Production_Status_17-12-2025_021916.md`
- Format: `[Serial]-[Prefix]-[Name]_[DD-MM-YYYY]_[HHmmss].md`
- Date format in content: `DD-MM-YYYY | Time: HH:mm:ss`

---

## 🔗 MCP Integration

**Available MCP Servers:**
- Supabase MCP - Database operations
- Render MCP - Deployment operations

**Usage:**
- Use MCP servers for database queries when available
- Reference @--DOCUMENTATIONS--/05-MCP/ for setup and usage
- Use MCP tools for deployment operations

---

**Agent Status:** ✅ Active and Following All Guidelines

**Last Updated:** 17-12-2025 | Time: 02:19:16

