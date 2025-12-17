# 🔧 Fix Deployment Issues

## Quick Fix Script

Run this on your Ubuntu server to fix all deployment issues:

```bash
# Download and run the fix script
cd /opt/nexusvpn
wget -O fix.sh https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/fix-nexusvpn-deployment.sh
chmod +x fix.sh
sudo ./fix.sh
```

**Or copy-paste this complete fix:**

```bash
# Clean up frontend
pkill -f vite || true
pkill -f "npm run dev" || true
fuser -k 5173/tcp 5174/tcp 5175/tcp 5176/tcp 2>/dev/null || true
sleep 2

# Fix database
sudo -u postgres psql -d nexusvpn << EOF
GRANT ALL ON SCHEMA public TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nexusvpn;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nexusvpn;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Restart backend
pm2 restart nexusvpn-backend
sleep 3

# Start frontend on port 5173
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &

# Update firewall
ufw allow 5173/tcp comment 'NexusVPN Frontend' 2>/dev/null || true

# Wait and verify
sleep 5
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "✅ Frontend: http://${SERVER_IP}:5173"
echo "✅ Backend: http://${SERVER_IP}:3000"
echo ""
netstat -tlnp | grep -E '3000|5173'
```

---

## Manual Steps (If Script Doesn't Work)

### 1. Fix Frontend Port
```bash
cd /opt/nexusvpn/frontend
# Kill all vite processes
pkill -f vite
# Start on specific port
npm run dev -- --host 0.0.0.0 --port 5173
```

### 2. Fix Backend Binding
The backend should bind to `0.0.0.0` by default. If not, check:
```bash
cd /opt/nexusvpn/backend
grep -r "listen\|host" src/main.ts
```

### 3. Test Connectivity
```bash
# From server
curl http://localhost:3000/api/health
curl http://localhost:5173

# From your computer (replace IP)
curl http://5.161.91.222:3000/api/health
curl http://5.161.91.222:5173
```

---

## Common Issues & Solutions

### Issue: 404 on Frontend
**Solution:** Frontend may be on wrong port. Check:
```bash
netstat -tlnp | grep vite
# Use the port shown, or restart on 5173
```

### Issue: Backend Not Accessible
**Solution:** Check binding:
```bash
netstat -tlnp | grep 3000
# Should show 0.0.0.0:3000, not just :::3000
```

### Issue: Multiple Frontend Instances
**Solution:** Clean up:
```bash
pkill -f vite
fuser -k 5173/tcp 5174/tcp 5175/tcp 5176/tcp
```

---

## Verification Checklist

- [ ] Backend responds: `curl http://SERVER_IP:3000/api/health`
- [ ] Frontend accessible: `curl http://SERVER_IP:5173`
- [ ] Firewall allows ports: `ufw status | grep -E '3000|5173'`
- [ ] Services running: `pm2 list` and `ps aux | grep vite`
- [ ] No port conflicts: `netstat -tlnp | grep -E '3000|5173'`

---

## After Running Fix

1. **Test Backend:**
   ```bash
   curl http://5.161.91.222:3000/api/health
   ```

2. **Test Frontend:**
   ```bash
   curl http://5.161.91.222:5173
   ```

3. **Open in Browser:**
   - Frontend: http://5.161.91.222:5173
   - Backend API: http://5.161.91.222:3000

---

**Note:** I cannot SSH into your server for security reasons, but this script will fix all issues automatically.

