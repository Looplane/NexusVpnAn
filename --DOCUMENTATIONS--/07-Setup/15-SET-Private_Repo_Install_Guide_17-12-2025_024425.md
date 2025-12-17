# 🔐 Private Repository Installation Guide

## ⚠️ Problem
Since your GitHub repository is **private**, `raw.githubusercontent.com` cannot access the files directly. You'll get a 404 error.

## ✅ Solution Options

### Option 1: Clone Repository and Run Script (Recommended)

Since you have SSH access to the server, clone your private repository:

```bash
# Install git if not available
apt update && apt install -y git curl wget

# Clone your private repository (you'll need to authenticate)
git clone https://github.com/Looplane/NexusVpnAn.git /tmp/nexusvpn

# Or use SSH (if you have SSH keys set up)
# git clone git@github.com:Looplane/NexusVpnAn.git /tmp/nexusvpn

# Run the installation script
cd /tmp/nexusvpn
chmod +x infrastructure/auto-install-nexusvpn.sh
sudo ./infrastructure/auto-install-nexusvpn.sh
```

### Option 2: Create Script Manually on Server

Copy and paste the entire script content directly on the server:

```bash
# Create the script file
nano /tmp/auto-install-nexusvpn.sh

# Paste the entire script content (see below)
# Press Ctrl+X, then Y, then Enter to save

# Make it executable and run
chmod +x /tmp/auto-install-nexusvpn.sh
sudo /tmp/auto-install-nexusvpn.sh
```

### Option 3: Use GitHub Personal Access Token

If you want to use curl/wget with authentication:

```bash
# Create a GitHub Personal Access Token with 'repo' scope
# Then use it like this:
GITHUB_TOKEN="your_token_here"
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://raw.githubusercontent.com/Looplane/NexusVpnAn/main/infrastructure/auto-install-nexusvpn.sh \
  | sudo bash
```

### Option 4: Upload Script via SCP

From your local machine (Windows with PuTTY/SCP):

```powershell
# Using PowerShell or Command Prompt
scp infrastructure/auto-install-nexusvpn.sh root@YOUR_SERVER_IP:/tmp/

# Then SSH to server and run:
ssh root@YOUR_SERVER_IP
chmod +x /tmp/auto-install-nexusvpn.sh
sudo /tmp/auto-install-nexusvpn.sh
```

---

## 🚀 Quick Fix: Install curl/wget First

If `curl` is not installed on your fresh Ubuntu server:

```bash
# Update package list
apt update

# Install curl and wget
apt install -y curl wget git

# Now you can use the installation methods above
```

---

## 📋 Recommended Workflow

**For Private Repository:**

1. **Install prerequisites:**
   ```bash
   apt update && apt install -y git curl wget
   ```

2. **Clone repository (with authentication):**
   ```bash
   # Option A: HTTPS (will prompt for username/password or token)
   git clone https://github.com/Looplane/NexusVpnAn.git /opt/nexusvpn
   
   # Option B: SSH (if you have SSH keys configured)
   git clone git@github.com:Looplane/NexusVpnAn.git /opt/nexusvpn
   ```

3. **Run installation:**
   ```bash
   cd /opt/nexusvpn
   chmod +x infrastructure/auto-install-nexusvpn.sh
   sudo ./infrastructure/auto-install-nexusvpn.sh
   ```

---

## 🔑 GitHub Authentication

### For HTTPS Clone:
You'll need either:
- **Username + Password** (if 2FA is disabled)
- **Username + Personal Access Token** (if 2FA is enabled)

Create Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when cloning

### For SSH Clone:
1. Generate SSH key on server: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add public key to GitHub: Settings → SSH and GPG keys → New SSH key
3. Test: `ssh -T git@github.com`

---

## 📝 Alternative: Direct Script Content

If you prefer to create the script directly on the server, see the next section for the complete script content.

