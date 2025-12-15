# 🔐 Installation Guide for Private GitHub Repository

## ⚠️ Problem
Your repository `https://github.com/Looplane/NexusVpnAn` is **private**, so `raw.githubusercontent.com` returns 404 errors.

## ✅ Solution: Clone Repository First

### Quick One-Line Command

Run this on your Ubuntu server:

```bash
apt update && apt install -y git && git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn && cd /tmp/nexusvpn && chmod +x infrastructure/auto-install-nexusvpn.sh && sudo ./infrastructure/auto-install-nexusvpn.sh
```

**You'll be prompted for:**
- GitHub Username
- GitHub Password (or Personal Access Token)

---

## 📝 Step-by-Step Instructions

### Step 1: Install Git and Tools

```bash
apt update
apt install -y git curl wget
```

### Step 2: Clone Your Repository

**Option A: HTTPS (Easiest)**
```bash
git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn
```
- Username: Your GitHub username
- Password: Your GitHub Personal Access Token (not your password if 2FA is enabled)

**Option B: SSH (If you have SSH keys)**
```bash
# First, add your SSH key to GitHub
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy and add to GitHub: Settings → SSH and GPG keys

# Then clone:
git clone git@github.com:Looplane/NexusVpnAn.git /tmp/nexusvpn
```

### Step 3: Run Installation Script

```bash
cd /tmp/nexusvpn
chmod +x infrastructure/auto-install-nexusvpn.sh
sudo ./infrastructure/auto-install-nexusvpn.sh
```

---

## 🔑 Creating GitHub Personal Access Token

If you have 2FA enabled or want to use a token:

1. **Go to GitHub:**
   - Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate new token:**
   - Click "Generate new token (classic)"
   - Name: `NexusVPN Server`
   - Expiration: Choose your preference
   - Scopes: Check `repo` (full control of private repositories)

3. **Copy the token** (you'll only see it once!)

4. **Use it as password** when cloning:
   ```bash
   git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn
   # Username: your_github_username
   # Password: paste_your_token_here
   ```

---

## 🚀 Complete Installation Command

**Copy and paste this entire block:**

```bash
# Update system and install git
apt update && apt install -y git curl wget

# Clone repository (you'll enter credentials)
git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn

# Run installation
cd /tmp/nexusvpn
chmod +x infrastructure/auto-install-nexusvpn.sh
sudo ./infrastructure/auto-install-nexusvpn.sh
```

---

## 🔄 Alternative: Upload Script via SCP

If you prefer to upload the script directly:

**From Windows (PowerShell or Command Prompt):**

```powershell
# Navigate to your project directory
cd G:\VPN-PROJECT-2025\nexusvpn

# Upload the script
scp infrastructure/auto-install-nexusvpn.sh root@YOUR_SERVER_IP:/tmp/

# Then SSH and run:
ssh root@YOUR_SERVER_IP
chmod +x /tmp/auto-install-nexusvpn.sh
sudo /tmp/auto-install-nexusvpn.sh
```

---

## 📋 What Happens Next

After running the script:

1. ✅ System updates
2. ✅ PostgreSQL 16 installed
3. ✅ Node.js 20.x installed
4. ✅ Docker installed
5. ✅ Nginx installed
6. ✅ WireGuard configured
7. ✅ Firewall configured
8. ✅ NexusVPN cloned and configured
9. ✅ Database credentials displayed (SAVE THESE!)

---

## 🆘 Troubleshooting

### "git: command not found"
```bash
apt update && apt install -y git
```

### "Permission denied (publickey)"
- Use HTTPS method instead
- Or set up SSH keys first

### "Repository not found"
- Check repository name: `Looplane/NexusVpnAn`
- Verify you have access to the private repo
- Use Personal Access Token with `repo` scope

### "Authentication failed"
- If 2FA enabled, use Personal Access Token (not password)
- Token must have `repo` scope

---

## ✅ Success!

Once installation completes, you'll see:
- Database credentials
- WireGuard public key
- Service status
- Management commands

**Save the database password!** You'll need it for backend configuration.

