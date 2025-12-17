# ⚠️ Windows Server 2019 WireGuard Setup Guide

## 🚨 Important Notice

**WireGuard does NOT run natively on Windows Server 2019!**

WireGuard is a Linux kernel module and requires Linux to run. However, you have several options:

---

## ✅ Option 1: Use WSL2 (Windows Subsystem for Linux) - RECOMMENDED

WSL2 allows you to run a full Linux kernel on Windows Server 2019.

### Step 1: Install WSL2 on Windows Server 2019

**Open PowerShell as Administrator:**

```powershell
# Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart server
Restart-Computer
```

**After restart, set WSL2 as default:**

```powershell
wsl --set-default-version 2
```

### Step 2: Install Ubuntu 22.04 LTS

```powershell
# Download and install Ubuntu
wsl --install -d Ubuntu-22.04
```

### Step 3: Setup WireGuard in WSL2

**Open Ubuntu terminal (WSL2):**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install WireGuard
sudo apt install -y wireguard wireguard-tools

# Generate keys
sudo mkdir -p /etc/wireguard
cd /etc/wireguard
sudo wg genkey | sudo tee privatekey | sudo wg pubkey | sudo tee publickey

# Create WireGuard config
sudo nano /etc/wireguard/wg0.conf
```

**WireGuard Config Template:**

```ini
[Interface]
PrivateKey = <YOUR_PRIVATE_KEY>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Add peers here as needed
```

**Start WireGuard:**

```bash
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

### Step 4: Configure Windows Firewall

**On Windows Server (PowerShell as Admin):**

```powershell
# Allow UDP port 51820
New-NetFirewallRule -DisplayName "WireGuard VPN" -Direction Inbound -Protocol UDP -LocalPort 51820 -Action Allow

# Allow forwarding (if needed)
netsh interface portproxy add v4tov4 listenport=51820 listenaddress=0.0.0.0 connectport=51820 connectaddress=<WSL2_IP>
```

---

## ✅ Option 2: Use Docker with Linux Container

### Step 1: Install Docker on Windows Server 2019

```powershell
# Install Docker Desktop for Windows Server
# Download from: https://www.docker.com/products/docker-desktop
```

### Step 2: Run WireGuard in Docker Container

```powershell
# Create docker-compose.yml
@"
version: '3.8'
services:
  wireguard:
    image: linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=UTC
      - SERVERURL=46.62.201.216
      - SERVERPORT=51820
      - PEERS=10
      - PEERDNS=1.1.1.1
      - INTERNAL_SUBNET=10.0.0.0
    volumes:
      - ./config:/config
      - /lib/modules:/lib/modules
    ports:
      - "51820:51820/udp"
    sysctls:
      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped
"@ | Out-File -FilePath docker-compose.yml -Encoding utf8

# Start container
docker-compose up -d
```

---

## ✅ Option 3: Use Hyper-V Linux VM (Most Reliable)

### Step 1: Enable Hyper-V

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
Restart-Computer
```

### Step 2: Create Ubuntu 22.04 VM

1. Download Ubuntu Server 22.04 ISO
2. Create new VM in Hyper-V Manager
3. Install Ubuntu Server
4. Follow standard Linux WireGuard setup

---

## 🔧 Setup Commands for Each VPS

### For Server 1 (46.62.201.216)

**If using WSL2:**

```bash
# SSH into Windows Server
ssh Administrator@46.62.201.216

# Open WSL2 Ubuntu
wsl

# In WSL2, run:
sudo apt update && sudo apt install -y wireguard wireguard-tools
sudo mkdir -p /etc/wireguard
cd /etc/wireguard
sudo wg genkey | sudo tee privatekey | sudo wg pubkey | sudo tee publickey

# Display public key (needed for NexusVPN)
sudo cat publickey

# Create config
sudo nano /etc/wireguard/wg0.conf
# (Use template above)

# Start WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

### For Server 2 (91.99.23.239)

**Repeat the same steps for server 2:**

```bash
# SSH into Windows Server
ssh Administrator@91.99.23.239

# Open WSL2 Ubuntu
wsl

# In WSL2, run:
sudo apt update && sudo apt install -y wireguard wireguard-tools
sudo mkdir -p /etc/wireguard
cd /etc/wireguard
sudo wg genkey | sudo tee privatekey | sudo wg pubkey | sudo tee publickey

# Display public key (needed for NexusVPN)
sudo cat publickey

# Create config
sudo nano /etc/wireguard/wg0.conf
# (Use template above)

# Start WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

---

## 🔐 SSH Access Setup for NexusVPN

**Important:** NexusVPN needs SSH access to manage WireGuard. Since you're using Windows Server, you need to:

### Option A: Enable OpenSSH Server on Windows

```powershell
# On Windows Server (PowerShell as Admin)
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'

# Configure SSH to allow key-based auth
New-Item -Path $env:ProgramData\ssh -ItemType Directory -Force
# Copy NexusVPN public key to: C:\ProgramData\ssh\administrators_authorized_keys
```

### Option B: SSH into WSL2 Directly (Better)

**On NexusVPN server, configure SSH to WSL2:**

```bash
# Get WSL2 IP from Windows Server
wsl hostname -I

# SSH directly to WSL2 (requires port forwarding or WSL2 IP access)
ssh root@<WSL2_IP>
```

---

## 📋 Quick Setup Script for Server 1

**Save as `setup-wireguard-server1.ps1` on Windows Server:**

```powershell
# Setup WireGuard on Windows Server 2019 (Server 1: 46.62.201.216)
# Run as Administrator

Write-Host "Setting up WireGuard on Windows Server 2019..." -ForegroundColor Green

# Enable WSL2
Write-Host "Enabling WSL2..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

Write-Host "Please restart the server, then run the WSL2 setup script." -ForegroundColor Cyan
```

**After restart, run in WSL2:**

```bash
#!/bin/bash
# Setup WireGuard in WSL2 (Server 1)

sudo apt update && sudo apt upgrade -y
sudo apt install -y wireguard wireguard-tools

sudo mkdir -p /etc/wireguard
cd /etc/wireguard

# Generate keys
sudo wg genkey | sudo tee privatekey | sudo wg pubkey | sudo tee publickey

echo "Public Key for NexusVPN:"
sudo cat publickey

# Create basic config
sudo tee /etc/wireguard/wg0.conf > /dev/null <<EOF
[Interface]
PrivateKey = $(sudo cat privatekey)
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

# Start WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0

echo "WireGuard setup complete!"
echo "Public Key: $(sudo cat publickey)"
```

---

## 📋 Quick Setup Script for Server 2

**Same as Server 1, but for 91.99.23.239:**

```bash
#!/bin/bash
# Setup WireGuard in WSL2 (Server 2)

sudo apt update && sudo apt upgrade -y
sudo apt install -y wireguard wireguard-tools

sudo mkdir -p /etc/wireguard
cd /etc/wireguard

# Generate keys
sudo wg genkey | sudo tee privatekey | sudo wg pubkey | sudo tee publickey

echo "Public Key for NexusVPN:"
sudo cat publickey

# Create basic config
sudo tee /etc/wireguard/wg0.conf > /dev/null <<EOF
[Interface]
PrivateKey = $(sudo cat privatekey)
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
EOF

# Start WireGuard
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0

echo "WireGuard setup complete!"
echo "Public Key: $(sudo cat publickey)"
```

---

## ⚠️ Important Notes

1. **WSL2 IP Changes:** WSL2 IP addresses change on reboot. Consider:
   - Using Windows host IP for SSH
   - Setting static IP in WSL2
   - Using port forwarding

2. **Firewall Rules:** Windows Firewall must allow:
   - UDP port 51820 (WireGuard)
   - TCP port 22 (SSH)

3. **Performance:** WSL2 has some overhead. For production, consider:
   - Hyper-V Linux VM (better performance)
   - Dedicated Linux VPS (best option)

4. **SSH Access:** NexusVPN needs SSH to manage peers. Configure:
   - SSH into WSL2 directly, OR
   - SSH into Windows and use `wsl` command

---

## 🎯 Recommended Approach

**For Production:**
1. Use **Hyper-V Linux VM** (best performance)
2. Or migrate to **Linux VPS** (Ubuntu 22.04)

**For Testing:**
- WSL2 is fine for development/testing

---

## 📞 Next Steps

1. Choose your approach (WSL2, Docker, or Hyper-V)
2. Install WireGuard using the scripts above
3. Get the public key from each server
4. Add servers to NexusVPN admin panel
5. Configure SSH access for NexusVPN management

---

**Need help? Check the main setup guide:** `--DOCUMENTATIONS--/STEP_BY_STEP_ADD_SERVERS.md`

