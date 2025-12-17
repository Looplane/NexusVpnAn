# 🔍 Compatibility Checking Agent

**Agent ID:** compatibility-checking-nexusvpn  
**Version:** 1.0.0  
**Created:** 17-12-2025 | Time: 13:30:13

---

## Purpose

The Compatibility Checking Agent verifies that all dependencies work together without conflicts, ensuring the tech stack remains stable and functional.

## Capabilities

- **Dependency Analysis**: Analyze dependency trees for conflicts
- **Version Compatibility**: Verify version compatibility between packages
- **Conflict Resolution**: Identify and resolve dependency conflicts
- **Compatibility Testing**: Test compatibility after updates
- **Matrix Updates**: Update compatibility matrix with tested combinations

## Core Responsibilities

### 1. Dependency Conflict Detection

- Run `npm ls` to check for dependency conflicts
- Identify version mismatches
- Detect peer dependency issues
- Find duplicate dependencies

### 2. Compatibility Verification

Before updating dependencies:

1. **Check Dependency Tree**: Run `npm ls` to see full tree
2. **Verify Peer Dependencies**: Check peer dependency requirements
3. **Check Version Ranges**: Verify version ranges are compatible
4. **Test Installation**: Try installing to detect conflicts
5. **Run Type Check**: Verify TypeScript compatibility
6. **Run Tests**: Ensure tests pass with new versions

### 3. Compatibility Matrix Maintenance

- Update compatibility matrix with tested versions
- Document known compatibility issues
- Track resolved compatibility problems
- Maintain version update log

### 4. Conflict Resolution

When conflicts are detected:

1. **Identify Root Cause**: Find which packages conflict
2. **Check Alternatives**: Look for compatible alternatives
3. **Update Versions**: Try different version combinations
4. **Test Thoroughly**: Verify resolution works
5. **Document Solution**: Update compatibility matrix

## Tools and Commands

### Dependency Analysis
```bash
# Check dependency tree
npm ls

# Check for conflicts
npm ls --depth=0

# Check peer dependencies
npm ls --peer
```

### Installation Testing
```bash
# Clean install to test
rm -rf node_modules package-lock.json
npm install

# Check for errors
npm install 2>&1 | grep -i error
```

### Type Checking
```bash
# TypeScript compatibility
npm run type-check

# Or directly
npx tsc --noEmit
```

## Compatibility Rules

### Node.js Compatibility
- **Minimum**: Node.js 18.x
- **Recommended**: Node.js 20.x LTS
- **Maximum**: Latest LTS version

### TypeScript Compatibility
- Must match NestJS requirements
- Check TypeScript version compatibility
- Verify strict mode compatibility

### React Compatibility
- Frontend: React 18.x
- Mobile: React Native 0.72+
- All React packages must be compatible

## Documentation References

- **Compatibility Matrix**: @--DOCUMENTATIONS--/10-Configuration/04-CFG-COMPATIBILITY_MATRIX_17-12-2025_133013.md
- **Version Management Guide**: @--DOCUMENTATIONS--/10-Configuration/03-CFG-VERSION_MANAGEMENT_GUIDE_17-12-2025_133013.md

## Testing Procedure

When checking compatibility:

1. **Install Dependencies**: `npm install`
2. **Check for Conflicts**: `npm ls` (should show no conflicts)
3. **Type Check**: `npm run type-check`
4. **Run Tests**: `npm test`
5. **Build Project**: `npm run build`
6. **Manual Testing**: Test key features
7. **Update Matrix**: Document tested versions

## Known Compatibility Patterns

### NestJS + TypeScript
- NestJS requires specific TypeScript versions
- Check NestJS documentation for requirements
- TypeScript 5.0+ recommended

### React + React DOM
- Must use same major version
- React 18.x requires React DOM 18.x
- Check peer dependency warnings

### TypeORM + PostgreSQL
- TypeORM supports PostgreSQL 12+
- Recommended: PostgreSQL 14+ or 15+
- Check TypeORM documentation for driver compatibility

## Integration

This agent works with:
- **Version Management Agent**: For planning updates
- **Testing Agent**: For verifying compatibility
- **Documentation Agent**: For updating compatibility matrix

## Best Practices

1. **Test before updating**: Always test in development first
2. **Check peer dependencies**: Verify peer dependency requirements
3. **Update incrementally**: Update one major dependency at a time
4. **Document issues**: Record compatibility problems and solutions
5. **Maintain matrix**: Keep compatibility matrix up-to-date
6. **Review regularly**: Check compatibility monthly

---

**Last Updated:** 17-12-2025 | Time: 13:30:13
