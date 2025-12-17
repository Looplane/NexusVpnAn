# 🎯 Quick Summary: Adding Your 2 VPN Servers

## 📋 Your Server Details

**Server 1:**
- IP: `46.62.201.216`
- Port: `51820`
- Public Key: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`

**Server 2:**
- IP: `91.99.23.239`
- Port: `51820`
- Public Key: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`

---

## ⚡ 3-Step Process

### 1️⃣ Setup SSH (5 min)

**On NexusVPN server:**
```bash
cat /opt/nexusvpn/.ssh/id_rsa.pub
```

**On each VPN server:**
```bash
ssh root@46.62.201.216
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2️⃣ Add in Admin Panel

1. Go to: http://5.161.91.222:5173/#/admin
2. Login: `admin@nexusvpn.com` / `password`
3. Click "Servers" tab
4. Click "Add Server"
5. Fill form for each server:
   - **Name**: `Server 1` (or your choice)
   - **City**: `[City name]`
   - **Country**: `[Country name]` (e.g., Germany, United States)
   - **Country Code**: `[2 letters]` (e.g., DE, US)
   - **IPv4**: `46.62.201.216` (or `91.99.23.239` for server 2)
6. Click "Add Server"

### 3️⃣ Verify & Test

- Check servers appear in list
- Status should be "Active"
- Generate VPN config as user
- Test connection

---

## ✅ Done!

Your VPN servers are now integrated with NexusVPN!

---

**Full detailed guide:** See `--DOCUMENTATIONS--/STEP_BY_STEP_ADD_SERVERS.md`

