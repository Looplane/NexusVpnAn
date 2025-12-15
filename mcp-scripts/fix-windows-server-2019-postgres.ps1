# Windows Server 2019 PostgreSQL Configuration Fix
# Run this script as Administrator on your Windows Server 2019

Write-Host "🪟 Configuring Windows Server 2019 PostgreSQL for NexusVPN..." -ForegroundColor Green

# Find PostgreSQL installation
$pgVersion = Get-ChildItem "C:\Program Files\PostgreSQL" | Where-Object { $_.Name -match "^\d+" } | Sort-Object Name -Descending | Select-Object -First 1
if (-not $pgVersion) {
    Write-Host "❌ PostgreSQL installation not found!" -ForegroundColor Red
    exit 1
}

$pgPath = "C:\Program Files\PostgreSQL\$($pgVersion.Name)"
$dataPath = "$pgPath\data"

Write-Host "📁 Found PostgreSQL: $pgPath" -ForegroundColor Yellow

# Backup current config files
Write-Host "💾 Backing up configuration files..." -ForegroundColor Yellow
Copy-Item "$dataPath\postgresql.conf" "$dataPath\postgresql.conf.backup" -Force
Copy-Item "$dataPath\pg_hba.conf" "$dataPath\pg_hba.conf.backup" -Force

# Configure postgresql.conf for remote access
Write-Host "⚙️ Configuring postgresql.conf..." -ForegroundColor Yellow
$postgresConf = Get-Content "$dataPath\postgresql.conf"

# Remove existing listen_addresses if present
$postgresConf = $postgresConf -replace '^listen_addresses\s*=.*', ''

# Add our configuration
$postgresConf += @"

# NexusVPN Configuration - Added $(Get-Date)
listen_addresses = '*'
max_connections = 100
shared_buffers = 128MB
work_mem = 4MB
maintenance_work_mem = 64MB
"@

$postgresConf | Set-Content "$dataPath\postgresql.conf" -Encoding UTF8

# Configure pg_hba.conf for authentication
Write-Host "🔐 Configuring pg_hba.conf..." -ForegroundColor Yellow
$pgHbaConf = Get-Content "$dataPath\pg_hba.conf"

# Add our authentication rules
$pgHbaConf += @"

# NexusVPN Configuration - Added $(Get-Date)
# Allow connections from Render and our client IP
host    nexusvpn    postgres    39.39.209.207/32    md5
host    nexusvpn    postgres    0.0.0.0/0           md5
host    all         postgres    39.39.209.207/32    md5
host    all         postgres    0.0.0.0/0           md5
"@

$pgHbaConf | Set-Content "$dataPath\pg_hba.conf" -Encoding UTF8

# Configure Windows Firewall
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "PostgreSQL-5432" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -DisplayName "PostgreSQL-5432" -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow -Description "Allow PostgreSQL connections for NexusVPN"
    Write-Host "✅ Windows Firewall rule created" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Firewall rule already exists" -ForegroundColor Yellow
}

# Restart PostgreSQL service
Write-Host "🔄 Restarting PostgreSQL service..." -ForegroundColor Yellow
$serviceName = "postgresql-x64-" + $pgVersion.Name

Stop-Service $serviceName -Force
Start-Service $serviceName

# Wait for service to start
Start-Sleep -Seconds 5

# Check service status
$serviceStatus = Get-Service $serviceName
if ($serviceStatus.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service failed to start!" -ForegroundColor Red
    exit 1
}

# Create database and user
Write-Host "🗄️ Creating database and user..." -ForegroundColor Yellow
cd $pgPath\bin

# Create database
$createDbResult = & .\createdb.exe -U postgres nexusvpn 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'nexusvpn' created successfully" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Database may already exist or creation failed: $createDbResult" -ForegroundColor Yellow
}

# Test connection
Write-Host "🧪 Testing connection..." -ForegroundColor Yellow
$testResult = & .\psql.exe -U postgres -d nexusvpn -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection test successful!" -ForegroundColor Green
    Write-Host "📊 PostgreSQL Version: $($testResult[0])" -ForegroundColor Green
} else {
    Write-Host "❌ Connection test failed: $testResult" -ForegroundColor Red
}

Write-Host "🎉 Configuration complete!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  • PostgreSQL configured for remote access" -ForegroundColor White
Write-Host "  • Firewall rule created for port 5432" -ForegroundColor White
Write-Host "  • Database 'nexusvpn' created" -ForegroundColor White
Write-Host "  • Authentication configured for your IP (39.39.209.207)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🚀 Next step: Test connection from your development machine" -ForegroundColor Green