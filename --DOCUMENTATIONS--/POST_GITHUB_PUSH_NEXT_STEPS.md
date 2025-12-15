# 🚀 Next Steps After GitHub Push

## ✅ Current Status
- ✅ Code committed and pushed to GitHub
- ✅ Server live at 5.161.91.222
- ✅ Real data mode implemented
- ✅ Auto-deployment configured

---

## 📋 Immediate Next Steps (Run on Server)

### Step 1: Pull Latest Code & Run Production Setup

**SSH to your server and run:**

```bash
# 1. Navigate to deployment directory
cd /opt/nexusvpn

# 2. Pull latest code from GitHub
git pull origin main

# 3. Run production setup (if not already done)
sudo ./infrastructure/setup-production-simple.sh
```

**Or if the script doesn't exist yet, create and run it:**

```bash
cd /opt/nexusvpn
cat > /tmp/setup-prod.sh << 'EOF'
#!/bin/bash
set -e
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
info() { echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"; }
DEPLOYMENT_DIR="/opt/nexusvpn"
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "========================================="
echo "  🚀 Production Setup (REAL DATA MODE)"
echo "========================================="
log "Configuring backend..."
cd "$DEPLOYMENT_DIR/backend"
DB_PASSWORD=$(grep "DB_PASSWORD" .env 2>/dev/null | cut -d "=" -f2 | tr -d " " || echo "sCEAMgreErEqlV8zgP36p7R9Z")
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
cat > .env.production << ENVFILE
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=nexusvpn
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=nexusvpn
DATABASE_URL=postgresql://nexusvpn:${DB_PASSWORD}@localhost:5432/nexusvpn
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d
FRONTEND_URL=http://${SERVER_IP}:5173
CORS_ORIGIN=http://${SERVER_IP}:5173
SSH_PRIVATE_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa
SSH_PUBLIC_KEY_PATH=/opt/nexusvpn/.ssh/id_rsa.pub
MOCK_SSH=false
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
LOG_LEVEL=info
SWAGGER_ENABLED=false
ENVFILE
sed -i 's/MOCK_SSH=.*/MOCK_SSH=false/g' .env 2>/dev/null || echo "MOCK_SSH=false" >> .env
log "Backend configured (REAL DATA MODE)"
cd "$DEPLOYMENT_DIR/frontend"
cat > .env.production << ENVFILE
VITE_API_URL=http://${SERVER_IP}:3000/api
VITE_APP_NAME=NexusVPN
VITE_APP_VERSION=1.0.0
ENVFILE
sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://${SERVER_IP}:3000/api|g" .env 2>/dev/null || echo "VITE_API_URL=http://${SERVER_IP}:3000/api" >> .env
log "Frontend configured"
mkdir -p /opt/nexusvpn/.ssh /var/log/nexusvpn
chmod 700 /opt/nexusvpn/.ssh
[ ! -f "/opt/nexusvpn/.ssh/id_rsa" ] && ssh-keygen -t rsa -b 4096 -f /opt/nexusvpn/.ssh/id_rsa -N "" -q && log "SSH key generated"
chmod 600 /opt/nexusvpn/.ssh/id_rsa && chmod 644 /opt/nexusvpn/.ssh/id_rsa.pub
log "SSH keys ready"
cat > "$DEPLOYMENT_DIR/backend/ecosystem.config.js" << PM2FILE
module.exports = { apps: [{ name: 'nexusvpn-backend', script: './dist/main.js', cwd: '/opt/nexusvpn/backend', instances: 1, exec_mode: 'fork', env: { NODE_ENV: 'production', PORT: 3000 }, autorestart: true, watch: false, max_memory_restart: '500M', error_file: '/var/log/nexusvpn/backend-error.log', out_file: '/var/log/nexusvpn/backend-out.log', log_date_format: 'YYYY-MM-DD HH:mm:ss Z', merge_logs: true }] };
PM2FILE
log "PM2 configured"
cat > /etc/nginx/sites-available/nexusvpn << NGINXFILE
upstream nexusvpn_backend { server localhost:3000; keepalive 64; }
upstream nexusvpn_frontend { server localhost:5173; keepalive 64; }
server { listen 80; server_name ${SERVER_IP}; location /api { proxy_pass http://nexusvpn_backend; proxy_http_version 1.1; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; } location / { proxy_pass http://nexusvpn_frontend; proxy_http_version 1.1; proxy_set_header Host \$host; } }
NGINXFILE
ln -sf /etc/nginx/sites-available/nexusvpn /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx
log "Nginx configured"
cat > "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh" << DEPLOYFILE
#!/bin/bash
cd /opt/nexusvpn && git fetch origin main && LOCAL=\$(git rev-parse HEAD) && REMOTE=\$(git rev-parse origin/main) && if [ "\$LOCAL" != "\$REMOTE" ]; then git pull origin main && cd backend && npm ci --production && npm run build && pm2 restart nexusvpn-backend && cd ../frontend && npm ci && pkill -f vite; sleep 2 && nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 & fi
DEPLOYFILE
chmod +x "$DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh"
(crontab -l 2>/dev/null | grep -v "github-auto-deploy.sh"; echo "*/5 * * * * $DEPLOYMENT_DIR/infrastructure/github-auto-deploy.sh >> /var/log/nexusvpn-deploy.log 2>&1") | crontab -
log "Auto-deployment configured"
cd "$DEPLOYMENT_DIR/backend" && pm2 delete nexusvpn-backend 2>/dev/null || true && pm2 start ecosystem.config.js || pm2 start dist/main.js --name nexusvpn-backend && pm2 save
pkill -f vite || true && sleep 2 && cd "$DEPLOYMENT_DIR/frontend" && nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
echo "" && echo "=========================================" && echo "  ✅ Production Setup Complete!" && echo "=========================================" && echo "" && echo "🌐 URLs:" && echo "   Frontend: http://${SERVER_IP}:5173" && echo "   Backend: http://${SERVER_IP}:3000/api" && echo "   Proxy: http://${SERVER_IP}" && echo "" && echo "🔧 Mode: REAL DATA (MOCK_SSH=false)" && echo "📋 Auto-deploy: Every 5 minutes" && echo ""
EOF
chmod +x /tmp/setup-prod.sh && /tmp/setup-prod.sh
```

### Step 2: Verify Auto-Deployment

```bash
# Check if auto-deployment is working
tail -f /var/log/nexusvpn-deploy.log

# Or manually trigger deployment
/opt/nexusvpn/infrastructure/github-auto-deploy.sh
```

### Step 3: Verify Services

```bash
# Check backend
pm2 list
pm2 logs nexusvpn-backend --lines 20

# Check frontend
ps aux | grep vite
tail -20 /tmp/frontend.log

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:5173
```

---

## 🎯 Phase 3 Completion: Real VPN Integration

According to agents, you're in **Phase 3: The Wire** (50% complete). Next milestones:

### ✅ Completed
- [x] Production deployment
- [x] Real data mode
- [x] SSH service ready
- [x] WireGuard key generation

### 🔜 Next: Add Real VPN Servers

**Option A: Use Current Server as VPN Node**
Your current server (5.161.91.222) already has WireGuard installed. You can use it as a VPN node:

1. **Get WireGuard Public Key:**
   ```bash
   cat /etc/wireguard/publickey
   ```

2. **Add Server in Admin Panel:**
   - Go to: http://5.161.91.222:5173/#/admin
   - Login: `admin@nexusvpn.com` / `password`
   - Servers tab → Add Server:
     ```
     Name: Main Server
     City: Frankfurt
     Country: Germany
     Country Code: DE
     IPv4: 5.161.91.222
     SSH User: root
     ```

3. **Test VPN Config Generation:**
   - Go to Dashboard
   - Select server location
   - Generate config
   - Should create real WireGuard config

**Option B: Add Additional VPN Servers**
If you have other VPS servers:

1. **Provision VPN Node:**
   ```bash
   # On the new VPN server, run the provisioning script
   # The admin panel can generate this script for you
   ```

2. **Configure SSH Access:**
   ```bash
   # From NexusVPN server (5.161.91.222)
   ssh-copy-id -i /opt/nexusvpn/.ssh/id_rsa.pub root@NEW_VPN_SERVER_IP
   ```

3. **Add in Admin Panel:**
   - Same as Option A, but use the new server IP

---

## 🔧 Additional Configuration

### 1. Install Management Panels (Optional)

```bash
cd /opt/nexusvpn
sudo ./infrastructure/install-management-panels.sh
```

**Access:**
- Cockpit: https://5.161.91.222:9090
- aaPanel: http://5.161.91.222:7800

### 2. Setup SSL (If You Have a Domain)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com

# Update backend CORS
nano /opt/nexusvpn/backend/.env
# Change FRONTEND_URL and CORS_ORIGIN to https://yourdomain.com
pm2 restart nexusvpn-backend
```

### 3. Configure Email Service (Optional)

```bash
# Edit backend .env
nano /opt/nexusvpn/backend/.env

# Add:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

pm2 restart nexusvpn-backend
```

### 4. Configure Stripe Payments (Optional)

```bash
# Edit backend .env
nano /opt/nexusvpn/backend/.env

# Add:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

pm2 restart nexusvpn-backend
```

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Login/Register works
- [ ] Admin panel accessible
- [ ] Can add servers in admin
- [ ] Can generate VPN configs
- [ ] Config files are valid WireGuard format

### Real Data Verification
- [ ] SSH connections work (check logs)
- [ ] WireGuard peers are actually added
- [ ] Usage data is being collected
- [ ] Server health checks working

### Auto-Deployment
- [ ] GitHub auto-deploy is checking (every 5 min)
- [ ] Manual deploy works
- [ ] Services restart after deploy

---

## 📊 Monitoring

### Check Logs
```bash
# Backend logs
pm2 logs nexusvpn-backend

# Frontend logs
tail -f /tmp/frontend.log

# Deployment logs
tail -f /var/log/nexusvpn-deploy.log

# System logs
journalctl -u nginx -f
```

### Check Services
```bash
# Service status
systemctl status postgresql nginx
pm2 status

# Port listening
netstat -tlnp | grep -E '3000|5173|80'
```

---

## 🎯 Success Criteria

Your deployment is successful when:

1. ✅ **Auto-Deployment**: Code auto-updates from GitHub
2. ✅ **Real Data Mode**: `MOCK_SSH=false` in backend
3. ✅ **VPN Configs**: Can generate real WireGuard configs
4. ✅ **Server Management**: Can add/manage VPN servers
5. ✅ **Usage Tracking**: Real data from WireGuard servers

---

## 🚀 Quick Commands Reference

```bash
# Pull latest and deploy
cd /opt/nexusvpn && git pull && ./infrastructure/github-auto-deploy.sh

# Restart services
pm2 restart nexusvpn-backend
pkill -f vite && cd /opt/nexusvpn/frontend && npm run dev -- --host 0.0.0.0 --port 5173 &

# Check status
pm2 list
curl http://localhost:3000/api/health

# View SSH key (for VPN nodes)
cat /opt/nexusvpn/.ssh/id_rsa.pub

# Test SSH to VPN node
ssh -i /opt/nexusvpn/.ssh/id_rsa root@VPN_NODE_IP "uname -a"
```

---

## 📝 Next Phase Goals (From Agents)

According to `agents/PHASES.md`, you're completing **Phase 3: The Wire**:

**Remaining 50%:**
- [x] Code complete ✅
- [x] Production deployment ✅
- [ ] Connect to real VPN servers ← **NEXT**
- [ ] End-to-end testing ← **NEXT**
- [ ] Production validation ← **NEXT**

**Then Phase 4: The Business:**
- [ ] Real Stripe webhooks
- [ ] Payment processing
- [ ] Subscription management

---

**🎉 You're ready! Pull the latest code and start adding real VPN servers!**

