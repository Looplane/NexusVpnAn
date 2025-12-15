# =============================================================================
# WireGuard Setup Script for Windows Server 2019 - Server 1 (46.62.201.216)
# =============================================================================
# This script sets up WireGuard using WSL2 on Windows Server 2019
# Run as Administrator
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  WireGuard Setup - Server 1" -ForegroundColor Cyan
Write-Host "  IP: 46.62.201.216" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Enabling WSL2 features..." -ForegroundColor Yellow
try {
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart | Out-Null
    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart | Out-Null
    Write-Host "✅ WSL2 features enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️  WSL2 may already be enabled" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/4] Setting WSL2 as default..." -ForegroundColor Yellow
wsl --set-default-version 2 | Out-Null
Write-Host "✅ WSL2 set as default" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Checking for Ubuntu installation..." -ForegroundColor Yellow
$ubuntuInstalled = wsl -l -v | Select-String "Ubuntu"
if (-not $ubuntuInstalled) {
    Write-Host "⚠️  Ubuntu not found. Installing Ubuntu 22.04..." -ForegroundColor Yellow
    wsl --install -d Ubuntu-22.04
    Write-Host "✅ Ubuntu installation initiated" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Complete Ubuntu setup in the new window, then run:" -ForegroundColor Yellow
    Write-Host "   wsl -d Ubuntu-22.04" -ForegroundColor Cyan
    Write-Host "   Then run the WireGuard setup script inside WSL2" -ForegroundColor Cyan
} else {
    Write-Host "✅ Ubuntu is installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    New-NetFirewallRule -DisplayName "WireGuard VPN" -Direction Inbound -Protocol UDP -LocalPort 51820 -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "✅ Firewall rule added for UDP port 51820" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firewall rule may already exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ Windows Server Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart the server (if prompted)" -ForegroundColor White
Write-Host "2. Open WSL2 Ubuntu: wsl -d Ubuntu-22.04" -ForegroundColor White
Write-Host "3. Run the WireGuard setup script inside WSL2" -ForegroundColor White
Write-Host ""
Write-Host "WireGuard setup script location:" -ForegroundColor Cyan
Write-Host "  infrastructure/setup-wireguard-wsl2-server1.sh" -ForegroundColor White
Write-Host ""

