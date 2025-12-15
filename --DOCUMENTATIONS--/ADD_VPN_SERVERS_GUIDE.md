# 🚀 Complete Guide: Adding Your WireGuard VPN Servers

## 📋 Information Extracted from Your Configs

From your WireGuard client configs, I can see:

### Server 1:
- **IP Address**: `46.62.201.216`
- **Port**: `51820`
- **Public Key**: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`
- **Location**: (You'll need to determine city/country)

### Server 2:
- **IP Address**: `91.99.23.239`
- **Port**: `51820`
- **Public Key**: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`
- **Location**: (You'll need to determine city/country)

---

## 🔐 Step 1: Setup SSH Access (REQUIRED)

NexusVPN needs SSH access to manage WireGuard on your servers. You have two options:

### Option A: Use SSH Key (Recommended)

**On your NexusVPN server (5.161.91.222):**

```bash
# 1. Check if SSH key exists
cat /opt/nexusvpn/.ssh/id_rsa.pub

# 2. Copy the public key shown above
```

**On each VPN server (46.62.201.216 and 91.99.23.239):**

```bash
# 1. SSH into the VPN server
ssh root@46.62.201.216  # or 91.99.23.239

# 2. Add the NexusVPN public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "PASTE_THE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. Test from NexusVPN server
# (Go back to NexusVPN server and test)
```

**Test SSH from NexusVPN server:**

```bash
# Test Server 1
ssh -i /opt/nexusvpn/.ssh/id_rsa root@46.62.201.216 "uname -a"

# Test Server 2
ssh -i /opt/nexusvpn/.ssh/id_rsa root@91.99.23.239 "uname -a"
```

### Option B: Password Authentication (Temporary)

If you prefer password auth (less secure):
- The system will prompt for password on first connection
- Not recommended for production

---

## 📍 Step 2: Determine Server Locations

You need to know:
- **City**: Where is the server located?
- **Country**: What country?
- **Country Code**: 2-letter code (e.g., US, DE, FR, GB)

**Examples:**
- If server is in Germany: `City: Frankfurt`, `Country: Germany`, `Country Code: DE`
- If server is in USA: `City: New York`, `Country: United States`, `Country Code: US`

---

## 🖥️ Step 3: Get Server Public Keys (Verify)

**On each VPN server, verify the public key:**

```bash
# SSH into each server
ssh root@46.62.201.216
cat /etc/wireguard/publickey

# Should show: Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=

# For server 2:
ssh root@91.99.23.239
cat /etc/wireguard/publickey

# Should show: 4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=
```

**Note:** NexusVPN will try to fetch this automatically, but you can verify it matches.

---

## 🌐 Step 4: Access Admin Panel

1. **Open your browser:**
   ```
   http://5.161.91.222:5173/#/admin
   ```

2. **Login:**
   - Email: `admin@nexusvpn.com`
   - Password: `password` (or your admin password)

3. **Navigate to Servers tab:**
   - Click on "Servers" in the admin panel

---

## ➕ Step 5: Add Server 1

1. **Click "Add Server" button**

2. **Fill in the form:**

   **Server Name:**
   ```
   Server 1 - Location Name
   ```
   Example: `Frankfurt Node 1` or `US East Node`

   **City:**
   ```
   [City where server is located]
   ```
   Example: `Frankfurt` or `New York`

   **Country Code:**
   ```
   [2-letter country code]
   ```
   Examples: `DE` (Germany), `US` (USA), `FR` (France), `GB` (UK)

   **IPv4:**
   ```
   46.62.201.216
   ```

3. **Click "Deploy"**

4. **What happens:**
   - Server is added to database
   - System tries to SSH and fetch WireGuard public key automatically
   - If SSH works, public key is fetched automatically
   - If SSH fails, you can add public key manually later

---

## ➕ Step 6: Add Server 2

Repeat Step 5 with Server 2 details:

**Server Name:**
```
Server 2 - Location Name
```

**City:**
```
[City where server 2 is located]
```

**Country Code:**
```
[2-letter country code]
```

**IPv4:**
```
91.99.23.239
```

---

## ✅ Step 7: Verify Servers Added

After adding both servers:

1. **Check the Servers list:**
   - You should see both servers listed
   - Status should show as "Active" (green)
   - Load should be displayed

2. **Check Public Keys:**
   - Click on a server to view details
   - Verify the public key matches:
     - Server 1: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`
     - Server 2: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`

3. **Test Health:**
   - Servers should show as "Online"
   - Health checks run every 30 seconds

---

## 🔧 Step 8: Manual Public Key Entry (If Auto-Fetch Failed)

If SSH access isn't set up yet, you can add the public key manually:

**Option A: Via Database (Quick)**

```bash
# On NexusVPN server
sudo -u postgres psql -d nexusvpn

# Update Server 1
UPDATE servers 
SET "publicKey" = 'Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs='
WHERE ipv4 = '46.62.201.216';

# Update Server 2
UPDATE servers 
SET "publicKey" = '4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw='
WHERE ipv4 = '91.99.23.239';

# Exit
\q
```

**Option B: Via Admin Panel (Future)**
- Currently, the admin panel doesn't have an edit server feature
- Use database method above for now

---

## 🧪 Step 9: Test VPN Config Generation

1. **Logout from admin panel**

2. **Login as regular user:**
   - Go to: http://5.161.91.222:5173/#/login
   - Use your user account

3. **Go to Dashboard**

4. **Generate VPN Config:**
   - Click "Generate Config" or "Add Device"
   - Select one of your servers
   - Click "Generate"
   - Download the config file

5. **Verify Config:**
   - Open the downloaded `.conf` file
   - Should contain:
     - `[Interface]` section with PrivateKey
     - `[Peer]` section with:
       - `PublicKey` = Your server's public key
       - `Endpoint` = Your server IP:51820
       - `AllowedIPs` = 0.0.0.0/0, ::/0

6. **Test Connection:**
   - Import config into WireGuard client
   - Connect
   - Should work!

---

## 📊 Step 10: Monitor Servers

**In Admin Panel:**

1. **View Server Status:**
   - Go to Servers tab
   - See real-time load, ping, status

2. **View Server Details:**
   - Click on a server
   - See detailed information
   - View terminal access
   - Check logs

3. **Monitor Usage:**
   - Usage data syncs every minute
   - View in Dashboard → Data Usage

---

## 🔍 Troubleshooting

### Server Shows as "Offline"

**Check SSH access:**
```bash
# From NexusVPN server
ssh -i /opt/nexusvpn/.ssh/id_rsa root@46.62.201.216 "uname -a"
```

**Check backend logs:**
```bash
pm2 logs nexusvpn-backend | grep -i "server\|ssh"
```

### Public Key Not Fetched

**Manual fix:**
```bash
sudo -u postgres psql -d nexusvpn
UPDATE servers SET "publicKey" = 'YOUR_PUBLIC_KEY' WHERE ipv4 = 'SERVER_IP';
```

### VPN Config Generation Fails

**Check:**
1. Server is active in admin panel
2. Public key is set
3. SSH access works
4. Backend logs for errors

---

## 📝 Quick Reference: Server Details

### Server 1
```
Name: [Your choice]
City: [Your choice]
Country Code: [Your choice]
IPv4: 46.62.201.216
Port: 51820
Public Key: Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=
SSH User: root
```

### Server 2
```
Name: [Your choice]
City: [Your choice]
Country Code: [Your choice]
IPv4: 91.99.23.239
Port: 51820
Public Key: 4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=
SSH User: root
```

---

## ✅ Success Checklist

- [ ] SSH access configured to both servers
- [ ] Server 1 added in admin panel
- [ ] Server 2 added in admin panel
- [ ] Both servers show as "Active"
- [ ] Public keys match your configs
- [ ] Can generate VPN configs
- [ ] VPN configs work when imported

---

## 🎉 You're Done!

Once both servers are added:
- ✅ Users can generate VPN configs
- ✅ System manages WireGuard peers automatically
- ✅ Usage data is collected
- ✅ Health monitoring works
- ✅ Real VPN connections!

---

**Need help? Check backend logs:**
```bash
pm2 logs nexusvpn-backend
```

