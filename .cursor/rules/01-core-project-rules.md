# Core Project Rules

**Document ID:** CURSOR-RULES-001  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## Project Structure

This is a monorepo with the following structure:
- **frontend/** - React + Vite application
- **backend/** - NestJS API server
- **mobile/** - React Native + Expo app
- **infrastructure/** - Deployment scripts and configs
- **mcp-servers/** - MCP server implementations
- **agents/** - AI agent configurations
- **--DOCUMENTATIONS--/** - All project documentation

## Development Rules

1. **All changes must be additive** - No breaking changes
2. **Follow NestJS best practices** - Use decorators, DTOs, interceptors
3. **Update documentation** - Keep all docs in @--DOCUMENTATIONS--/ folder
4. **Use proper file references** - Format: @filename.md (line-range)
5. **Serialize files** - Use numbered prefixes (01-, 02-, etc.)
6. **Include timestamps** - Format: DD-MM-YYYY | Time: HH:mm:ss

## Code Quality Standards

- **TypeScript Strict Mode** - All code must pass strict type checking
- **Error Handling** - Always implement proper error handling and logging
- **Security First** - Never commit secrets, use environment variables
- **Backward Compatible** - All changes must be additive, no breaking changes
- **Documentation** - Code must be self-documenting with clear comments

## File Organization

- **Code Files** - Keep in appropriate directories (frontend/, backend/, mobile/)
- **Documentation** - All docs in @--DOCUMENTATIONS--/ with proper serialization
- **Scripts** - Infrastructure scripts in infrastructure/ or mcp-scripts/
- **Configuration** - Environment templates in @--DOCUMENTATIONS--/10-Configuration/

## Reference Files

- Main Rules: `.cursorrules`
- Agent Policy: `@agents/AGENT_POLICY.md`
- Execution Spec: `@agents/SPEC.md`
- Task Tracking: `@agents/TODO.md`

