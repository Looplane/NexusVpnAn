# 🪟 Windows Server 2019 PostgreSQL - Complete Deployment Package

## 🎯 What You Need to Do

Since your Windows Server 2019 PostgreSQL at `91.99.23.239:5432` is not accepting connections, you need to run the fix script on your server first.

## 📋 Immediate Action Required

### Step 1: Run Fix Script on Your Windows Server 2019

**On your Windows Server 2019**, download and run the PowerShell fix script:

```powershell
# Download the fix script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/nexusvpn/main/mcp-scripts/fix-windows-server-2019-postgres.ps1" -OutFile "fix-windows-postgres.ps1"

# Run as Administrator
powershell -ExecutionPolicy Bypass -File "fix-windows-postgres.ps1"
```

### Step 2: Manual Configuration (Alternative)

If the script doesn't work, manually configure your server:

#### Configure PostgreSQL (postgresql.conf):
```conf
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
```

#### Configure Authentication (pg_hba.conf):
```conf
# Add these lines
host    nexusvpn        postgres        0.0.0.0/0               md5
host    all             all             0.0.0.0/0               md5
```

#### Windows Firewall:
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "PostgreSQL-5432-NexusVPN" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow
```

#### Restart PostgreSQL:
```powershell
Restart-Service -Name "postgresql-x64-14" -Force
```

## 🚀 Deployment Files Created for You

### 1. Configuration Files
- ✅ `your-postgres-config.service.ts` - PostgreSQL configuration for your server
- ✅ `test-your-postgres-connection.js` - Connection testing script
- ✅ `.env.your-postgres` - Environment variables template

### 2. Documentation
- ✅ `WINDOWS_SERVER_2019_POSTGRESQL_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- ✅ `WINDOWS_SERVER_2019_POSTGRESQL_FIX.md` - Troubleshooting guide
- ✅ `MCP_AGENT_CONFIG.md` - MCP integration configuration

### 3. Scripts
- ✅ `fix-windows-server-2019-postgres.ps1` - PowerShell fix script for your server
- ✅ `setup-windows-server-2019-postgres.sh` - Bash setup script
- ✅ `deploy-render-with-windows-postgres.sh` - Complete deployment script

## 🔧 After You Fix Your Server

Once your PostgreSQL server is accepting connections, run:

```bash
cd g:\VPN-PROJECT-2025\nexusvpn\backend
node test-your-postgres-connection.js
```

Expected output:
```
🧪 Testing connection to your PostgreSQL server...
✅ Connection successful!
🗄️ PostgreSQL version: PostgreSQL 14.x ...
📊 Database: nexusvpn
👤 User: postgres
🔒 SSL: Disabled
```

## 🎯 Deploy to Render

After connection test passes, deploy to Render:

### Option 1: Using Deployment Script
```bash
cd g:\VPN-PROJECT-2025\nexusvpn
./mcp-scripts/deploy-render-with-windows-postgres.sh
```

### Option 2: Manual Deployment
1. Go to Render dashboard
2. Add these environment variables:
   ```
   USE_YOUR_POSTGRES=true
   YOUR_DB_HOST=91.99.23.239
   YOUR_DB_PORT=5432
   YOUR_DB_USER=postgres
   YOUR_DB_PASSWORD=your_password
   YOUR_DB_NAME=nexusvpn
   ```
3. Trigger deployment

### Option 3: Using MCP Render Server
```bash
# Update environment variables
node mcp-servers/render-mcp/update_env_vars.js \
  --service-id your-service-id \
  --env-vars "USE_YOUR_POSTGRES=true,YOUR_DB_HOST=91.99.23.239,YOUR_DB_PORT=5432,YOUR_DB_USER=postgres,YOUR_DB_PASSWORD=your_password,YOUR_DB_NAME=nexusvpn"

# Trigger deployment
node mcp-servers/render-mcp/trigger_deploy.js \
  --service-id your-service-id
```

## 📁 File Structure Created

```
g:\VPN-PROJECT-2025\nexusvpn\
├── backend\
│   ├── src\database\
│   │   └── your-postgres-config.service.ts ✅
│   └── test-your-postgres-connection.js ✅
├── --DOCUMENTATIONS--\05-MCP\
│   ├── WINDOWS_SERVER_2019_POSTGRESQL_DEPLOYMENT_GUIDE.md ✅
│   ├── WINDOWS_SERVER_2019_POSTGRESQL_FIX.md ✅
│   └── FIRECRAWL_INTEGRATION.md ✅
├── agents\
│   └── MCP_AGENT_CONFIG.md ✅
└── mcp-scripts\
    ├── fix-windows-server-2019-postgres.ps1 ✅
    ├── setup-windows-server-2019-postgres.sh ✅
    └── deploy-render-with-windows-postgres.sh ✅
```

## 🔍 Verification Checklist

After running the fix script on your server:

- [ ] PostgreSQL service is running
- [ ] Windows Firewall allows port 5432
- [ ] postgresql.conf has `listen_addresses = '*'`
- [ ] pg_hba.conf allows remote connections
- [ ] Database `nexusvpn` exists
- [ ] User `postgres` can connect remotely
- [ ] Connection test from local machine passes

## 🚨 Common Issues

1. **Service not running**: Check Windows Services
2. **Firewall blocking**: Ensure rule allows port 5432
3. **PostgreSQL not listening**: Check `listen_addresses` setting
4. **Authentication failed**: Check `pg_hba.conf` configuration
5. **Database doesn't exist**: Create `nexusvpn` database

## 📞 Support

If you need help:

1. **Run the PowerShell script** on your Windows Server 2019 first
2. **Test connection** using the provided test script
3. **Check logs** on your server for specific errors
4. **Follow the troubleshooting guide** in `WINDOWS_SERVER_2019_POSTGRESQL_FIX.md`

---

**Next Step**: Run the PowerShell fix script on your Windows Server 2019, then test the connection again!