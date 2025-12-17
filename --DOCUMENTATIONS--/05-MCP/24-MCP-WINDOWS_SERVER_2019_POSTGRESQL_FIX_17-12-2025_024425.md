# 🔧 Windows Server 2019 PostgreSQL Connection Fix Guide

## 🚨 Connection Issue Detected

Your Windows Server 2019 PostgreSQL at `91.99.23.239:5432` is not accepting connections. The error `ECONNRESET` indicates the connection is being reset, likely due to Windows Server configuration issues.

## 🔧 Step-by-Step Fix for Windows Server 2019

### Step 1: Check Windows Server PostgreSQL Service

**On your Windows Server 2019**, run these commands as Administrator:

```powershell
# Check PostgreSQL service status
Get-Service -Name "postgresql*"

# If service is not running, start it
Start-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue

# Check if service is now running
Get-Service -Name "postgresql-x64-14"
```

### Step 2: Configure PostgreSQL for Remote Access

**On your Windows Server 2019**, edit these files:

#### Edit `postgresql.conf`:
```powershell
# Find your PostgreSQL data directory
$pgDataDir = "C:\Program Files\PostgreSQL\14\data"

# Backup current config
Copy-Item "$pgDataDir\postgresql.conf" "$pgDataDir\postgresql.conf.backup"

# Add remote access configuration
Add-Content "$pgDataDir\postgresql.conf" @"

# NexusVPN Remote Access Configuration
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
"@
```

#### Edit `pg_hba.conf`:
```powershell
# Backup current config
Copy-Item "$pgDataDir\pg_hba.conf" "$pgDataDir\pg_hba.conf.backup"

# Add authentication configuration
Add-Content "$pgDataDir\pg_hba.conf" @"

# NexusVPN Authentication Configuration
# IPv4 remote connections
host    all             all             0.0.0.0/0               md5
host    nexusvpn        postgres        0.0.0.0/0               md5

# IPv6 remote connections  
host    all             all             ::/0                    md5
host    nexusvpn        postgres        ::/0                    md5
"@
```

### Step 3: Windows Firewall Configuration

**On your Windows Server 2019**, run:

```powershell
# Check if firewall rule exists
Get-NetFirewallRule -DisplayName "*PostgreSQL*" -ErrorAction SilentlyContinue

# Create firewall rule for PostgreSQL
New-NetFirewallRule `
    -DisplayName "PostgreSQL-5432-NexusVPN" `
    -Direction Inbound `
    -Protocol TCP `
    -LocalPort 5432 `
    -Action Allow `
    -Profile Any

# Verify rule was created
Get-NetFirewallRule -DisplayName "PostgreSQL-5432-NexusVPN"
```

### Step 4: Restart PostgreSQL Service

**On your Windows Server 2019**:

```powershell
# Restart PostgreSQL service
Restart-Service -Name "postgresql-x64-14" -Force

# Wait for service to start
Start-Sleep -Seconds 10

# Check service status
Get-Service -Name "postgresql-x64-14"

# Check if port is listening
netstat -an | findstr "5432"
```

### Step 5: Create Database and User

**On your Windows Server 2019**, connect to PostgreSQL:

```powershell
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL, run these commands:
CREATE DATABASE nexusvpn;
CREATE USER nexusvpn_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO nexusvpn_user;
GRANT ALL PRIVILEGES ON DATABASE nexusvpn TO postgres;
\q
```

### Step 6: Test Local Connection

**On your Windows Server 2019**:

```powershell
# Test local connection
psql -h localhost -U postgres -d nexusvpn -c "SELECT version();"

# Test network connection
Test-NetConnection -ComputerName localhost -Port 5432
```

## 🔧 Quick Fix Script for Windows Server 2019

**Save this as `fix-windows-postgres.ps1` on your server and run as Administrator:**

```powershell
# Windows Server 2019 PostgreSQL Fix Script
Write-Host "🔧 Fixing Windows Server 2019 PostgreSQL Configuration" -ForegroundColor Green

# Configuration
$pgVersion = "14"
$pgDataDir = "C:\Program Files\PostgreSQL\$pgVersion\data"
$pgService = "postgresql-x64-$pgVersion"

# Step 1: Check and start service
Write-Host "📊 Checking PostgreSQL service..." -ForegroundColor Yellow
$service = Get-Service -Name $pgService -ErrorAction SilentlyContinue
if ($service.Status -ne "Running") {
    Write-Host "🚀 Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service -Name $pgService
    Start-Sleep -Seconds 5
}

# Step 2: Configure postgresql.conf
Write-Host "⚙️ Configuring postgresql.conf..." -ForegroundColor Yellow
if (Test-Path "$pgDataDir\postgresql.conf") {
    Copy-Item "$pgDataDir\postgresql.conf" "$pgDataDir\postgresql.conf.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    # Add configuration if not exists
    $config = Get-Content "$pgDataDir\postgresql.conf"
    if ($config -notcontains "listen_addresses = '*'") {
        Add-Content "$pgDataDir\postgresql.conf" @"

# NexusVPN Configuration
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
"@
    }
}

# Step 3: Configure pg_hba.conf
Write-Host "🔐 Configuring pg_hba.conf..." -ForegroundColor Yellow
if (Test-Path "$pgDataDir\pg_hba.conf") {
    Copy-Item "$pgDataDir\pg_hba.conf" "$pgDataDir\pg_hba.conf.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    # Add configuration if not exists
    $config = Get-Content "$pgDataDir\pg_hba.conf"
    if ($config -notcontains "host    nexusvpn        postgres        0.0.0.0/0               md5") {
        Add-Content "$pgDataDir\pg_hba.conf" @"

# NexusVPN Remote Access
host    nexusvpn        postgres        0.0.0.0/0               md5
host    nexusvpn        postgres        ::/0                    md5
"@
    }
}

# Step 4: Configure Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "PostgreSQL-5432-NexusVPN" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule `
        -DisplayName "PostgreSQL-5432-NexusVPN" `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort 5432 `
        -Action Allow `
        -Profile Any
}

# Step 5: Restart service
Write-Host "🔄 Restarting PostgreSQL service..." -ForegroundColor Yellow
Restart-Service -Name $pgService -Force
Start-Sleep -Seconds 10

# Step 6: Create database
Write-Host "🗄️ Creating nexusvpn database..." -ForegroundColor Yellow
try {
    createdb -U postgres nexusvpn 2>$null
    Write-Host "✅ Database 'nexusvpn' created or already exists" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Database 'nexusvpn' may already exist" -ForegroundColor Yellow
}

# Step 7: Test connection
Write-Host "🧪 Testing connection..." -ForegroundColor Yellow
try {
    $result = psql -h localhost -U postgres -d nexusvpn -c "SELECT version();" 2>$null
    if ($result) {
        Write-Host "✅ Local connection test passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Local connection test failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Local connection test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 8: Show status
Write-Host "📊 Final Status:" -ForegroundColor Yellow
Get-Service -Name $pgService
netstat -an | findstr "5432"

Write-Host ""
Write-Host "🎉 Windows Server 2019 PostgreSQL configuration complete!" -ForegroundColor Green
Write-Host "🌐 Your server should now accept connections from 91.99.23.239:5432" -ForegroundColor Green
}
```

## 🔍 Test Connection Again

After running the fix script on your Windows Server 2019, test from your local machine:

```bash
cd g:\VPN-PROJECT-2025\nexusvpn\backend
node test-your-postgres-connection.js
```

## 📞 If Still Not Working

1. **Check Windows Event Viewer** on your server for PostgreSQL errors
2. **Check PostgreSQL logs** in `C:\Program Files\PostgreSQL\14\data\log\`
3. **Verify your server IP** is actually `91.99.23.239`
4. **Check if PostgreSQL is bound to the correct IP**
5. **Verify no other firewall** (hardware/cloud) is blocking port 5432

## 🎯 Next Steps After Fix

Once connection is successful:

1. **Deploy to Render** using the deployment script
2. **Configure environment variables** in Render dashboard
3. **Test the deployed application**

---

**Need help?** Run the PowerShell script on your Windows Server 2019 first, then test the connection again.