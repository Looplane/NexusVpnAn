# =============================================================================
# 🔧 Fix Windows SSH Key File Permissions
# =============================================================================
# This script fixes permissions on SSH key files using .NET methods
# =============================================================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔧 Fixing SSH Key File Permissions" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    exit 1
}

$userKeys = "$env:USERPROFILE\.ssh\authorized_keys"
$adminKeys = "C:\ProgramData\ssh\administrators_authorized_keys"
$sshDir = "$env:USERPROFILE\.ssh"

# Get current user
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
Write-Host "Current user: $currentUser" -ForegroundColor White
Write-Host ""

# Fix .ssh directory permissions
Write-Host "1. Fixing .ssh directory permissions..." -ForegroundColor Yellow
if (Test-Path $sshDir) {
    $acl = Get-Acl $sshDir
    $acl.SetAccessRuleProtection($true, $false)  # Disable inheritance, remove inherited rules
    
    # Remove all existing rules
    $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
    
    # Add rule for current user
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.AddAccessRule($rule)
    
    Set-Acl $sshDir $acl
    Write-Host "   ✅ Fixed permissions on: $sshDir" -ForegroundColor Green
} else {
    Write-Host "   ❌ Directory not found: $sshDir" -ForegroundColor Red
}

# Fix user authorized_keys permissions
Write-Host ""
Write-Host "2. Fixing user authorized_keys permissions..." -ForegroundColor Yellow
if (Test-Path $userKeys) {
    $acl = Get-Acl $userKeys
    $acl.SetAccessRuleProtection($true, $false)  # Disable inheritance
    
    # Remove all existing rules
    $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
    
    # Add rule for current user only
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "None", "None", "Allow")
    $acl.AddAccessRule($rule)
    
    Set-Acl $userKeys $acl
    Write-Host "   ✅ Fixed permissions on: $userKeys" -ForegroundColor Green
    
    # Verify permissions
    $finalAcl = Get-Acl $userKeys
    Write-Host "   Current permissions:" -ForegroundColor Gray
    $finalAcl.Access | ForEach-Object { Write-Host "      $($_.IdentityReference): $($_.FileSystemRights)" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ File not found: $userKeys" -ForegroundColor Red
}

# Fix administrators_authorized_keys permissions
Write-Host ""
Write-Host "3. Fixing administrators_authorized_keys permissions..." -ForegroundColor Yellow
if (Test-Path $adminKeys) {
    $acl = Get-Acl $adminKeys
    $acl.SetAccessRuleProtection($true, $false)  # Disable inheritance
    
    # Remove all existing rules
    $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }
    
    # Add rule for Administrators group
    $adminSid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-32-544")  # Administrators
    $adminGroup = $adminSid.Translate([System.Security.Principal.NTAccount])
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($adminGroup.Value, "FullControl", "None", "None", "Allow")
    $acl.AddAccessRule($rule)
    
    # Also add SYSTEM account (required for OpenSSH)
    $systemSid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-18")  # SYSTEM
    $systemAccount = $systemSid.Translate([System.Security.Principal.NTAccount])
    $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule($systemAccount.Value, "Read", "None", "None", "Allow")
    $acl.AddAccessRule($systemRule)
    
    Set-Acl $adminKeys $acl
    Write-Host "   ✅ Fixed permissions on: $adminKeys" -ForegroundColor Green
    
    # Verify permissions
    $finalAcl = Get-Acl $adminKeys
    Write-Host "   Current permissions:" -ForegroundColor Gray
    $finalAcl.Access | ForEach-Object { Write-Host "      $($_.IdentityReference): $($_.FileSystemRights)" -ForegroundColor Gray }
} else {
    Write-Host "   ❌ File not found: $adminKeys" -ForegroundColor Red
}

# Restart SSH service
Write-Host ""
Write-Host "4. Restarting SSH service..." -ForegroundColor Yellow
Restart-Service sshd
Start-Sleep -Seconds 2
$sshService = Get-Service -Name sshd
if ($sshService.Status -eq 'Running') {
    Write-Host "   ✅ SSH service restarted" -ForegroundColor Green
} else {
    Write-Host "   ❌ SSH service failed to start!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ Permissions Fixed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Test SSH connection from backend:" -ForegroundColor Yellow
Write-Host "  ssh -v Administrator@91.99.23.239" -ForegroundColor Cyan
Write-Host ""

