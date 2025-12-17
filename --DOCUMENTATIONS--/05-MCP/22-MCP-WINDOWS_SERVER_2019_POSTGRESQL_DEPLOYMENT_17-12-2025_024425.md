# 🪟 Windows Server 2019 PostgreSQL Deployment Guide

This guide walks you through deploying NexusVPN backend on Render with your Windows Server 2019 PostgreSQL instance at `91.99.23.239:5432`.

## 📋 Prerequisites

### Your Windows Server 2019 Setup
- PostgreSQL installed and running on Windows Server 2019
- Server IP: `91.99.23.239:5432`
- PostgreSQL service configured for remote connections
- Windows Firewall configured to allow port 5432

### Required Information
- PostgreSQL username (usually `postgres`)
- PostgreSQL password (usually `postgres`)
- Database name (we'll use `nexusvpn9199`)

## 🔧 Step 1: Configure Windows Server 2019 PostgreSQL

### 1.1 Configure PostgreSQL for Remote Connections

On your Windows Server 2019, edit `postgresql.conf` (usually in `C:\Program Files\PostgreSQL\[version]\data\`):

```conf
# Listen on all interfaces
listen_addresses = '*'

# Connection settings for external access
max_connections = 100
shared_buffers = 128MB
```

### 1.2 Configure Authentication

Edit `pg_hba.conf` (in the same directory):

```conf
# IPv4 remote connections for NexusVPN
host    nexusvpn    postgres    0.0.0.0/0    md5
host    nexusvpn    postgres    ::/0         md5

# Allow Render IP ranges (you may need to update these)
host    nexusvpn    postgres    100.20.0.0/16    md5
host    nexusvpn    postgres    100.21.0.0/16    md5
```

### 1.3 Windows Firewall Configuration

Open PowerShell as Administrator and run:

```powershell
# Allow PostgreSQL port
New-NetFirewallRule -DisplayName "PostgreSQL-5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow

# Verify rule
Get-NetFirewallRule -DisplayName "PostgreSQL-5432"
```

### 1.4 Restart PostgreSQL Service

```powershell
# Restart PostgreSQL service
Restart-Service -Name "postgresql-x64-14" -Force

# Check service status
Get-Service -Name "postgresql-x64-14"
```

Note: Replace `postgresql-x64-14` with your actual PostgreSQL service name.

## 🔧 Step 2: Create Database and User

Connect to your PostgreSQL server and run:

```sql
-- Create nexusvpn database
CREATE DATABASE nexusvpn;

-- Create user (if needed)
CREATE USER nexusvpn_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn_user;
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO postgres;

-- Connect to nexusvpn database and create schema
\c nexusvpn;

-- Create schema (will be done automatically by TypeORM)
```

## 🔧 Step 3: Test Connection from Local Machine

### 3.1 Test Basic Connectivity

```powershell
# Test port connectivity
Test-NetConnection 91.99.23.239 -Port 5432

# Expected output:
# ComputerName     : 91.99.23.239
# RemoteAddress    : 91.99.23.239
# RemotePort       : 5432
# InterfaceAlias   : Ethernet
# SourceAddress    : [your-local-ip]
# TcpTestSucceeded : True
```

### 3.2 Test PostgreSQL Connection

Use the existing test script:

```bash
cd g:\VPN-PROJECT-2025\nexusvpn\backend
node test-your-postgres-connection.js
```

Expected output:
```
🧪 Testing connection to your PostgreSQL server...
✅ Connection successful!
🗄️  PostgreSQL version: PostgreSQL 14.x on x86_64-pc-linux-gnu...
📊 Database: nexusvpn
👤 User: postgres
🔒 SSL: Disabled
```

## 🔧 Step 4: Configure NexusVPN Backend

### 4.1 Environment Variables

Create or update `.env` file in `g:\VPN-PROJECT-2025\nexusvpn\backend`:

```env
# Your Windows Server 2019 PostgreSQL
YOUR_DB_HOST=91.99.23.239
YOUR_DB_PORT=5432
YOUR_DB_USER=postgres
YOUR_DB_PASSWORD=your_postgres_password
YOUR_DB_NAME=nexusvpn

# Enable your PostgreSQL server
USE_YOUR_POSTGRES=true

# Render will automatically set these
NODE_ENV=production
PORT=3000
```

### 4.2 Database Configuration

Your backend is already configured with `YourPostgresConfigService` which:
- Connects to `91.99.23.239:5432`
- Uses your PostgreSQL credentials
- Disables SSL (for Windows Server compatibility)
- Optimizes connection pooling for external servers

## 🔧 Step 5: Deploy to Render

### 5.1 Using MCP Render Server

The MCP Render server can help deploy with your PostgreSQL configuration:

```bash
# Set up environment variables in Render
cd g:\VPN-PROJECT-2025\nexusvpn
node mcp-servers\render-mcp\update-env-vars.js \
  --service-id your-render-service-id \
  --env-vars "USE_YOUR_POSTGRES=true,YOUR_DB_HOST=91.99.23.239,YOUR_DB_PORT=5432,YOUR_DB_USER=postgres,YOUR_DB_PASSWORD=your_password,YOUR_DB_NAME=nexusvpn"
```

### 5.2 Manual Render Configuration

1. Go to your Render dashboard
2. Select your NexusVPN backend service
3. Go to "Environment" tab
4. Add these environment variables:
   - `USE_YOUR_POSTGRES=true`
   - `YOUR_DB_HOST=91.99.23.239`
   - `YOUR_DB_PORT=5432`
   - `YOUR_DB_USER=postgres`
   - `YOUR_DB_PASSWORD=your_postgres_password`
   - `YOUR_DB_NAME=nexusvpn`

5. Click "Deploy" to trigger a new deployment

### 5.3 Using Deployment Script

Use the provided deployment script:

```bash
cd g:\VPN-PROJECT-2025\nexusvpn
./deploy-with-your-postgres-complete.sh
```

This script will:
- Test your PostgreSQL connection
- Update Render environment variables
- Trigger deployment
- Verify the deployment

## 🔧 Step 6: Verify Deployment

### 6.1 Check Render Logs

In your Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Look for PostgreSQL connection messages:
   ```
   🗄️ Connecting to your PostgreSQL server: {
     host: '91.99.23.239',
     port: 5432,
     database: 'nexusvpn',
     user: 'postgres',
     ssl: false
   }
   ```

### 6.2 Test API Endpoints

Once deployed, test your API:

```bash
# Test health endpoint
curl https://your-app.onrender.com/health

# Test database connection
curl https://your-app.onrender.com/api/health/database
```

## 🛠️ Troubleshooting

### Connection Issues

1. **Windows Firewall**: Ensure port 5432 is open
2. **PostgreSQL Service**: Check if service is running
3. **Authentication**: Verify pg_hba.conf settings
4. **Network**: Test from different locations

### Common Windows Server Issues

```powershell
# Check PostgreSQL service
Get-Service -Name "postgresql*"

# Check Windows Firewall
Get-NetFirewallRule -DisplayName "*PostgreSQL*"

# Test local connection
psql -h localhost -U postgres -d nexusvpn

# Test remote connection (from another machine)
psql -h 91.99.23.239 -U postgres -d nexusvpn
```

### Render Deployment Issues

1. **Environment Variables**: Double-check all variables
2. **Service ID**: Ensure correct Render service ID
3. **Deploy Hook**: Check if deploy hook is triggered
4. **Logs**: Review Render logs for specific errors

## 📊 Performance Optimization

### PostgreSQL Tuning for Windows Server

Edit `postgresql.conf` for better performance:

```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 200
listen_addresses = '*'

# WAL settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

### Connection Pool Optimization

Your `YourPostgresConfigService` is already optimized with:
- Connection timeout: 15 seconds
- Idle timeout: 30 seconds
- Maximum connections: 10
- Keep-alive enabled
- Retry logic with 5 attempts

## 🔐 Security Considerations

1. **Network Security**: Consider VPN or IP whitelisting
2. **PostgreSQL Security**: Use strong passwords
3. **Windows Security**: Keep server updated
4. **Render Security**: Use environment variables for secrets

## 📞 Support

If you encounter issues:

1. Check Windows Event Viewer for PostgreSQL errors
2. Review PostgreSQL logs in `C:\Program Files\PostgreSQL\[version]\data\log\`
3. Test connectivity with provided scripts
4. Check Render deployment logs
5. Verify environment variables

---

**Next Steps**: Proceed to deploy using the provided scripts or manual configuration. The system is ready for production use with your Windows Server 2019 PostgreSQL instance.