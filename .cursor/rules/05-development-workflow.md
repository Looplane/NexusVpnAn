# Development Workflow Rules

**Document ID:** CURSOR-RULES-005  
**Created:** 17-12-2025 | Time: 04:15:04  
**Last Updated:** 17-12-2025 | Time: 04:15:04

## Development Workflow

1. **Always check documentation first** - Read relevant docs in @--DOCUMENTATIONS--/ before starting
2. **Follow agent guidelines** - Consult @agents/ for agent-specific instructions
3. **Update documentation** - Document all changes in appropriate @--DOCUMENTATIONS--/ folders
4. **Use MCP servers** - Leverage MCP tools for database and deployment operations when available
5. **Test before committing** - Ensure code builds and tests pass

## Environment Management

- **Local Development** - Use `.env` files (not committed)
- **Production** - Use platform environment variables (Render, Vercel, Supabase)
- **MCP Servers** - Use `.env.mcp` for MCP server configuration
- **Templates** - Reference @--DOCUMENTATIONS--/10-Configuration/ for env templates

## Deployment Strategy

- **Database** - Supabase (PostgreSQL) for cloud, local PostgreSQL for dev
- **Backend** - Render (auto-detects render.yaml)
- **Frontend** - Vercel (uses vercel.json)
- **Mobile** - Expo EAS Build for APK/IPA generation

## Testing Requirements

- **Backend** - All API endpoints must be tested
- **Frontend** - UI components should be tested
- **Integration** - End-to-end flows must be verified
- **Documentation** - All features must be documented

## Security Rules

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Use DTOs and validation decorators
3. **Sanitize user data** - Prevent XSS and injection attacks
4. **Use HTTPS** - Always in production
5. **Rate limiting** - Implement for API endpoints
6. **CORS configuration** - Restrict to known origins
7. **JWT security** - Use strong secrets, proper expiration

## Performance Rules

1. **Database queries** - Use indexes, avoid N+1 queries
2. **API responses** - Implement pagination for large datasets
3. **Caching** - Use Redis or in-memory cache where appropriate
4. **Code splitting** - Lazy load components in frontend
5. **Asset optimization** - Compress images, minify code

## Error Handling Rules

1. **Global exception filter** - Catch all unhandled errors
2. **Logging** - Log all errors with context
3. **User-friendly messages** - Don't expose technical details to users
4. **Error recovery** - Implement retry logic where appropriate
5. **Monitoring** - Track errors in production

## Code Style Rules

1. **TypeScript** - Use strict mode, avoid `any`
2. **Naming** - Use descriptive names, follow conventions
3. **Comments** - Document complex logic, not obvious code
4. **Formatting** - Use Prettier/ESLint configuration
5. **Imports** - Organize imports (external, internal, relative)

## Git Workflow Rules

1. **Branch naming** - Use descriptive branch names
2. **Commit messages** - Clear, descriptive commit messages
3. **Pull requests** - Include description and testing notes
4. **Code review** - Review before merging
5. **Documentation** - Update docs with code changes

