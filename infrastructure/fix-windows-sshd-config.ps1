# =============================================================================
# 🔧 Fix OpenSSH Server Configuration for Key-Based Authentication
# =============================================================================
# This script fixes the sshd_config to enable public key authentication
# =============================================================================

$sshdConfig = "C:\ProgramData\ssh\sshd_config"
$backupConfig = "$sshdConfig.backup"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔧 Fixing OpenSSH Server Config" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

# Backup existing config
if (Test-Path $sshdConfig) {
    Copy-Item $sshdConfig $backupConfig -Force
    Write-Host "✅ Backed up existing config to: $backupConfig" -ForegroundColor Green
}

# Read current config
$config = Get-Content $sshdConfig -Raw

# Fix 1: Uncomment PubkeyAuthentication
$config = $config -replace '#PubkeyAuthentication yes', 'PubkeyAuthentication yes'
if ($config -notmatch 'PubkeyAuthentication yes') {
    # If it wasn't commented, add it
    $config = $config -replace '(?m)^#PubkeyAuthentication', 'PubkeyAuthentication yes'
    if ($config -notmatch 'PubkeyAuthentication') {
        # Add after Authentication: comment
        $config = $config -replace '(# Authentication:)', "`$1`nPubkeyAuthentication yes"
    }
}

# Fix 2: Update AuthorizedKeysFile to include both paths
$authorizedKeysPattern = 'AuthorizedKeysFile\s+[^\r\n]+'
$newAuthorizedKeys = 'AuthorizedKeysFile .ssh/authorized_keys __PROGRAMDATA__/ssh/administrators_authorized_keys'
if ($config -match $authorizedKeysPattern) {
    $config = $config -replace $authorizedKeysPattern, $newAuthorizedKeys
} else {
    # Add after PubkeyAuthentication
    $config = $config -replace '(PubkeyAuthentication yes)', "`$1`n$newAuthorizedKeys"
}

# Fix 3: Ensure PasswordAuthentication is enabled (for fallback)
$config = $config -replace '#PasswordAuthentication yes', 'PasswordAuthentication yes'

# Write updated config
Set-Content -Path $sshdConfig -Value $config -NoNewline

Write-Host "✅ Updated sshd_config:" -ForegroundColor Green
Write-Host "   - Enabled PubkeyAuthentication" -ForegroundColor White
Write-Host "   - Updated AuthorizedKeysFile paths" -ForegroundColor White
Write-Host ""

# Restart SSH service
Write-Host "🔄 Restarting OpenSSH Server..." -ForegroundColor Yellow
Restart-Service sshd

Write-Host ""
Write-Host "✅ OpenSSH Server restarted!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify the key is in both locations:" -ForegroundColor White
Write-Host "   - $env:USERPROFILE\.ssh\authorized_keys" -ForegroundColor Cyan
Write-Host "   - C:\ProgramData\ssh\administrators_authorized_keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test SSH connection from NexusVPN backend:" -ForegroundColor White
Write-Host "   ssh Administrator@91.99.23.239" -ForegroundColor Cyan
Write-Host ""

