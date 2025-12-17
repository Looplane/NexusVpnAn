# 🖼️ Visual Guide: Adding Your VPN Servers

**Document ID:** SET-VISUAL-ADD-001  
**Created:** 17-12-2025 | Time: 02:36:44  
**Last Updated:** 17-12-2025 | Time: 02:36:44

**Related Documents:**
- @--DOCUMENTATIONS--/07-Setup/04-SET-Step_By_Step_Add_Servers_17-12-2025_023644.md
- @--DOCUMENTATIONS--/07-Setup/05-SET-Quick_Add_Servers_17-12-2025_023644.md

---

## 📋 Information from Your Configs

### Server 1 Details:
```
IP Address: 46.62.201.216
Port: 51820
Public Key: Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=
```

### Server 2 Details:
```
IP Address: 91.99.23.239
Port: 51820
Public Key: 4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=
```

---

## 🎯 Step-by-Step Visual Guide

### STEP 1: Access Admin Panel

1. Open browser: `http://5.161.91.222:5173/#/admin`
2. Login with:
   - Email: `admin@nexusvpn.com`
   - Password: `password`

### STEP 2: Navigate to Servers

Click on **"Servers"** tab in the top navigation bar.

### STEP 3: Click "Add Server"

Look for a green **"+"** button or **"Add Server"** button and click it.

### STEP 4: Fill the Form - Server 1

**Form Fields:**

```
┌─────────────────────────────────────┐
│  Add VPN Node                       │
├─────────────────────────────────────┤
│                                     │
│  Server Name:                       │
│  [Server 1 - Frankfurt]            │
│                                     │
│  City:                              │
│  [Frankfurt]                        │
│                                     │
│  Country:                           │
│  [Germany]                          │
│                                     │
│  Country Code:                      │
│  [DE]                               │
│                                     │
│  IPv4 Address:                      │
│  [46.62.201.216]                    │
│                                     │
│  💡 The system will automatically  │
│     fetch the WireGuard public key  │
│     via SSH.                        │
│                                     │
│  💡 Make sure SSH access is         │
│     configured before adding.       │
│                                     │
│  [    Add Server    ]              │
└─────────────────────────────────────┘
```

**What to Enter:**

| Field | Value | Example |
|-------|-------|---------|
| **Server Name** | `Server 1 - [Location]` | `Server 1 - Frankfurt` |
| **City** | `[City name]` | `Frankfurt` |
| **Country** | `[Full country name]` | `Germany` |
| **Country Code** | `[2 letters, uppercase]` | `DE` |
| **IPv4 Address** | `46.62.201.216` | (exact from your config) |

### STEP 5: Fill the Form - Server 2

Repeat Step 4 with Server 2 details:

| Field | Value |
|-------|-------|
| **Server Name** | `Server 2 - [Location]` |
| **City** | `[City name]` |
| **Country** | `[Full country name]` |
| **Country Code** | `[2 letters]` |
| **IPv4 Address** | `91.99.23.239` |

---

## 🔐 Before Adding: Setup SSH (IMPORTANT!)

**On NexusVPN server (5.161.91.222):**
```bash
cat /opt/nexusvpn/.ssh/id_rsa.pub
# Copy the output
```

**On each VPN server:**
```bash
ssh root@46.62.201.216
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Test SSH:**
```bash
# From NexusVPN server
ssh -i /opt/nexusvpn/.ssh/id_rsa root@46.62.201.216 "echo 'Works!'"
```

---

## ✅ After Adding: Verify

1. **Check Server List:**
   - Both servers should appear
   - Status: "Active" (green)
   - Load: Percentage shown

2. **Check Public Keys:**
   - Click on server to view details
   - Public key should match:
     - Server 1: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`
     - Server 2: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`

3. **If Public Key Missing:**
   ```bash
   sudo -u postgres psql -d nexusvpn
   UPDATE servers SET "publicKey" = 'Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=' WHERE ipv4 = '46.62.201.216';
   UPDATE servers SET "publicKey" = '4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=' WHERE ipv4 = '91.99.23.239';
   \q
   ```

---

## 🧪 Test VPN Config

1. Logout from admin
2. Login as user
3. Go to Dashboard
4. Click "Generate Config"
5. Select a server
6. Download config
7. Import to WireGuard client
8. Connect!

---

## 📝 Country Code Reference

Common country codes:
- `DE` = Germany
- `US` = United States
- `GB` = United Kingdom
- `FR` = France
- `NL` = Netherlands
- `SG` = Singapore
- `JP` = Japan
- `CA` = Canada
- `AU` = Australia

---

**That's it! Your servers are integrated!** ✅

---

**Last Updated:** 17-12-2025 | Time: 02:36:44

