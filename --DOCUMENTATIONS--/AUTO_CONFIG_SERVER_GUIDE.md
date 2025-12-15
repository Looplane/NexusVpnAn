# 🚀 Auto-Configuration System for VPN Servers

## Overview

NexusVPN now includes a comprehensive **Auto-Configuration System** that automatically detects, configures, and adds VPN servers to your infrastructure with a single click. This system eliminates the need for manual server setup and configuration.

## ✨ Features

### 🔍 Automatic OS Detection
- **Windows Server** (2012, 2016, 2019, 2022)
- **Linux Distributions** (Ubuntu, Debian, CentOS, RHEL, Fedora)
- **macOS** (Server and Desktop)
- **Architecture Detection** (x64, ARM64, etc.)

### ✅ Requirement Checking
- SSH service status
- WireGuard installation and status
- Firewall configuration
- IP forwarding (Linux)
- Missing packages and dependencies

### 🛠️ Automatic Installation & Configuration
- **SSH Setup**: Configures OpenSSH Server and adds authorized keys
- **WireGuard Installation**: Installs WireGuard based on OS type
- **Firewall Configuration**: Sets up UFW (Linux) or Windows Firewall rules
- **IP Forwarding**: Enables IP forwarding on Linux servers
- **Service Management**: Starts and enables required services
- **Key Generation**: Generates WireGuard keys automatically

### 📊 Real-Time Progress Tracking
- Step-by-step progress display
- OS detection results
- Requirements status
- Configuration steps

## 🎯 Usage

### Option 1: Auto-Configuration (Recommended)

1. **Navigate to Admin Panel** → **VPN Servers** → **Add VPN Server**
2. **Select "Auto Config" mode** (default)
3. **Enter Server IP Address** and **SSH User** (default: root)
4. **Click "🔍 Detect Server & Check Requirements"**
   - System will detect OS type
   - Check all requirements
   - Display missing packages/services
5. **Fill in Server Details**:
   - Server Name
   - City
   - Country & Country Code
   - WireGuard Port (default: 51820)
6. **Click "🚀 Auto-Configure & Add Server"**
   - System will automatically:
     - Install missing packages
     - Configure SSH access
     - Install and configure WireGuard
     - Set up firewall rules
     - Enable IP forwarding (Linux)
     - Generate WireGuard keys
     - Add server to database

### Option 2: Manual Configuration

1. **Select "Manual" mode** in the Add VPN Server modal
2. **Ensure server is pre-configured**:
   - SSH access enabled
   - WireGuard installed and running
   - Firewall rules configured
3. **Enter server details** and click **"Add VPN Server"**
4. System will fetch WireGuard public key via SSH

## 🔧 Supported Operating Systems

### Windows Server
- **Detection**: PowerShell commands
- **SSH**: OpenSSH Server installation and configuration
- **WireGuard**: Windows WireGuard client installation
- **Firewall**: Windows Firewall rules
- **Config Path**: `C:\Program Files\WireGuard\Data\Configurations\`

### Linux (Ubuntu/Debian)
- **Detection**: `/etc/os-release` and `lsb_release`
- **Package Manager**: `apt-get`
- **WireGuard**: `wireguard` and `wireguard-tools` packages
- **Firewall**: UFW (Uncomplicated Firewall)
- **Config Path**: `/etc/wireguard/wg0.conf`

### Linux (CentOS/RHEL/Fedora)
- **Detection**: `/etc/os-release`
- **Package Manager**: `yum` or `dnf`
- **WireGuard**: `kmod-wireguard` and `wireguard-tools`
- **Firewall**: `iptables` or `firewalld`
- **Config Path**: `/etc/wireguard/wg0.conf`

### macOS
- **Detection**: `sw_vers` and `uname`
- **Package Manager**: Homebrew
- **WireGuard**: `wireguard-tools` via Homebrew
- **Config Path**: `/usr/local/etc/wireguard/`

## 📋 Requirements

### For Auto-Configuration:
- **SSH Access**: Server must be accessible via SSH
- **SSH User**: Must have sudo/administrator privileges
- **Network**: Server must be reachable from NexusVPN backend
- **Ports**: SSH (22/TCP) must be open

### For Manual Configuration:
- **SSH Access**: Configured and accessible
- **WireGuard**: Installed and running
- **Firewall**: Rules configured for WireGuard port (default: 51820/UDP)
- **Public Key**: WireGuard public key accessible

## 🔐 Security

### SSH Key Management
- Backend public key is automatically added to `~/.ssh/authorized_keys`
- Private key is stored securely on NexusVPN backend
- SSH connections use key-based authentication

### Firewall Rules
- **Linux**: UFW rules for SSH (22/TCP) and WireGuard (51820/UDP)
- **Windows**: Windows Firewall rules for SSH and WireGuard
- Rules are automatically configured during auto-setup

## 🐛 Troubleshooting

### Server Not Detected
- **Check SSH Access**: Ensure SSH is accessible from NexusVPN backend
- **Verify SSH User**: Ensure the SSH user has correct permissions
- **Check Firewall**: Ensure SSH port (22) is open

### Auto-Configuration Fails
- **Check Logs**: Review backend logs for detailed error messages
- **Verify Permissions**: Ensure SSH user has sudo/administrator privileges
- **Network Issues**: Check network connectivity between servers
- **OS Compatibility**: Ensure OS is supported (Windows/Linux/macOS)

### Server Not Appearing in Admin Panel
- **Check Database**: Verify server was added to database
- **Check isActive**: Ensure `isActive = true` in database
- **Refresh Panel**: Clear browser cache and refresh admin panel
- **Run Fix Script**: Use `infrastructure/fix-server-visibility.sh`

## 📝 API Endpoints

### Detect OS
```http
POST /api/admin/server-config/detect-os
Body: { "ipv4": "46.62.201.216", "sshUser": "root" }
```

### Check Requirements
```http
POST /api/admin/server-config/check-requirements
Body: { "ipv4": "46.62.201.216", "sshUser": "root" }
```

### Auto-Configure
```http
POST /api/admin/server-config/auto-configure
Body: {
  "ipv4": "46.62.201.216",
  "sshUser": "root",
  "name": "Frankfurt Node 1",
  "city": "Frankfurt",
  "country": "Germany",
  "countryCode": "DE",
  "wgPort": 51820
}
```

## 🎓 Best Practices

1. **Test Connection First**: Use "Detect Server & Check Requirements" before auto-configuring
2. **Review Requirements**: Check missing packages/services before proceeding
3. **Backup Configurations**: Backup existing WireGuard configs before auto-configuration
4. **Monitor Progress**: Watch the progress steps during auto-configuration
5. **Verify After Setup**: Check server status in admin panel after configuration

## 🔄 Workflow Diagram

```
User Clicks "Add VPN Server"
    ↓
Select Mode: Auto Config / Manual
    ↓
[Auto Config Mode]
    ↓
Enter IP & SSH User
    ↓
Click "Detect Server & Check Requirements"
    ↓
System Detects OS & Checks Requirements
    ↓
Display OS Info & Requirements Status
    ↓
Fill Server Details
    ↓
Click "Auto-Configure & Add Server"
    ↓
System Automatically:
  - Installs Missing Packages
  - Configures SSH
  - Installs WireGuard
  - Configures Firewall
  - Enables IP Forwarding
  - Generates Keys
  - Adds to Database
    ↓
Server Added Successfully!
```

## 📚 Related Documentation

- [Adding VPN Servers Guide](./ADD_VPN_SERVERS_GUIDE.md)
- [Windows Server 2019 Setup](./WINDOWS_SERVER_2019_SETUP.md)
- [Windows Server SSH Setup](./WINDOWS_SERVER_2019_SSH_SETUP.md)
- [Node Inspector Guide](./NODE_INSPECTOR_COMPLETE.md)

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

