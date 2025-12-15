# =============================================================================
# 🔑 Setup SSH Key for NexusVPN on Windows Server
# =============================================================================
# This script adds the NexusVPN backend SSH public key to Windows Server
# so that auto-configuration can work properly.
# =============================================================================

# NexusVPN Backend Public Key (replace with your actual key)
$NEXUSVPN_PUBLIC_KEY = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... nexus-backend"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔑 Setting up SSH Key for NexusVPN" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Get the SSH public key from user or use default
$keyInput = Read-Host "Enter NexusVPN backend SSH public key (or press Enter to use default path)"
if ([string]::IsNullOrWhiteSpace($keyInput)) {
    # Try to read from a file if it exists
    $keyFile = "C:\nexusvpn_public_key.txt"
    if (Test-Path $keyFile) {
        $NEXUSVPN_PUBLIC_KEY = Get-Content $keyFile -Raw
        Write-Host "✅ Loaded SSH key from $keyFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No key file found. Please provide the SSH public key." -ForegroundColor Yellow
        Write-Host "You can get it from your NexusVPN backend server:" -ForegroundColor Yellow
        Write-Host "  cat /root/.ssh/nexusvpn_key.pub" -ForegroundColor Cyan
        Write-Host ""
        $NEXUSVPN_PUBLIC_KEY = Read-Host "Paste the SSH public key here"
    }
}

# Ensure SSH directory exists
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "✅ Created SSH directory: $sshDir" -ForegroundColor Green
}

# Set correct permissions on .ssh directory
icacls $sshDir /inheritance:r /grant:r "$env:USERNAME:(OI)(CI)F" | Out-Null

# Add key to authorized_keys
$authorizedKeysFile = "$sshDir\authorized_keys"
$keyExists = $false

if (Test-Path $authorizedKeysFile) {
    $existingKeys = Get-Content $authorizedKeysFile
    if ($existingKeys -contains $NEXUSVPN_PUBLIC_KEY) {
        $keyExists = $true
        Write-Host "✅ SSH key already exists in authorized_keys" -ForegroundColor Green
    }
}

if (-not $keyExists) {
    Add-Content -Path $authorizedKeysFile -Value $NEXUSVPN_PUBLIC_KEY
    Write-Host "✅ Added SSH key to authorized_keys" -ForegroundColor Green
}

# Set correct permissions on authorized_keys (Windows requires specific permissions)
icacls $authorizedKeysFile /inheritance:r /grant:r "$env:USERNAME:(F)" | Out-Null
Write-Host "✅ Set correct permissions on authorized_keys" -ForegroundColor Green

# Also add to administrators_authorized_keys (for OpenSSH Server)
$adminKeysFile = "C:\ProgramData\ssh\administrators_authorized_keys"
if (Test-Path "C:\ProgramData\ssh") {
    if (-not (Test-Path $adminKeysFile)) {
        New-Item -ItemType File -Path $adminKeysFile -Force | Out-Null
    }
    
    $adminKeys = Get-Content $adminKeysFile -ErrorAction SilentlyContinue
    if ($adminKeys -notcontains $NEXUSVPN_PUBLIC_KEY) {
        Add-Content -Path $adminKeysFile -Value $NEXUSVPN_PUBLIC_KEY
        Write-Host "✅ Added SSH key to administrators_authorized_keys" -ForegroundColor Green
    } else {
        Write-Host "✅ SSH key already exists in administrators_authorized_keys" -ForegroundColor Green
    }
    
    # Set correct permissions
    icacls $adminKeysFile /inheritance:r /grant:r "Administrators:(F)" | Out-Null
    Write-Host "✅ Set correct permissions on administrators_authorized_keys" -ForegroundColor Green
}

# Verify OpenSSH Server is running
$sshService = Get-Service -Name sshd -ErrorAction SilentlyContinue
if ($sshService) {
    if ($sshService.Status -ne 'Running') {
        Start-Service sshd
        Write-Host "✅ Started OpenSSH Server" -ForegroundColor Green
    } else {
        Write-Host "✅ OpenSSH Server is running" -ForegroundColor Green
    }
    
    # Ensure it starts automatically
    Set-Service -Name sshd -StartupType Automatic
    Write-Host "✅ Set OpenSSH Server to start automatically" -ForegroundColor Green
} else {
    Write-Host "⚠️  OpenSSH Server not found. Installing..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Start-Service sshd
    Set-Service -Name sshd -StartupType Automatic
    Write-Host "✅ Installed and started OpenSSH Server" -ForegroundColor Green
}

# Configure Windows Firewall
$firewallRule = Get-NetFirewallRule -DisplayName "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -DisplayName "OpenSSH SSH Server (sshd)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
    Write-Host "✅ Added Windows Firewall rule for SSH" -ForegroundColor Green
} else {
    Write-Host "✅ Windows Firewall rule for SSH already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ SSH Key Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test SSH connection from NexusVPN backend:" -ForegroundColor White
Write-Host "   ssh Administrator@91.99.23.239" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. If connection works, try auto-configuration in the admin panel" -ForegroundColor White
Write-Host ""

