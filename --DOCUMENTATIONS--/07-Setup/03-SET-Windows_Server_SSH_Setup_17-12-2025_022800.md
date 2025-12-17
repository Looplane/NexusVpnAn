# 🔐 Windows Server 2019 SSH Setup Guide

**Document ID:** SET-WIN-SSH-001  
**Created:** 17-12-2025 | Time: 02:28:00  
**Last Updated:** 17-12-2025 | Time: 02:28:00

**Related Documents:**
- @--DOCUMENTATIONS--/07-Setup/02-SET-Add_VPN_Servers_Guide_17-12-2025_022800.md
- @--DOCUMENTATIONS--/08-Fixes/01-FIX-Windows_SSH_Auto_Config_17-12-2025_022800.md

---

## 📋 Overview

This guide will help you enable and configure SSH on Windows Server 2019 for both your WireGuard VPN servers:
- **Server 1**: `46.62.201.239`
- **Server 2**: `91.99.23.239`

NexusVPN needs SSH access to manage WireGuard on these servers.

---

## ✅ Step 1: Check if SSH is Already Enabled

**On each Windows Server (PowerShell as Administrator):**

```powershell
# Check if OpenSSH Server is installed
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

# Check if SSH service is running
Get-Service sshd
```

**If you see:**
- ✅ `State: Running` → SSH is already enabled! Skip to Step 3.
- ❌ `State: Stopped` → Continue to Step 2.
- ❌ Service not found → Continue to Step 2.

---

## 🔧 Step 2: Install and Enable OpenSSH Server

**On each Windows Server (PowerShell as Administrator):**

### Install OpenSSH Server:

```powershell
# Install OpenSSH Server feature
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Verify installation
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'
```

### Start and Enable SSH Service:

```powershell
# Start SSH service
Start-Service sshd

# Set SSH service to start automatically
Set-Service -Name sshd -StartupType 'Automatic'

# Verify service is running
Get-Service sshd
```

### Configure Windows Firewall:

```powershell
# Allow SSH through firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22

# Verify firewall rule
Get-NetFirewallRule -Name sshd
```

---

## 🔑 Step 3: Configure SSH Key Authentication

### Option A: Password Authentication (Quick but Less Secure)

**For testing purposes, you can use password authentication:**

```powershell
# SSH is now accessible with username/password
# NexusVPN will prompt for password on first connection
```

**Note:** For production, use SSH key authentication (Option B).

### Option B: SSH Key Authentication (Recommended)

**On NexusVPN Server (5.161.91.222):**

```bash
# Get the SSH public key
cat /opt/nexusvpn/.ssh/id_rsa.pub

# Copy the entire output (starts with ssh-rsa or ssh-ed25519)
```

**On Windows Server 1 (46.62.201.216) - PowerShell as Administrator:**

```powershell
# Create .ssh directory for Administrator user
$sshPath = "$env:USERPROFILE\.ssh"
New-Item -ItemType Directory -Force -Path $sshPath

# Set correct permissions
icacls $sshPath /inheritance:r
icacls $sshPath /grant "Administrator:F"

# Add NexusVPN public key to authorized_keys
$pubKey = "PASTE_PUBLIC_KEY_FROM_NEXUSVPN_SERVER_HERE"
Add-Content -Path "$sshPath\authorized_keys" -Value $pubKey

# Set permissions on authorized_keys (critical!)
icacls "$sshPath\authorized_keys" /inheritance:r
icacls "$sshPath\authorized_keys" /grant "Administrator:F"
```

**On Windows Server 2 (91.99.23.239) - Repeat the same steps:**

```powershell
# Create .ssh directory
$sshPath = "$env:USERPROFILE\.ssh"
New-Item -ItemType Directory -Force -Path $sshPath

# Set permissions
icacls $sshPath /inheritance:r
icacls $sshPath /grant "Administrator:F"

# Add NexusVPN public key
$pubKey = "PASTE_SAME_PUBLIC_KEY_HERE"
Add-Content -Path "$sshPath\authorized_keys" -Value $pubKey

# Set permissions
icacls "$sshPath\authorized_keys" /inheritance:r
icacls "$sshPath\authorized_keys" /grant "Administrator:F"
```

---

## 🧪 Step 4: Test SSH Connection

**From NexusVPN Server (5.161.91.222):**

```bash
# Test Server 1
ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@46.62.201.216 "echo 'SSH works!'"

# Test Server 2
ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@91.99.23.239 "echo 'SSH works!'"
```

**Expected output:**
```
SSH works!
```

**If you get errors:**
- `Permission denied` → Check SSH key permissions (Step 3)
- `Connection refused` → Check if SSH service is running (Step 2)
- `Host key verification failed` → Run: `ssh-keygen -R 46.62.201.216`

---

## 🔍 Step 5: Verify SSH Configuration

**On Windows Server (PowerShell as Administrator):**

```powershell
# Check SSH service status
Get-Service sshd

# Check SSH configuration
Get-Content C:\ProgramData\ssh\sshd_config

# View SSH logs
Get-Content C:\ProgramData\ssh\logs\sshd.log -Tail 50
```

---

## ⚙️ Step 6: Configure SSH for WireGuard Management

**Important:** NexusVPN needs to execute commands as Administrator. Configure SSH to allow this:

**On Windows Server (PowerShell as Administrator):**

```powershell
# Edit SSH config
notepad C:\ProgramData\ssh\sshd_config

# Add or modify these lines:
# PermitRootLogin yes
# PubkeyAuthentication yes
# PasswordAuthentication no  (if using keys)
# AllowUsers Administrator

# Restart SSH service
Restart-Service sshd
```

---

## 🛠️ Step 7: Test WireGuard Commands via SSH

**From NexusVPN Server:**

```bash
# Test basic command
ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@46.62.201.216 "whoami"

# Test WireGuard command (if WireGuard is installed)
ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@46.62.201.216 "wg --version"

# Test system info
ssh -i /opt/nexusvpn/.ssh/id_rsa Administrator@46.62.201.216 "systeminfo | findstr /B /C:\"OS Name\""
```

---

## 🔐 Step 8: Windows Server WireGuard SSH Commands

**Note:** Since WireGuard on Windows runs as a service, you may need to use different commands:

**For Windows WireGuard (via WireGuard.exe):**

```powershell
# Check WireGuard status
Get-Service WireGuardTunnel*

# Get WireGuard config path
# Usually: C:\Program Files\WireGuard\Data\Configurations\

# List active tunnels
# Use WireGuard GUI or check service status
```

**For NexusVPN to manage Windows WireGuard:**

The backend will need to:
1. SSH into Windows Server
2. Execute PowerShell commands to manage WireGuard
3. Read WireGuard configuration files

**Example PowerShell commands for NexusVPN:**

```powershell
# Get WireGuard public key (if stored in file)
Get-Content "C:\Program Files\WireGuard\Data\Configurations\wg0.conf" | Select-String "PublicKey"

# Get WireGuard peers count
# This requires parsing the config file or using WireGuard API
```

---

## ⚠️ Important Notes

1. **Windows WireGuard:** WireGuard on Windows runs differently than Linux:
   - Uses WireGuard.exe service
   - Config files in: `C:\Program Files\WireGuard\Data\Configurations\`
   - Public key may be in config file, not `/etc/wireguard/publickey`

2. **SSH User:** NexusVPN uses `root` by default, but Windows uses `Administrator`
   - Update server record in database: `sshUser = 'Administrator'`

3. **Command Differences:** Windows commands differ from Linux:
   - `cat` → `Get-Content` or `type`
   - `wg show` → May need PowerShell script to read WireGuard config
   - `systemctl` → `Get-Service` / `Start-Service`

4. **Permissions:** Windows file permissions are stricter:
   - Always set correct permissions on `.ssh` and `authorized_keys`
   - Use `icacls` to set permissions

---

## 🔧 Troubleshooting

### SSH Connection Refused

```powershell
# Check if SSH service is running
Get-Service sshd

# Check if port 22 is listening
netstat -an | findstr :22

# Check firewall
Get-NetFirewallRule -Name sshd
```

### Permission Denied

```powershell
# Check authorized_keys permissions
icacls "$env:USERPROFILE\.ssh\authorized_keys"

# Should show: Administrator:F (Full control)
# If not, run:
icacls "$env:USERPROFILE\.ssh\authorized_keys" /inheritance:r
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant "Administrator:F"
```

### SSH Key Not Working

```powershell
# Check SSH logs
Get-Content C:\ProgramData\ssh\logs\sshd.log -Tail 50

# Verify public key format
Get-Content "$env:USERPROFILE\.ssh\authorized_keys"
# Should be one line starting with: ssh-rsa or ssh-ed25519
```

---

## ✅ Success Checklist

- [ ] OpenSSH Server installed
- [ ] SSH service running and set to auto-start
- [ ] Firewall rule allows port 22
- [ ] `.ssh` directory created with correct permissions
- [ ] NexusVPN public key added to `authorized_keys`
- [ ] `authorized_keys` has correct permissions
- [ ] SSH connection test successful from NexusVPN server
- [ ] WireGuard commands can be executed via SSH

---

**Once SSH is configured, add the servers to NexusVPN admin panel!**

See: @--DOCUMENTATIONS--/07-Setup/04-SET-Step_By_Step_Add_Servers_17-12-2025_022800.md

---

**Last Updated:** 17-12-2025 | Time: 02:28:00

