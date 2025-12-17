# 🚀 NexusVPN Single-Command Installation

## ⚠️ IMPORTANT: Private Repository Setup

Since your GitHub repository is **private**, you cannot use `raw.githubusercontent.com` directly. Use one of the methods below.

## 📋 For Fresh Ubuntu 24.04 Server

### ⚡ Method 1: Clone Repository (Recommended for Private Repos)

**Step 1: Install prerequisites**
```bash
apt update && apt install -y git curl wget
```

**Step 2: Clone your private repository**
```bash
# Option A: HTTPS (will prompt for username/password or token)
git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn

# Option B: SSH (if you have SSH keys configured)
git clone git@github.com:Looplane/NexusVpnAn.git /tmp/nexusvpn
```

**Step 3: Run the installation script**
```bash
cd /tmp/nexusvpn
chmod +x infrastructure/auto-install-nexusvpn.sh
sudo ./infrastructure/auto-install-nexusvpn.sh
```

### ⚡ Method 2: One-Line Clone & Install

```bash
apt update && apt install -y git && git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn && cd /tmp/nexusvpn && chmod +x infrastructure/auto-install-nexusvpn.sh && sudo ./infrastructure/auto-install-nexusvpn.sh
```

**Note:** You'll be prompted for GitHub credentials (username + password/token)

---

## 📝 Step-by-Step Instructions

### 1. Connect to Your Server
```bash
ssh root@YOUR_SERVER_IP
# Or use PuTTY on Windows
```

### 2. Run the Installation Command
```bash
curl -sSL https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh | sudo bash
```

### 3. Wait for Installation
- **Time:** 10-20 minutes
- **What it does:** Installs everything automatically
- **Output:** Shows progress and final credentials

---

## ✅ What Gets Installed

- ✅ **PostgreSQL 16** - Database server
- ✅ **Node.js 20.x** - Runtime environment
- ✅ **PM2** - Process manager
- ✅ **Docker & Docker Compose** - Container platform
- ✅ **Nginx** - Web server
- ✅ **WireGuard** - VPN server
- ✅ **UFW Firewall** - Security
- ✅ **Fail2ban** - Intrusion prevention
- ✅ **NexusVPN Application** - Cloned from GitHub

---

## 📊 After Installation

The script will display:

1. **Database Credentials**
   - Database name: `nexusvpn`
   - Username: `nexusvpn`
   - Password: (auto-generated, **SAVE THIS!**)

2. **WireGuard Public Key**
   - Used for VPN server configuration

3. **Service Status**
   - All services running status

4. **Management Commands**
   - `nexusvpn-start` - Start all services
   - `nexusvpn-stop` - Stop all services
   - `nexusvpn-restart` - Restart all services
   - `nexusvpn-status` - Check service status

---

## 🔧 Alternative Installation Methods

### Method 3: Upload Script via SCP (From Windows)

**From your Windows machine with PuTTY/SCP:**

```powershell
# Using PowerShell or Command Prompt
scp infrastructure/auto-install-nexusvpn.sh root@YOUR_SERVER_IP:/tmp/

# Then SSH to server and run:
ssh root@YOUR_SERVER_IP
chmod +x /tmp/auto-install-nexusvpn.sh
sudo /tmp/auto-install-nexusvpn.sh
```

### Method 4: Create Script Manually on Server

**Copy the script content and create it directly:**

```bash
# Create the script file
nano /tmp/auto-install-nexusvpn.sh

# Paste the entire script content (see infrastructure/auto-install-nexusvpn.sh)
# Press Ctrl+X, then Y, then Enter to save

# Make it executable and run
chmod +x /tmp/auto-install-nexusvpn.sh
sudo /tmp/auto-install-nexusvpn.sh
```

### Method 5: Use GitHub Personal Access Token

```bash
# First, create a GitHub Personal Access Token with 'repo' scope
# GitHub → Settings → Developer settings → Personal access tokens

# Then use it:
GITHUB_TOKEN="your_token_here"
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh \
  | sudo bash
```

### Manual Download:
```bash
# Download the script
wget https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh

# Make it executable
chmod +x auto-install-nexusvpn.sh

# Run it
sudo ./auto-install-nexusvpn.sh
```

---

## 🎯 Next Steps After Installation

1. **Save the Database Password** - You'll need it for backend configuration
2. **Review Configuration** - Check `/opt/nexusvpn/backend/.env`
3. **Start Services** - Run `nexusvpn-start`
4. **Access Frontend** - Open `http://YOUR_SERVER_IP:5173`
5. **Configure Domain** - Set up SSL certificates if needed

---

## 🆘 Troubleshooting

### Script fails to download:
- Check internet connection
- Verify GitHub repository is accessible
- Try using `wget` instead of `curl`

### Installation errors:
- Check logs: `/var/log/nexusvpn-setup.log` (if created)
- Ensure you're running as root: `sudo bash`
- Check disk space: `df -h`
- Check memory: `free -h`

### Services not starting:
- Check status: `nexusvpn-status`
- View logs: `pm2 logs`
- Check PostgreSQL: `systemctl status postgresql`
- Check Docker: `systemctl status docker`

---

## 📞 Support

For issues or questions:
1. Check the installation logs
2. Review service status with `nexusvpn-status`
3. Consult the main deployment guide: `UBUNTU_DEPLOYMENT_GUIDE.md`

---

**🎉 That's it! One command to rule them all!**

