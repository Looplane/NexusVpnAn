# =============================================================================
# SSH Setup Script for Windows Server 2019 - Server 1 (46.62.201.216)
# =============================================================================
# Run as Administrator
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SSH Setup - Server 1" -ForegroundColor Cyan
Write-Host "  IP: 46.62.201.216" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Installing OpenSSH Server..." -ForegroundColor Yellow
try {
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0 | Out-Null
    Write-Host "✅ OpenSSH Server installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  OpenSSH Server may already be installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/4] Starting SSH service..." -ForegroundColor Yellow
Start-Service sshd -ErrorAction SilentlyContinue
Set-Service -Name sshd -StartupType 'Automatic'
$status = Get-Service sshd
if ($status.Status -eq 'Running') {
    Write-Host "✅ SSH service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  SSH service status: $($status.Status)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3/4] Configuring firewall..." -ForegroundColor Yellow
try {
    New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 -ErrorAction SilentlyContinue | Out-Null
    Write-Host "✅ Firewall rule added for port 22" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firewall rule may already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Setting up SSH directory..." -ForegroundColor Yellow
$sshPath = "$env:USERPROFILE\.ssh"
New-Item -ItemType Directory -Force -Path $sshPath | Out-Null
icacls $sshPath /inheritance:r | Out-Null
icacls $sshPath /grant "Administrator:F" | Out-Null
Write-Host "✅ SSH directory created at: $sshPath" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ SSH Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Get SSH public key from NexusVPN server (5.161.91.222):" -ForegroundColor White
Write-Host "   ssh root@5.161.91.222 'cat /opt/nexusvpn/.ssh/id_rsa.pub'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Add the public key to authorized_keys:" -ForegroundColor White
Write-Host "   `$pubKey = 'PASTE_PUBLIC_KEY_HERE'" -ForegroundColor Cyan
Write-Host "   Add-Content -Path `"$sshPath\authorized_keys`" -Value `$pubKey" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Set permissions on authorized_keys:" -ForegroundColor White
Write-Host "   icacls `"$sshPath\authorized_keys`" /inheritance:r" -ForegroundColor Cyan
Write-Host "   icacls `"$sshPath\authorized_keys`" /grant `"Administrator:F`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Test SSH connection from NexusVPN server:" -ForegroundColor White
Write-Host "   ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@46.62.201.216 'echo Test'" -ForegroundColor Cyan
Write-Host ""

