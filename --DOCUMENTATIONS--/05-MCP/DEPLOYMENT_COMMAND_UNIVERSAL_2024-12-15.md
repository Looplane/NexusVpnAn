# 🎯 Universal-Orchestrator Deployment Command
**Timestamp**: 2024-12-15 14:40 UTC  
**Agent**: Universal-Orchestrator  
**Target**: Render Deployment  
**File**: DEPLOYMENT_COMMAND_UNIVERSAL_2024-12-15.md

## 📋 Deployment Command for Universal-Orchestrator

```markdown
@Universal-Orchestrator: Deploy NexusVPN backend to Render production
CONTEXT: I need to deploy my complete VPN backend application to Render with working Supabase database connection. Current status: MCP servers running, backend configured for DATABASE_URL, Supabase IPv6 setup complete.

TECH STACK:
- Backend: NestJS, TypeScript, TypeORM
- Database: PostgreSQL on Supabase (IPv6)
- Deployment: Render web service
- Authentication: JWT tokens
- API: RESTful with Swagger

CURRENT CONFIGURATION:
- Backend: /backend folder with NestJS app
- Database URL: postgresql://postgres:NexusVPN02110@db.xorjbccyuinebimlxblu.supabase.co:5432/postgres
- JWT Secret: dev_secret_key_123 (needs updating)
- Frontend URL: http://localhost:5173 (needs production URL)

MCP SERVERS STATUS:
- Supabase MCP: Running (PID 8916)
- Render MCP: Running (PID 28260)
- API Keys: Configured in .env.mcp

PRIORITY ORDER:
1. Create Render web service
2. Configure production environment variables
3. Deploy and build application
4. Test database connectivity
5. Verify API endpoints
6. Ensure service health

EXPECTED OUTPUT:
- Live backend API on Render
- Working database connection to Supabase
- All API endpoints functional
- Health checks passing
- Production-ready deployment

VALIDATION REQUIREMENTS:
- Database connection test successful
- /health endpoint responding
- Authentication working
- No critical errors in logs
- Service stable for 5+ minutes
```

## 🔧 Agent Execution Plan

### **Phase 1: Service Creation (5 minutes)**
1. **Render Service Setup**
   - Use Render MCP to create web service
   - Configure GitHub repository connection
   - Set build and start commands

2. **Environment Configuration**
   - Generate secure JWT secret
   - Configure production database URL
   - Set NODE_ENV=production
   - Configure CORS for production frontend

### **Phase 2: Deployment (10 minutes)**
1. **Build Process**
   - Trigger deployment via Render MCP
   - Monitor build logs
   - Handle any build errors

2. **Service Launch**
   - Wait for service to start
   - Verify port configuration
   - Check service health

### **Phase 3: Testing (5 minutes)**
1. **Database Tests**
   - Use Supabase MCP to test connection
   - Verify table creation
   - Test basic queries

2. **API Tests**
   - Test /health endpoint
   - Verify authentication endpoints
   - Check core API functionality

3. **Integration Tests**
   - Test complete user flows
   - Verify VPN server management
   - Check payment processing

## 📊 Deployment Configuration

### **Production Environment Variables**
```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:NexusVPN02110@db.xorjbccyuinebimlxblu.supabase.co:5432/postgres

# Security
JWT_SECRET=[GENERATED_SECURE_KEY]
NODE_ENV=production

# Service Configuration
PORT=10000
FRONTEND_URL=[PRODUCTION_FRONTEND_URL]

# Optional Additions
CORS_ORIGIN=[FRONTEND_DOMAIN]
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### **Build & Start Commands**
```json
{
  "buildCommand": "cd backend && npm install && npm run build",
  "startCommand": "cd backend && npm run start:prod",
  "nodeVersion": "18.x"
}
```

## 🎯 Success Criteria

### **Immediate Success (Within 15 minutes)**
- [ ] Render service created and running
- [ ] Database connection established
- [ ] /health endpoint responding (200 OK)
- [ ] No critical errors in logs

### **Full Success (Within 30 minutes)**
- [ ] All API endpoints functional
- [ ] Authentication system working
- [ ] VPN server management operational
- [ ] Payment processing verified
- [ ] Service stable for 10+ minutes

## 🚨 Error Handling

### **If Database Connection Fails**
1. **Check Supabase Status** - Use Supabase MCP `test_connection`
2. **Verify IPv6 Configuration** - Ensure no IPv4 forcing
3. **Test Connection String** - Validate DATABASE_URL format
4. **Check SSL Settings** - Ensure proper SSL configuration

### **If Build Fails**
1. **Check Dependencies** - Verify all packages install correctly
2. **TypeScript Compilation** - Check for build errors
3. **Missing Environment Variables** - Ensure all required vars set
4. **Port Configuration** - Verify PORT 10000 for Render

### **If Service Won't Start**
1. **Check Logs** - Use Render MCP `get_service_logs`
2. **Memory Issues** - Monitor memory usage
3. **Database Connection** - Test connectivity
4. **Configuration Errors** - Validate environment setup

## 📈 Monitoring & Maintenance

### **Post-Deployment Monitoring**
- Service uptime tracking
- Database performance monitoring
- API response time tracking
- Error rate monitoring
- Memory and CPU usage

### **Regular Maintenance**
- Dependency updates
- Security patches
- Performance optimization
- Backup verification
- Log rotation

---

**Next Action**: Execute deployment command with Universal-Orchestrator agent  
**Estimated Duration**: 15-30 minutes  
**Agent**: Universal-Orchestrator (autonomous execution)