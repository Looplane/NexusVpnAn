# Ubuntu 24.04 Server Deployment Guide

## 🎯 Overview
This guide will help you deploy a complete development environment on your Hetzner Ubuntu 24.04 VPS (IP: 5.161.91.222) with all the requested features.

## 📋 What's Included
- ✅ **All Database Systems**: MongoDB, Redis, MySQL, PostgreSQL
- ✅ **Web Hosting Panel**: aaPanel (open-source cPanel alternative)
- ✅ **Server GUI**: Cockpit for easy server management
- ✅ **Complete Node.js Stack**: NestJS, Next.js, Express, Vite
- ✅ **Security**: UFW Firewall, Fail2ban, SSL certificates
- ✅ **VPN**: WireGuard VPN server
- ✅ **Monitoring**: Prometheus and Node Exporter
- ✅ **Backups**: Automated daily database backups
- ✅ **Documentation**: Comprehensive setup guides

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)
1. **Connect to your server**:
   ```bash
   ssh root@5.161.91.222
   # Password: #HaseebChaChu02110@
   ```

2. **Download and run the setup script**:
   ```bash
   wget -O setup.sh https://raw.githubusercontent.com/your-repo/ubuntu-dev-environment-setup.sh
   chmod +x setup.sh
   sudo ./setup.sh
   ```

3. **Wait for completion** (15-30 minutes)

### Option 2: Manual Step-by-Step Setup
Use the individual agent scripts in the `agents` directory for custom deployment.

## 🔧 Access Information

### Web Panels
- **Cockpit (Server Management)**: https://5.161.91.222:9090
- **aaPanel (Web Hosting)**: http://5.161.91.222:7800

### Database Connections
- **MongoDB**: `mongodb://nexusvpn:NexusVPN_MongoDB_2024!@5.161.91.222:27017/nexusvpn`
- **Redis**: `redis://:Redis_Secure_Password_2024!@5.161.91.222:6379`
- **MySQL**: `mysql://root:MySQL_Root_Password_2024!@5.161.91.222:3306/nexusvpn`
- **PostgreSQL**: `postgresql://nexusvpn:NexusVPN_PostgreSQL_2024!@5.161.91.222:5432/nexusvpn`

### Services Ports
- **SSH**: 22
- **HTTP**: 80
- **HTTPS**: 443
- **Node.js Apps**: 3000, 3001
- **MongoDB**: 27017
- **Redis**: 6379
- **MySQL**: 3306
- **PostgreSQL**: 5432
- **WireGuard**: 51820/UDP

## 📖 Detailed Setup Instructions

### Step 1: Server Connection
Connect to your Ubuntu server using any SSH client:
```bash
ssh root@5.161.91.222
```

### Step 2: System Update
Update your system packages:
```bash
apt update && apt upgrade -y
```

### Step 3: Run Setup Script
Execute the comprehensive setup script:
```bash
wget -O setup.sh https://raw.githubusercontent.com/your-repo/ubuntu-dev-environment-setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

### Step 4: Configure Web Panels

#### aaPanel Configuration
1. Access: http://5.161.91.222:7800
2. Follow the setup wizard
3. Create your admin account
4. Install recommended web server stack (Nginx/Apache, PHP, MySQL)

#### Cockpit Configuration
1. Access: https://5.161.91.222:9090
2. Accept the self-signed certificate
3. Login with your server credentials

## 🔒 Security Configuration

### Firewall Rules
The setup automatically configures UFW firewall with these rules:
```bash
# Check firewall status
ufw status verbose

# Essential ports allowed:
# 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000-3001 (Node.js)
# 27017 (MongoDB), 6379 (Redis), 3306 (MySQL), 5432 (PostgreSQL)
# 51820/UDP (WireGuard), 9090 (Cockpit), 7800 (aaPanel)
```

### Fail2ban Protection
Fail2ban is installed and configured to protect against brute force attacks:
```bash
# Check fail2ban status
fail2ban-client status

# View banned IPs
fail2ban-client status sshd
```

### SSL Certificates
Self-signed certificates are generated for testing. For production:
```bash
# Install Let's Encrypt certificates
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

## 🗄️ Database Management

### MongoDB
```bash
# Connect to MongoDB
mongosh -u nexusvpn -p NexusVPN_MongoDB_2024! --authenticationDatabase admin

# Create database
use nexusvpn
db.createCollection("users")
```

### Redis
```bash
# Connect to Redis
redis-cli -a Redis_Secure_Password_2024!

# Test connection
ping
```

### MySQL
```bash
# Connect to MySQL
mysql -u root -pMySQL_Root_Password_2024!

# Use nexusvpn database
USE nexusvpn;
```

### PostgreSQL
```bash
# Connect to PostgreSQL
psql -U nexusvpn -d nexusvpn -h localhost

# List databases
\l
```

## 🚀 Node.js Development

### Available Frameworks
- **NestJS**: `nest new project-name`
- **Next.js**: `npx create-next-app@latest`
- **Express**: Templates available in `/opt/templates/`
- **Vite**: `npm create vite@latest`

### PM2 Process Manager
```bash
# Start application with PM2
pm2 start app.js --name "my-app"

# List processes
pm2 list

# Monitor processes
pm2 monitor
```

## 📊 Monitoring

### Prometheus
Access Prometheus at: http://5.161.91.222:9090

### Node Exporter
View system metrics at: http://5.161.91.222:9100/metrics

### Custom Monitoring
```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## 💾 Backup System

### Automated Backups
Daily backups are configured to run at 2 AM:
- **Location**: `/opt/backups/databases/`
- **Retention**: 7 days
- **Databases**: MongoDB, MySQL, PostgreSQL, Redis

### Manual Backup
```bash
# Run backup manually
/opt/backup-databases.sh

# Check backup directory
ls -la /opt/backups/databases/
```

## 🌐 WireGuard VPN

### Server Configuration
WireGuard is automatically configured with:
- **Server IP**: 10.8.0.1/24
- **Port**: 51820/UDP
- **Key generation**: Automatic

### Client Setup
1. Install WireGuard on your client device
2. Generate client configuration
3. Connect to VPN

### Generate Client Config
```bash
# Generate client keys
cd /etc/wireguard
wg genkey | tee client-privatekey | wg pubkey > client-publickey

# Create client configuration
# (Detailed client setup instructions in /opt/documentation/)
```

## 🔧 Troubleshooting

### Common Issues

#### Port Access Problems
```bash
# Check if port is listening
netstat -tlnp | grep :PORT_NUMBER

# Check firewall
ufw status | grep PORT_NUMBER

# Test port connectivity
telnet 5.161.91.222 PORT_NUMBER
```

#### Service Not Starting
```bash
# Check service status
systemctl status SERVICE_NAME

# View service logs
journalctl -u SERVICE_NAME -f

# Restart service
systemctl restart SERVICE_NAME
```

#### Database Connection Issues
```bash
# Test MongoDB
mongosh --eval "db.adminCommand('ping')"

# Test Redis
redis-cli ping

# Test MySQL
mysql -u root -p -e "SELECT 1"

# Test PostgreSQL
sudo -u postgres psql -c "SELECT 1"
```

### Log Files
- **Setup log**: `/var/log/nexusvpn-setup.log`
- **MongoDB**: `/var/log/mongodb/mongod.log`
- **Redis**: `/var/log/redis/redis-server.log`
- **MySQL**: `/var/log/mysql/error.log`
- **PostgreSQL**: `/var/log/postgresql/postgresql-*.log`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/syslog`

## 📚 Additional Resources

### Documentation Location
All documentation is available at: `/opt/documentation/`

### Quick Reference
Keep this handy reference:
- **Server IP**: 5.161.91.222
- **SSH Access**: `ssh root@5.161.91.222`
- **Cockpit**: https://5.161.91.222:9090
- **aaPanel**: http://5.161.91.222:7800

### Support Commands
```bash
# System information
/opt/security-check.sh

# Service status check
systemctl status mongod redis-server mysql postgresql nginx cockpit

# Resource usage
htop
df -h
free -h
```

## 🎉 Next Steps

1. **Configure aaPanel** for web hosting management
2. **Set up your domains** in nginx
3. **Deploy your applications** using the provided templates
4. **Configure SSL certificates** with Let's Encrypt for production
5. **Set up additional monitoring** if needed
6. **Create VPN clients** for secure remote access

## 📞 Support

If you encounter any issues:
1. Check the log files mentioned above
2. Review the troubleshooting section
3. Check service status with `systemctl status`
4. Verify firewall rules with `ufw status`

---

**🎊 Congratulations!** Your Ubuntu 24.04 development environment is now ready for production use!