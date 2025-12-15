# 🎯 Production Next Steps Guide

After completing the production setup, follow these steps to fully configure your NexusVPN deployment.

## 📋 Step 1: Add Real VPN Servers

### Access Admin Panel
1. Login to your admin account:
   - URL: http://5.161.91.222:5173/#/admin
   - Email: `admin@nexusvpn.com`
   - Password: `password`

### Add VPN Server
1. Go to **Admin Panel** → **Servers** tab
2. Click **"Add Server"** button
3. Fill in server details:
   ```
   Name: US East Node
   City: New York
   Country: United States
   Country Code: US
   IPv4: YOUR_VPN_SERVER_IP
   Premium: false
   SSH User: root (or your SSH user)
   ```

### Configure SSH Access
For the backend to manage WireGuard on remote servers, you need SSH access:

**Option A: Password Authentication (Temporary)**
- The system will prompt for password on first connection
- Not recommended for production

**Option B: SSH Key Authentication (Recommended)**
```bash
# On your NexusVPN server, copy the public key
cat /opt/nexusvpn/.ssh/id_rsa.pub

# On your VPN node server, add the key
ssh root@YOUR_VPN_NODE_IP
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

**Option C: Copy SSH Key to VPN Node**
```bash
# From NexusVPN server
ssh-copy-id -i /opt/nexusvpn/.ssh/id_rsa.pub root@YOUR_VPN_NODE_IP
```

### Verify SSH Connection
```bash
# Test SSH from NexusVPN server
ssh -i /opt/nexusvpn/.ssh/id_rsa root@YOUR_VPN_NODE_IP "uname -a"
```

---

## 🔐 Step 2: Configure SSH Access to VPN Nodes

### Generate SSH Key (If Not Already Done)
```bash
# Already done during setup, but if needed:
ssh-keygen -t rsa -b 4096 -f /opt/nexusvpn/.ssh/id_rsa -N ""
chmod 600 /opt/nexusvpn/.ssh/id_rsa
chmod 644 /opt/nexusvpn/.ssh/id_rsa.pub
```

### Distribute Public Key to VPN Nodes

**For Each VPN Server:**
```bash
# Method 1: Using ssh-copy-id
ssh-copy-id -i /opt/nexusvpn/.ssh/id_rsa.pub root@VPN_NODE_IP

# Method 2: Manual copy
cat /opt/nexusvpn/.ssh/id_rsa.pub | ssh root@VPN_NODE_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Test SSH Connection
```bash
# Test from NexusVPN server
ssh -i /opt/nexusvpn/.ssh/id_rsa root@VPN_NODE_IP "echo 'SSH connection successful'"
```

### Update Backend Configuration
The backend should automatically use the SSH key. Verify:
```bash
# Check backend .env
grep SSH_PRIVATE_KEY_PATH /opt/nexusvpn/backend/.env

# Should show:
# SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
# MOCK_SSH=false
```

### Restart Backend
```bash
pm2 restart nexusvpn-backend
pm2 logs nexusvpn-backend
```

---

## 🔒 Step 3: Setup SSL Certificates (Let's Encrypt)

### Prerequisites
- Domain name pointing to your server IP (5.161.91.222)
- Ports 80 and 443 open in firewall

### Install Certbot
```bash
apt update
apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
# Replace 'yourdomain.com' with your actual domain
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-Renewal (Already Configured)
Certbot automatically sets up renewal. Test it:
```bash
certbot renew --dry-run
```

### Update Nginx Configuration
After getting SSL, update Nginx config:
```bash
nano /etc/nginx/sites-available/nexusvpn
```

Update the SSL section:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config
}
```

### Update Backend CORS
```bash
# Update backend .env
nano /opt/nexusvpn/backend/.env

# Change:
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Restart backend
pm2 restart nexusvpn-backend
```

### Update Frontend API URL
```bash
# Update frontend .env
nano /opt/nexusvpn/frontend/.env

# Change:
VITE_API_URL=https://yourdomain.com/api

# Restart frontend
pkill -f vite
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
```

---

## 🧪 Step 4: Verify Everything Works

### Test Backend API
```bash
# Health check
curl http://5.161.91.222:3000/api/health

# Should return:
# {"status":"ok","info":{...},"error":{}}
```

### Test Frontend
```bash
# Check if frontend is serving
curl -I http://5.161.91.222:5173

# Should return HTTP 200
```

### Test Admin Panel
1. Visit: http://5.161.91.222:5173/#/admin
2. Login with admin credentials
3. Check if you can:
   - View dashboard
   - Add servers
   - Manage users

### Test VPN Server Connection
1. In admin panel, add a server
2. The system should attempt to fetch WireGuard public key via SSH
3. Check backend logs:
   ```bash
   pm2 logs nexusvpn-backend | grep -i ssh
   ```

---

## 🔧 Step 5: Additional Configuration

### Configure Email Service (Optional)
```bash
# Edit backend .env
nano /opt/nexusvpn/backend/.env

# Add email configuration:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Configure Stripe Payments (Optional)
```bash
# Edit backend .env
nano /opt/nexusvpn/backend/.env

# Add Stripe keys:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setup Monitoring (Optional)
```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# View system resources
htop
```

---

## 📊 Step 6: Production Checklist

- [ ] Real VPN servers added in admin panel
- [ ] SSH keys configured for VPN nodes
- [ ] SSH connection tested successfully
- [ ] SSL certificates installed (if using domain)
- [ ] Domain configured (if using domain)
- [ ] CORS updated for HTTPS (if using SSL)
- [ ] Backend restarted with new config
- [ ] Frontend restarted with new config
- [ ] Admin panel accessible
- [ ] Health checks passing
- [ ] Auto-deployment working
- [ ] Email service configured (optional)
- [ ] Payment gateway configured (optional)

---

## 🐛 Troubleshooting

### SSH Connection Issues
```bash
# Check SSH key permissions
ls -la /opt/nexusvpn/.ssh/

# Test SSH manually
ssh -v -i /opt/nexusvpn/.ssh/id_rsa root@VPN_NODE_IP

# Check backend logs
pm2 logs nexusvpn-backend | grep -i ssh
```

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew manually
certbot renew

# Check Nginx config
nginx -t
```

### Backend Not Connecting to VPN Nodes
```bash
# Verify MOCK_SSH is false
grep MOCK_SSH /opt/nexusvpn/backend/.env

# Check SSH key path
grep SSH_PRIVATE_KEY_PATH /opt/nexusvpn/backend/.env

# View backend logs
pm2 logs nexusvpn-backend --lines 50
```

---

## 📚 Additional Resources

- **Admin Panel**: http://5.161.91.222:5173/#/admin
- **Backend API Docs**: http://5.161.91.222:3000/api/docs (if Swagger enabled)
- **PM2 Monitoring**: `pm2 monit`
- **Deployment Logs**: `tail -f /var/log/nexusvpn-deploy.log`
- **Backend Logs**: `pm2 logs nexusvpn-backend`
- **Frontend Logs**: `tail -f /tmp/frontend.log`

---

**🎉 Your NexusVPN is now production-ready with real data!**

