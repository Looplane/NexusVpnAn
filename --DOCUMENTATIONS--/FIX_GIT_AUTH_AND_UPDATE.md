# 🔧 Fix Git Authentication & Update Code

## Problem
- Git pull fails: "Authentication failed"
- Server has old code: `label: 'Overview'` instead of `label: 'Dashboard'`
- Can't pull latest from GitHub

## Quick Fix: Direct Update (No Git Required)

Run this to update the UI directly:

```bash
cd /opt/nexusvpn
chmod +x infrastructure/fix-admin-ui-direct.sh
./infrastructure/fix-admin-ui-direct.sh
```

This will:
- ✅ Update Admin.tsx with new UI labels
- ✅ Restart frontend
- ✅ No git authentication needed

---

## Fix Git Authentication (For Future Updates)

### Option 1: Use Personal Access Token (Recommended)

1. **Create GitHub Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "NexusVPN Server"
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Update Git Remote to Use Token**:

```bash
cd /opt/nexusvpn

# Get your token (replace YOUR_TOKEN with actual token)
GITHUB_TOKEN="YOUR_TOKEN_HERE"

# Update remote URL to include token
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/Looplane/NexusVpnAn.git"

# Test it
git fetch origin main
```

### Option 2: Use SSH Keys (More Secure)

1. **Generate SSH Key on Server**:

```bash
ssh-keygen -t ed25519 -C "nexusvpn-server" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

2. **Add Public Key to GitHub**:
   - Copy the public key output
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key
   - Save

3. **Update Git Remote**:

```bash
cd /opt/nexusvpn
git remote set-url origin "git@github.com:Looplane/NexusVpnAn.git"
git fetch origin main
```

### Option 3: Manual File Update

If git still doesn't work, manually update the file:

```bash
cd /opt/nexusvpn/frontend/pages

# Backup
cp Admin.tsx Admin.tsx.backup

# Update labels
sed -i "s/label: 'Overview'/label: 'Dashboard'/g" Admin.tsx
sed -i "s/label: 'Nodes'/label: 'VPN Servers'/g" Admin.tsx
sed -i "s/label: 'Configuration'/label: 'Settings'/g" Admin.tsx

# Restart frontend
pkill -9 -f vite
cd /opt/nexusvpn/frontend
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
```

---

## Verify Update

After running the fix:

```bash
# Check if labels are updated
grep "label:" /opt/nexusvpn/frontend/pages/Admin.tsx | head -6

# Should show:
# label: 'Dashboard'
# label: 'VPN Servers'
# label: 'Users'
# label: 'Marketing'
# label: 'Audit Log'
# label: 'Settings'
```

---

## After Fix: Clear Browser Cache

1. **Hard Refresh**: `Ctrl+Shift+R`
2. **Or use Incognito**: Open private window
3. **Or clear cache**: Settings → Clear browsing data → Cached images

Then access: `http://5.161.91.222:5173/#/admin`

---

**The direct update script will fix the UI immediately without needing git!** 🎉

