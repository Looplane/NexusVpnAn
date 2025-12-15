# 🔧 Troubleshoot Old UI on Server

## Problem
Server still shows old UI after update:
- Shows "Overview" instead of "Dashboard"
- Shows "Nodes" instead of "VPN Servers"
- Shows "Configuration" instead of "Settings"

## Quick Fix

### Step 1: Run Complete Frontend Update

```bash
cd /opt/nexusvpn
chmod +x infrastructure/complete-frontend-update.sh
./infrastructure/complete-frontend-update.sh
```

### Step 2: Verify Code is Updated

Check if Admin.tsx has the new UI:

```bash
cd /opt/nexusvpn/frontend
grep -A 5 "label: 'Dashboard'" pages/Admin.tsx
```

Should show:
```typescript
{ id: 'overview', icon: Activity, label: 'Dashboard' },
{ id: 'servers', icon: Server, label: 'VPN Servers' },
```

If it shows `label: 'Overview'` or `label: 'Nodes'`, the code wasn't updated.

### Step 3: Check Git Status

```bash
cd /opt/nexusvpn
git status
git log --oneline -1
git show HEAD:frontend/pages/Admin.tsx | grep -A 3 "label:"
```

Compare with what's on disk:
```bash
grep -A 3 "label:" frontend/pages/Admin.tsx | head -10
```

### Step 4: Force Hard Reset

If code doesn't match:

```bash
cd /opt/nexusvpn
git fetch origin main
git reset --hard origin/main
git clean -fd
```

### Step 5: Rebuild Frontend

```bash
cd /opt/nexusvpn/frontend
rm -rf node_modules .vite dist
npm install
```

### Step 6: Restart Frontend

```bash
pkill -9 -f vite
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
sleep 5
tail -20 /tmp/frontend.log
```

### Step 7: Clear Browser Cache

**Important**: Browser may be caching old JavaScript!

1. **Hard Refresh**: `Ctrl+Shift+R` or `Ctrl+F5`
2. **Clear Cache**: 
   - Chrome: Settings → Privacy → Clear browsing data → Cached images
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content
3. **Use Incognito**: Open in private/incognito window
4. **Disable Cache** (DevTools):
   - F12 → Network tab → Check "Disable cache"
   - Keep DevTools open while refreshing

### Step 8: Verify What's Being Served

Check what the server is actually serving:

```bash
# Check if new code is in the served files
curl -s http://localhost:5173 | grep -i "dashboard\|overview" | head -5

# Check the actual JavaScript bundle
curl -s http://localhost:5173/assets/index*.js 2>/dev/null | grep -i "dashboard\|overview" | head -5
```

---

## Common Issues

### Issue 1: Git Pull Didn't Work

**Symptoms**: Code on disk doesn't match GitHub

**Fix**:
```bash
cd /opt/nexusvpn
git remote -v  # Verify remote URL
git fetch origin main
git log --oneline origin/main -5  # Check latest commits
git reset --hard origin/main
```

### Issue 2: Frontend Process Not Restarted

**Symptoms**: Old process still running

**Fix**:
```bash
# Find and kill all frontend processes
ps aux | grep -E "vite|node.*5173"
pkill -9 -f vite
pkill -9 -f "node.*5173"

# Verify nothing on port 5173
netstat -tlnp | grep 5173

# Start fresh
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
```

### Issue 3: Browser Cache

**Symptoms**: Code is correct but browser shows old UI

**Fix**:
- Use Incognito/Private window
- Clear browser cache completely
- Check DevTools → Network → Disable cache

### Issue 4: Vite Dev Server Cache

**Symptoms**: Vite serving cached files

**Fix**:
```bash
cd /opt/nexusvpn/frontend
rm -rf .vite
pkill -9 -f vite
npm run dev -- --host 0.0.0.0 --port 5173 --force
```

### Issue 5: Wrong Branch

**Symptoms**: Code doesn't match expected

**Fix**:
```bash
cd /opt/nexusvpn
git branch
git checkout main
git pull origin main
```

---

## Verification Checklist

Run these to verify everything:

```bash
# 1. Code is updated
cd /opt/nexusvpn
git log --oneline -1
grep "label: 'Dashboard'" frontend/pages/Admin.tsx && echo "✅ New UI code present"

# 2. Frontend is running
netstat -tlnp | grep 5173 && echo "✅ Frontend running"

# 3. No old processes
ps aux | grep -E "vite|node.*5173" | grep -v grep

# 4. Frontend logs look good
tail -20 /tmp/frontend.log | grep -i "ready\|error"

# 5. Can access frontend
curl -I http://localhost:5173 2>/dev/null | head -1
```

---

## Nuclear Option: Complete Reinstall

If nothing works:

```bash
cd /opt/nexusvpn

# Stop everything
pm2 stop nexusvpn-backend
pkill -9 -f vite

# Remove frontend completely
rm -rf frontend/node_modules frontend/.vite frontend/dist

# Pull fresh code
git fetch origin main
git reset --hard origin/main
git clean -fd

# Reinstall
cd frontend
npm install
cd ..

# Restart
pm2 restart nexusvpn-backend
cd frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
```

---

**After running the complete update script, the UI should match your local development!** 🎉

