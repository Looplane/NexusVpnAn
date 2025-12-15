# 🚀 NexusVPN Single-Command Installation

## 📋 For Fresh Ubuntu 24.04 Server

### ⚡ Single Command (Copy & Paste)

Connect to your Ubuntu server via **PuTTY** or **SSH** and run:

```bash
curl -sSL https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh | sudo bash
```

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

### If `curl` doesn't work:
```bash
wget -O /tmp/auto-install.sh https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh
chmod +x /tmp/auto-install.sh
sudo /tmp/auto-install.sh
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

