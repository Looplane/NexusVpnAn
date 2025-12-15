# =============================================================================
# 🔍 Diagnose Windows SSH Key Authentication Issues
# =============================================================================
# This script checks all aspects of SSH key authentication setup
# =============================================================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🔍 SSH Key Authentication Diagnostics" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Verify sshd_config
Write-Host "1. Checking sshd_config..." -ForegroundColor Yellow
$sshdConfig = "C:\ProgramData\ssh\sshd_config"
if (Test-Path $sshdConfig) {
    $config = Get-Content $sshdConfig -Raw
    
    # Check PubkeyAuthentication
    if ($config -match '^PubkeyAuthentication\s+yes' -or $config -match '(?m)^PubkeyAuthentication\s+yes') {
        Write-Host "   ✅ PubkeyAuthentication is ENABLED" -ForegroundColor Green
    } elseif ($config -match '#PubkeyAuthentication') {
        Write-Host "   ❌ PubkeyAuthentication is COMMENTED OUT" -ForegroundColor Red
        Write-Host "   Fix: Uncomment 'PubkeyAuthentication yes' in sshd_config" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  PubkeyAuthentication not found, adding it..." -ForegroundColor Yellow
    }
    
    # Check AuthorizedKeysFile
    $authKeysLine = Select-String -Path $sshdConfig -Pattern "AuthorizedKeysFile" | Select-Object -First 1
    if ($authKeysLine) {
        Write-Host "   ✅ AuthorizedKeysFile found: $($authKeysLine.Line.Trim())" -ForegroundColor Green
    } else {
        Write-Host "   ❌ AuthorizedKeysFile not found" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ sshd_config not found at $sshdConfig" -ForegroundColor Red
}

Write-Host ""

# Check 2: Verify authorized_keys files exist
Write-Host "2. Checking authorized_keys files..." -ForegroundColor Yellow

$userKeys = "$env:USERPROFILE\.ssh\authorized_keys"
$adminKeys = "C:\ProgramData\ssh\administrators_authorized_keys"

if (Test-Path $userKeys) {
    $userKeyContent = Get-Content $userKeys -Raw
    $keyCount = ($userKeyContent -split "`n" | Where-Object { $_.Trim() -ne "" }).Count
    Write-Host "   ✅ User authorized_keys exists: $userKeys" -ForegroundColor Green
    Write-Host "      Keys found: $keyCount" -ForegroundColor White
    Write-Host "      First 50 chars: $($userKeyContent.Substring(0, [Math]::Min(50, $userKeyContent.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "   ❌ User authorized_keys NOT FOUND: $userKeys" -ForegroundColor Red
}

if (Test-Path $adminKeys) {
    $adminKeyContent = Get-Content $adminKeys -Raw
    $keyCount = ($adminKeyContent -split "`n" | Where-Object { $_.Trim() -ne "" }).Count
    Write-Host "   ✅ Admin authorized_keys exists: $adminKeys" -ForegroundColor Green
    Write-Host "      Keys found: $keyCount" -ForegroundColor White
    Write-Host "      First 50 chars: $($adminKeyContent.Substring(0, [Math]::Min(50, $adminKeyContent.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "   ❌ Admin authorized_keys NOT FOUND: $adminKeys" -ForegroundColor Red
}

Write-Host ""

# Check 3: Verify permissions
Write-Host "3. Checking file permissions..." -ForegroundColor Yellow

if (Test-Path $userKeys) {
    $acl = Get-Acl $userKeys
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $hasAccess = $acl.Access | Where-Object { $_.IdentityReference -eq $currentUser -and $_.FileSystemRights -match "Read" }
    if ($hasAccess) {
        Write-Host "   ✅ User has read access to $userKeys" -ForegroundColor Green
    } else {
        Write-Host "   ❌ User does NOT have read access to $userKeys" -ForegroundColor Red
    }
}

if (Test-Path $adminKeys) {
    $acl = Get-Acl $adminKeys
    $adminGroup = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-32-544") # Administrators SID
    $hasAccess = $acl.Access | Where-Object { $_.IdentityReference -like "*Administrators*" -and $_.FileSystemRights -match "Read" }
    if ($hasAccess) {
        Write-Host "   ✅ Administrators have read access to $adminKeys" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Administrators do NOT have read access to $adminKeys" -ForegroundColor Red
    }
}

Write-Host ""

# Check 4: Verify SSH service
Write-Host "4. Checking SSH service..." -ForegroundColor Yellow
$sshService = Get-Service -Name sshd -ErrorAction SilentlyContinue
if ($sshService) {
    Write-Host "   ✅ SSH service found" -ForegroundColor Green
    Write-Host "      Status: $($sshService.Status)" -ForegroundColor White
    Write-Host "      Startup Type: $($sshService.StartType)" -ForegroundColor White
} else {
    Write-Host "   ❌ SSH service NOT FOUND" -ForegroundColor Red
}

Write-Host ""

# Check 5: Check SSH logs
Write-Host "5. Recent SSH authentication attempts..." -ForegroundColor Yellow
$sshLogs = Get-EventLog -LogName Application -Source OpenSSH* -Newest 5 -ErrorAction SilentlyContinue
if ($sshLogs) {
    foreach ($log in $sshLogs) {
        $message = $log.Message
        if ($message -match "key|auth|publickey") {
            Write-Host "   $($log.TimeGenerated): $($message.Substring(0, [Math]::Min(100, $message.Length)))" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "   ⚠️  No recent SSH logs found" -ForegroundColor Yellow
}

Write-Host ""

# Check 6: Verify key format
Write-Host "6. Verifying key format..." -ForegroundColor Yellow
if (Test-Path $userKeys) {
    $keys = Get-Content $userKeys
    foreach ($key in $keys) {
        $key = $key.Trim()
        if ($key -ne "" -and $key -notmatch '^#') {
            if ($key -match '^(ssh-rsa|ssh-ed25519|ecdsa-sha2)') {
                Write-Host "   ✅ Valid key format: $($key.Substring(0, [Math]::Min(50, $key.Length)))..." -ForegroundColor Green
            } else {
                Write-Host "   ❌ Invalid key format: $($key.Substring(0, [Math]::Min(50, $key.Length)))..." -ForegroundColor Red
            }
            if ($key.Length -lt 100) {
                Write-Host "   ⚠️  Key seems too short (might be incomplete)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  📋 Summary & Recommendations" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Provide recommendations
Write-Host "If SSH still asks for password, try:" -ForegroundColor Yellow
Write-Host "1. Ensure the SSH public key from backend matches exactly" -ForegroundColor White
Write-Host "2. Run: Get-Content C:\ProgramData\ssh\sshd_config | Select-String 'PubkeyAuthentication'" -ForegroundColor Cyan
Write-Host "3. Test with verbose SSH: ssh -v Administrator@91.99.23.239" -ForegroundColor Cyan
Write-Host "4. Check Windows Event Viewer: Application logs, Source: OpenSSH" -ForegroundColor Cyan
Write-Host ""

