# Agent Rules and Configuration

**Document ID:** CURSOR-RULES-002  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## Active Agent

**Current Agent:** Backend Specialist Agent (`backend-nexusvpn-specialist`)

## Agent Files to Follow

**Core Agent Files:**
- `@agents/AGENTS.md` - Agent roles and responsibilities
- `@agents/AGENT_POLICY.md` - Agent autonomy and execution rules
- `@agents/SPEC.md` - Execution spec (additive changes only)
- `@agents/TODO.md` - Task tracking and priorities
- `@agents/ROADMAP.md` - Project roadmap
- `@agents/PHASES.md` - Development phases
- `@agents/README.md` - Agent registry overview

**Specialist Agents:**
- `@agents/specialists/backend.agent.md` - Backend specialist configuration
- `@agents/specialists/frontend.agent.md` - Frontend specialist configuration
- `@agents/specialists/architecture.agent.md` - Architecture specialist configuration

**Agent Loader:**
- `@agents/loader/agent.auto-loader.md` - Agent auto-discovery logic

## Agent Execution Protocol

All AI agents MUST:
1. **Load Context:** Read `@agents/TODO.md` and `@agents/PHASES.md` before acting
2. **Decide:** Make the best technical decision based on modern best practices
3. **Act:** Write code, run commands, and fix errors
4. **Verify:** Ensure the build passes and the feature works

## Agent Constraints

- **Never delete existing features** - Refactor or deprecate, but do not break
- **Silence equals approval** - If the user doesn't stop you, keep going
- **Execution continues indefinitely** - When one task is done, find the next one in `TODO.md`

## Agent Handover Protocol

When switching between agents:
1. **Read handover docs** - Check @--DOCUMENTATIONS--/02-Architecture/BACKEND/04-Handover/
2. **Update status** - Update relevant status documents
3. **Document changes** - Log all changes in @--DOCUMENTATIONS--/03-Logs/
4. **Update task tracker** - Mark tasks complete in @--DOCUMENTATIONS--/01-Planning/02-PL-Task_Tracker_17-12-2025_022243.md

