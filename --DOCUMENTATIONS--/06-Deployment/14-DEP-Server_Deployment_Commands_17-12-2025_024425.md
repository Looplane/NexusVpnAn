# 🚀 Server Deployment Commands (Copy-Paste Ready)

## ✅ After GitHub Push - Run on Server

**Copy and paste this entire block:**

```bash
cd /opt/nexusvpn

# Stash any local changes
git stash push -m "Server changes $(date +%Y%m%d-%H%M%S)" 2>/dev/null || true

# Remove conflicting server-specific files
git clean -fd infrastructure/ 2>/dev/null || true

# Pull latest code (now conflict-free)
git pull origin main

# Make deploy script executable
chmod +x infrastructure/quick-deploy-after-push.sh

# Run deployment
./infrastructure/quick-deploy-after-push.sh
```

---

## 🔄 Alternative: Use Auto-Deploy Script

```bash
cd /opt/nexusvpn
chmod +x infrastructure/github-auto-deploy.sh
./infrastructure/github-auto-deploy.sh
```

---

## ✅ Verify Deployment

```bash
# Check services
pm2 list
curl http://localhost:3000/api/health

# Check git status (should be clean)
cd /opt/nexusvpn
git status

# View deployment log
tail -f /var/log/nexusvpn-deploy.log
```

---

## 🎯 What This Does

1. **Stashes local changes** - Saves them safely
2. **Removes conflicting files** - Server-specific configs
3. **Pulls latest code** - From GitHub
4. **Deploys automatically** - Updates and restarts services
5. **Verifies** - Checks everything is working

---

**No more conflicts! The deployment is now fully automated.** ✅

