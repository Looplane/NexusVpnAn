# 🔧 Fix Windows Server SSH for Auto-Configuration

## Problem

When trying to use the auto-configuration feature, you see:
- **OS Detection**: `Type: unknown`
- **SSH**: `not-installed`
- **Error**: `All configured authentication methods failed`

This happens because the SSH key from your NexusVPN backend server is not authorized on the Windows Server.

## Solution

### Step 1: Get the SSH Public Key from NexusVPN Backend

On your Ubuntu server (5.161.91.222):

```bash
cat /root/.ssh/nexusvpn_key.pub
```

Or if the key is in a different location:

```bash
cat /opt/nexusvpn/.ssh/id_rsa.pub
```

**Copy the entire output** (it should look like: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... nexus-backend`)

### Step 2: Add SSH Key to Windows Server

#### Option A: Using PowerShell Script (Recommended)

1. **On Windows Server (91.99.23.239)**, open PowerShell as Administrator
2. **Download the setup script**:

```powershell
# Create the script
@"
# Paste the script content from infrastructure/setup-windows-ssh-key.ps1
"@ | Out-File -FilePath C:\setup-nexusvpn-ssh.ps1 -Encoding UTF8
```

3. **Run the script**:

```powershell
C:\setup-nexusvpn-ssh.ps1
```

4. **When prompted**, paste the SSH public key you copied from Step 1

#### Option B: Manual Setup

1. **On Windows Server**, open PowerShell as Administrator

2. **Create SSH directory** (if it doesn't exist):

```powershell
New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh" -Force
```

3. **Add the SSH key to authorized_keys**:

```powershell
# Replace YOUR_SSH_PUBLIC_KEY with the key from Step 1
$key = "YOUR_SSH_PUBLIC_KEY"
Add-Content -Path "$env:USERPROFILE\.ssh\authorized_keys" -Value $key
```

4. **Set correct permissions**:

```powershell
$sshDir = "$env:USERPROFILE\.ssh"
$authKeys = "$sshDir\authorized_keys"

# Remove inheritance and set permissions
icacls $sshDir /inheritance:r /grant:r "$env:USERNAME:(OI)(CI)F"
icacls $authKeys /inheritance:r /grant:r "$env:USERNAME:(F)"


# Alternative: use cmd.exe
# If PowerShell still has issues, run the icacls commands in cmd.exe:
cmd /c "icacls %USERPROFILE%\.ssh /inheritance:r /grant:r %USERNAME%:(OI)(CI)F"
cmd /c "icacls %USERPROFILE%\.ssh\authorized_keys /inheritance:r /grant:r %USERNAME%:(F)"
cmd /c "icacls C:\ProgramData\ssh\administrators_authorized_keys /inheritance:r /grant:r Administrators:(F)"

```

5. **Also add to administrators_authorized_keys** (for OpenSSH Server):

```powershell
$adminKeys = "C:\ProgramData\ssh\administrators_authorized_keys"
if (-not (Test-Path "C:\ProgramData\ssh")) {
    New-Item -ItemType Directory -Path "C:\ProgramData\ssh" -Force
}
Add-Content -Path $adminKeys -Value $key
icacls $adminKeys /inheritance:r /grant:r "Administrators:(F)"
```

6. **Fix OpenSSH Server Configuration** (IMPORTANT):

The `sshd_config` file needs to have `PubkeyAuthentication` enabled. Run this script:

```powershell
# Download and run the fix script
# Or manually edit C:\ProgramData\ssh\sshd_config

# Uncomment this line (remove the #):
# PubkeyAuthentication yes

# Update AuthorizedKeysFile to:
AuthorizedKeysFile .ssh/authorized_keys __PROGRAMDATA__/ssh/administrators_authorized_keys
```

**Quick Fix Script:**

```powershell
# Run this to automatically fix the config
$sshdConfig = "C:\ProgramData\ssh\sshd_config"
$config = Get-Content $sshdConfig -Raw
$config = $config -replace '#PubkeyAuthentication yes', 'PubkeyAuthentication yes'
$config = $config -replace 'AuthorizedKeysFile\s+[^\r\n]+', 'AuthorizedKeysFile .ssh/authorized_keys __PROGRAMDATA__/ssh/administrators_authorized_keys'
Set-Content -Path $sshdConfig -Value $config -NoNewline
Restart-Service sshd
```

7. **Ensure OpenSSH Server is running**:

```powershell
# Check if OpenSSH Server is installed
$sshService = Get-Service -Name sshd -ErrorAction SilentlyContinue

if (-not $sshService) {
    # Install OpenSSH Server
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
}

# Start the service
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

8. **Configure Windows Firewall**:

```powershell
New-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -DisplayName "OpenSSH SSH Server (sshd)" -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

### Step 3: Test SSH Connection

From your NexusVPN backend server (5.161.91.222):

```bash
ssh Administrator@91.99.23.239
```

If it connects without asking for a password, you're all set!

### Step 4: Try Auto-Configuration Again

1. Go to **Admin Panel** → **VPN Servers** → **Add VPN Server**
2. Select **"Auto Config"** mode
3. Enter:
   - **Server IP**: `91.99.23.239`
   - **SSH User**: `Administrator`
4. Click **"🔍 Detect Server & Check Requirements"**
5. You should now see:
   - **Type**: `windows`
   - **Distribution**: `windows-server` or `windows`
   - **Version**: (Windows version)
   - **Architecture**: `x64`

## Troubleshooting

### SSH Still Fails

1. **Check OpenSSH Server is running**:

```powershell
Get-Service sshd
```

2. **VERIFY sshd_config is correct** (Most Common Issue):

```powershell
# Check if PubkeyAuthentication is enabled
Select-String -Path "C:\ProgramData\ssh\sshd_config" -Pattern "PubkeyAuthentication"

# Should show: PubkeyAuthentication yes (NOT #PubkeyAuthentication yes)
```

If it's commented out, run:

```powershell
$sshdConfig = "C:\ProgramData\ssh\sshd_config"
$config = Get-Content $sshdConfig -Raw
$config = $config -replace '#PubkeyAuthentication yes', 'PubkeyAuthentication yes'
Set-Content -Path $sshdConfig -Value $config -NoNewline
Restart-Service sshd
```

3. **Check Windows Firewall**:

```powershell
Get-NetFirewallRule -DisplayName "*SSH*"
```

4. **Check SSH logs**:

```powershell
Get-EventLog -LogName Application -Source OpenSSH* -Newest 10
```

5. **Verify key permissions**:

```powershell
icacls "$env:USERPROFILE\.ssh\authorized_keys"
icacls "C:\ProgramData\ssh\administrators_authorized_keys"
```

6. **Verify keys are in the correct format** (single line, no breaks):

```powershell
Get-Content "$env:USERPROFILE\.ssh\authorized_keys"
Get-Content "C:\ProgramData\ssh\administrators_authorized_keys"
```

### Auto-Configuration Still Shows "unknown"

1. **Test SSH manually** from backend:

```bash
ssh Administrator@91.99.23.239 "powershell -Command \"\$PSVersionTable.PSVersion.Major\""
```

2. **Check backend logs**:

```bash
pm2 logs nexusvpn-backend --lines 50 | grep "91.99.23.239"
```

3. **Verify SSH key path** on backend:

```bash
ls -la /root/.ssh/nexusvpn_key*
```

## Quick Reference

### Get SSH Public Key (Backend)
```bash
cat /root/.ssh/nexusvpn_key.pub
```

### Test SSH Connection (Backend)
```bash
ssh Administrator@91.99.23.239
```

### Check OpenSSH Service (Windows)
```powershell
Get-Service sshd
```

### Restart OpenSSH Service (Windows)
```powershell
Restart-Service sshd
```

---

**After fixing SSH, the auto-configuration should work perfectly!** 🚀

