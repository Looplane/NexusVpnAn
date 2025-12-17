# Version Management Guide

**Document ID:** CFG-VERSION-001  
**Created:** 17-12-2025 | Time: 13:30:13  
**Last Updated:** 17-12-2025 | Time: 13:30:13

**Related Documents:**
- @--DOCUMENTATIONS--/10-Configuration/01-CFG-Env_Template_17-12-2025_022800.md (1-50)
- @--DOCUMENTATIONS--/10-Configuration/02-CFG-Env_Template_Simple_17-12-2025_032824.md (1-50)
- @--DOCUMENTATIONS--/10-Configuration/04-CFG-COMPATIBILITY_MATRIX_17-12-2025_133013.md (1-100)

---

## Overview

This guide outlines the version management strategy for the NexusVPN project. All tools, libraries, and dependencies should be kept up-to-date with the latest stable versions while ensuring compatibility across the entire tech stack.

## Core Principles

### 1. Always Use Latest Stable Versions

- **Check for updates regularly**: Use `npm outdated` or `yarn outdated`
- **Prefer stable releases**: Avoid beta/alpha versions in production
- **Monitor security advisories**: Use `npm audit` regularly
- **Follow semantic versioning**: Understand breaking vs non-breaking changes

### 2. Read Official Documentation

Before implementing any feature or updating any package:

1. **Read the official documentation** for the latest version
2. **Check migration guides** if upgrading major versions
3. **Review changelogs** for breaking changes
4. **Test in development** before deploying to production

### 3. Compatibility Checking

Before updating any package:

1. **Check latest stable version** from official source (npm, GitHub)
2. **Review breaking changes** in changelog
3. **Verify compatibility** with other dependencies
4. **Check migration guides** if available
5. **Test in development environment** first

### 4. Dependency Management

- **Use dependency management tools**: npm audit, Dependabot, Renovate
- **Automate updates**: Configure Dependabot for automated PRs
- **Review updates**: Don't auto-merge without review
- **Test thoroughly**: Run full test suite after updates

## Tech Stack Documentation References

Always refer to official documentation when working with these technologies:

### Backend
- **NestJS**: https://docs.nestjs.com
  - Latest version: Check npm for current stable
  - Migration guides: https://docs.nestjs.com/migration-guide
- **TypeScript**: https://www.typescriptlang.org/docs
  - Latest version: Check npm for current stable
  - Release notes: https://devblogs.microsoft.com/typescript/
- **PostgreSQL**: https://www.postgresql.org/docs
  - Latest version: Check official PostgreSQL site
  - Release notes: https://www.postgresql.org/docs/current/release.html

### Frontend
- **React**: https://react.dev
  - Latest version: Check npm for current stable
  - Migration guides: https://react.dev/learn/upgrading
- **Vite**: https://vitejs.dev
  - Latest version: Check npm for current stable
  - Migration guide: https://vitejs.dev/guide/migration.html

### Mobile
- **React Native**: https://reactnative.dev
  - Latest version: Check npm for current stable
  - Upgrade helper: https://react-native-community.github.io/upgrade-helper/
- **Expo**: https://docs.expo.dev
  - Latest version: Check npm for current stable
  - Upgrade guide: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/

### Infrastructure
- **WireGuard**: https://www.wireguard.com
  - Latest version: Check official WireGuard site
  - Installation: https://www.wireguard.com/install/

### MCP Servers
- **MCP Protocol**: Reference `agents/_standards/anthropic-mcp.md`
- **GitHub MCP**: https://www.npmjs.com/package/@modelcontextprotocol/server-github
- **Figma MCP**: https://www.npmjs.com/package/figma-developer-mcp (use 0.6.3+)

## Update Process

### Step 1: Check Current Versions

```bash
# Check outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Check specific package version
npm view <package-name> version
```

### Step 2: Review Changes

1. **Read changelog**: Check what's new and what's breaking
2. **Review migration guide**: If major version update
3. **Check compatibility**: Verify with other dependencies
4. **Review security**: Check for security fixes

### Step 3: Update Dependencies

```bash
# Update to latest patch version (safe)
npm update

# Update to latest minor version (usually safe)
npm update <package-name>@latest

# Update to latest major version (may have breaking changes)
npm install <package-name>@latest
```

### Step 4: Test Compatibility

1. **Run tests**: `npm test`
2. **Check TypeScript**: `npm run type-check`
3. **Build project**: `npm run build`
4. **Test manually**: Run the application and test key features

### Step 5: Document Changes

1. **Update package.json**: Versions are automatically updated
2. **Update compatibility matrix**: Document tested version combinations
3. **Update changelog**: Note any breaking changes or new features
4. **Commit changes**: With clear commit message

## Compatibility Matrix

See @--DOCUMENTATIONS--/10-Configuration/04-CFG-COMPATIBILITY_MATRIX_17-12-2025_133013.md for tested version combinations.

## Automated Updates

### Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    
  - package-ecosystem: "npm"
    directory: "/mobile"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### Renovate Configuration

Alternatively, use Renovate for more advanced configuration:

```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}
```

## Security Updates

### Priority Updates

Security updates should be applied immediately:

1. **Check npm audit**: `npm audit`
2. **Fix vulnerabilities**: `npm audit fix`
3. **Review breaking changes**: Even security updates may have breaking changes
4. **Test thoroughly**: Security updates can affect functionality

### Critical Vulnerabilities

For critical vulnerabilities (CVSS 9.0+):

1. **Apply immediately**: Don't wait for scheduled updates
2. **Test in staging**: Before production deployment
3. **Monitor logs**: Watch for any issues after deployment
4. **Document fix**: Note the vulnerability and fix in changelog

## Version Pinning Strategy

### Production Dependencies

- **Pin exact versions**: Use `1.2.3` not `^1.2.3` or `~1.2.3`
- **Lock file**: Commit `package-lock.json` or `yarn.lock`
- **Regular updates**: Review and update regularly

### Development Dependencies

- **Allow minor updates**: Use `^1.2.3` for dev dependencies
- **Update frequently**: Dev dependencies can be updated more freely
- **Test compatibility**: Still test after updates

## Breaking Changes

### Handling Breaking Changes

1. **Read migration guide**: Official migration guides are essential
2. **Update incrementally**: Update one major dependency at a time
3. **Test thoroughly**: Run full test suite
4. **Update code**: Fix breaking changes in code
5. **Document changes**: Note breaking changes in changelog

### Rollback Plan

Always have a rollback plan:

1. **Git tags**: Tag releases for easy rollback
2. **Database migrations**: Ensure migrations are reversible
3. **Feature flags**: Use feature flags for gradual rollouts
4. **Monitoring**: Monitor for issues after deployment

## Best Practices

1. **Regular updates**: Check for updates weekly
2. **Security first**: Apply security updates immediately
3. **Test before deploy**: Always test in development first
4. **Document versions**: Keep compatibility matrix updated
5. **Review changes**: Don't auto-merge without review
6. **Monitor dependencies**: Use tools like Snyk or Dependabot
7. **Stay informed**: Follow official blogs and release notes

## Tools and Resources

### Version Checking
- `npm outdated` - Check for outdated packages
- `npm view <package> versions` - List all versions
- `npm view <package> version` - Latest version

### Security
- `npm audit` - Check for vulnerabilities
- `npm audit fix` - Fix vulnerabilities automatically
- Snyk: https://snyk.io
- Dependabot: Built into GitHub

### Documentation
- npm: https://www.npmjs.com
- Node.js: https://nodejs.org
- TypeScript: https://www.typescriptlang.org

---

**Last Updated:** 17-12-2025 | Time: 13:30:13
