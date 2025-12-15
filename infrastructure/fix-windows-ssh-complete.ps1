# =============================================================================
# 🔧 Complete Windows SSH Key Setup & Fix
# =============================================================================
# This script does EVERYTHING needed to set up SSH key authentication
# =============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$SshPublicKey = ""
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔧 Complete Windows SSH Key Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Step 1: Get SSH public key
if ([string]::IsNullOrWhiteSpace($SshPublicKey)) {
    Write-Host "📋 Step 1: Get SSH Public Key" -ForegroundColor Yellow
    Write-Host "Please paste the SSH public key from your NexusVPN backend server." -ForegroundColor White
    Write-Host "Get it by running on Ubuntu server: cat /root/.ssh/nexusvpn_key.pub" -ForegroundColor Cyan
    Write-Host ""
    $SshPublicKey = Read-Host "Paste the SSH public key here (or press Enter to skip)"
    
    if ([string]::IsNullOrWhiteSpace($SshPublicKey)) {
        Write-Host "⚠️  No key provided. Skipping key setup." -ForegroundColor Yellow
        $skipKey = $true
    }
}

if (-not $skipKey) {
    # Clean the key (remove any extra whitespace)
    $SshPublicKey = $SshPublicKey.Trim()
    
    # Step 2: Create .ssh directory
    Write-Host ""
    Write-Host "📋 Step 2: Setting up SSH directories..." -ForegroundColor Yellow
    $sshDir = "$env:USERPROFILE\.ssh"
    if (-not (Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
        Write-Host "   ✅ Created: $sshDir" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Directory exists: $sshDir" -ForegroundColor Green
    }
    
    # Step 3: Add key to user authorized_keys
    Write-Host ""
    Write-Host "📋 Step 3: Adding key to user authorized_keys..." -ForegroundColor Yellow
    $userKeys = "$sshDir\authorized_keys"
    
    $existingKeys = @()
    if (Test-Path $userKeys) {
        $existingKeys = Get-Content $userKeys | Where-Object { $_.Trim() -ne "" -and $_ -notmatch '^#' }
    }
    
    if ($existingKeys -notcontains $SshPublicKey) {
        Add-Content -Path $userKeys -Value $SshPublicKey
        Write-Host "   ✅ Added key to: $userKeys" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Key already exists in: $userKeys" -ForegroundColor Green
    }
    
    # Step 4: Add key to administrators_authorized_keys
    Write-Host ""
    Write-Host "📋 Step 4: Adding key to administrators_authorized_keys..." -ForegroundColor Yellow
    $adminKeysDir = "C:\ProgramData\ssh"
    if (-not (Test-Path $adminKeysDir)) {
        New-Item -ItemType Directory -Path $adminKeysDir -Force | Out-Null
        Write-Host "   ✅ Created: $adminKeysDir" -ForegroundColor Green
    }
    
    $adminKeys = "$adminKeysDir\administrators_authorized_keys"
    $existingAdminKeys = @()
    if (Test-Path $adminKeys) {
        $existingAdminKeys = Get-Content $adminKeys | Where-Object { $_.Trim() -ne "" -and $_ -notmatch '^#' }
    }
    
    if ($existingAdminKeys -notcontains $SshPublicKey) {
        Add-Content -Path $adminKeys -Value $SshPublicKey
        Write-Host "   ✅ Added key to: $adminKeys" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Key already exists in: $adminKeys" -ForegroundColor Green
    }
    
    # Step 5: Fix permissions using .NET methods (more reliable)
    Write-Host ""
    Write-Host "📋 Step 5: Setting correct permissions..." -ForegroundColor Yellow
    
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    
    # Fix .ssh directory
    $sshDirAcl = Get-Acl $sshDir
    $sshDirAcl.SetAccessRuleProtection($true, $false)
    $sshDirRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $sshDirAcl.SetAccessRule($sshDirRule)
    Set-Acl $sshDir $sshDirAcl
    Write-Host "   ✅ Fixed permissions on: $sshDir" -ForegroundColor Green
    
    # Fix user authorized_keys
    $userKeysAcl = Get-Acl $userKeys
    $userKeysAcl.SetAccessRuleProtection($true, $false)
    $userKeysRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "None", "None", "Allow")
    $userKeysAcl.SetAccessRule($userKeysRule)
    Set-Acl $userKeys $userKeysAcl
    Write-Host "   ✅ Fixed permissions on: $userKeys" -ForegroundColor Green
    
    # Fix administrators_authorized_keys
    $adminKeysAcl = Get-Acl $adminKeys
    $adminKeysAcl.SetAccessRuleProtection($true, $false)
    $adminGroup = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-32-544") # Administrators
    $adminGroupName = $adminGroup.Translate([System.Security.Principal.NTAccount]).Value
    $adminKeysRule = New-Object System.Security.AccessControl.FileSystemAccessRule($adminGroupName, "FullControl", "None", "None", "Allow")
    $adminKeysAcl.SetAccessRule($adminKeysRule)
    Set-Acl $adminKeys $adminKeysAcl
    Write-Host "   ✅ Fixed permissions on: $adminKeys" -ForegroundColor Green
}

# Step 6: Fix sshd_config
Write-Host ""
Write-Host "📋 Step 6: Fixing sshd_config..." -ForegroundColor Yellow
$sshdConfig = "C:\ProgramData\ssh\sshd_config"
$backupConfig = "$sshdConfig.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

if (Test-Path $sshdConfig) {
    Copy-Item $sshdConfig $backupConfig -Force
    Write-Host "   ✅ Backed up config to: $backupConfig" -ForegroundColor Green
    
    $config = Get-Content $sshdConfig -Raw
    
    # Uncomment PubkeyAuthentication
    if ($config -match '#PubkeyAuthentication\s+yes') {
        $config = $config -replace '#PubkeyAuthentication\s+yes', 'PubkeyAuthentication yes'
        Write-Host "   ✅ Uncommented PubkeyAuthentication" -ForegroundColor Green
    } elseif ($config -notmatch '(?m)^PubkeyAuthentication\s+yes') {
        # Add it if it doesn't exist
        $config = $config -replace '(# Authentication:)', "`$1`nPubkeyAuthentication yes"
        Write-Host "   ✅ Added PubkeyAuthentication yes" -ForegroundColor Green
    } else {
        Write-Host "   ✅ PubkeyAuthentication already enabled" -ForegroundColor Green
    }
    
    # Update AuthorizedKeysFile
    $newAuthKeys = 'AuthorizedKeysFile .ssh/authorized_keys __PROGRAMDATA__/ssh/administrators_authorized_keys'
    if ($config -match 'AuthorizedKeysFile\s+[^\r\n]+') {
        $oldLine = [regex]::Match($config, 'AuthorizedKeysFile\s+[^\r\n]+').Value
        if ($oldLine -ne $newAuthKeys) {
            $config = $config -replace 'AuthorizedKeysFile\s+[^\r\n]+', $newAuthKeys
            Write-Host "   ✅ Updated AuthorizedKeysFile" -ForegroundColor Green
        } else {
            Write-Host "   ✅ AuthorizedKeysFile already correct" -ForegroundColor Green
        }
    } else {
        # Add it after PubkeyAuthentication
        $config = $config -replace '(PubkeyAuthentication yes)', "`$1`n$newAuthKeys"
        Write-Host "   ✅ Added AuthorizedKeysFile" -ForegroundColor Green
    }
    
    Set-Content -Path $sshdConfig -Value $config -NoNewline
    Write-Host "   ✅ Saved sshd_config" -ForegroundColor Green
} else {
    Write-Host "   ❌ sshd_config not found at: $sshdConfig" -ForegroundColor Red
    Write-Host "   Installing OpenSSH Server..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
}

# Step 7: Ensure SSH service is running
Write-Host ""
Write-Host "📋 Step 7: Ensuring SSH service is running..." -ForegroundColor Yellow
$sshService = Get-Service -Name sshd -ErrorAction SilentlyContinue
if (-not $sshService) {
    Write-Host "   Installing OpenSSH Server..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    $sshService = Get-Service -Name sshd
}

if ($sshService.Status -ne 'Running') {
    Start-Service sshd
    Write-Host "   ✅ Started SSH service" -ForegroundColor Green
} else {
    Write-Host "   ✅ SSH service is running" -ForegroundColor Green
}

Set-Service -Name sshd -StartupType Automatic
Write-Host "   ✅ Set SSH service to start automatically" -ForegroundColor Green

# Step 8: Configure firewall
Write-Host ""
Write-Host "📋 Step 8: Configuring firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -DisplayName "OpenSSH SSH Server (sshd)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 | Out-Null
    Write-Host "   ✅ Added firewall rule" -ForegroundColor Green
} else {
    Write-Host "   ✅ Firewall rule already exists" -ForegroundColor Green
}

# Step 9: Restart SSH service to apply config
Write-Host ""
Write-Host "📋 Step 9: Restarting SSH service..." -ForegroundColor Yellow
Restart-Service sshd
Start-Sleep -Seconds 2
$sshService = Get-Service -Name sshd
if ($sshService.Status -eq 'Running') {
    Write-Host "   ✅ SSH service restarted successfully" -ForegroundColor Green
} else {
    Write-Host "   ❌ SSH service failed to start!" -ForegroundColor Red
    Write-Host "   Check Event Viewer for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test SSH connection from NexusVPN backend:" -ForegroundColor White
Write-Host "   ssh -v Administrator@91.99.23.239" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. If it still asks for password, run diagnostics:" -ForegroundColor White
Write-Host "   .\diagnose-windows-ssh.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Check SSH logs in Event Viewer:" -ForegroundColor White
Write-Host "   Application logs -> Source: OpenSSH" -ForegroundColor Cyan
Write-Host ""

