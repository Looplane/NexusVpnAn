# 📝 Step-by-Step: Adding Your 2 WireGuard VPN Servers

**Document ID:** SET-ADD-SERVERS-001  
**Created:** 17-12-2025 | Time: 02:36:44  
**Last Updated:** 17-12-2025 | Time: 02:36:44

**Related Documents:**
- @--DOCUMENTATIONS--/07-Setup/02-SET-Add_VPN_Servers_Guide_17-12-2025_022800.md
- @--DOCUMENTATIONS--/07-Setup/05-SET-Quick_Add_Servers_17-12-2025_023644.md

---

## 🎯 Your Server Information

From your WireGuard configs:

### Server 1:
- **IP**: `46.62.201.216`
- **Port**: `51820`
- **Public Key**: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`

### Server 2:
- **IP**: `91.99.23.239`
- **Port**: `51820`
- **Public Key**: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`

---

## 🔐 STEP 1: Setup SSH Access (IMPORTANT!)

NexusVPN needs SSH to manage WireGuard. Do this first!

### On NexusVPN Server (5.161.91.222):

```bash
# 1. Get your SSH public key
cat /opt/nexusvpn/.ssh/id_rsa.pub

# Copy the entire output (starts with ssh-rsa or ssh-ed25519)
```

### On VPN Server 1 (46.62.201.216):

```bash
# 1. SSH into the server
ssh root@46.62.201.216

# 2. Add NexusVPN's public key
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the public key from step above
# Save and exit (Ctrl+X, Y, Enter)

chmod 600 ~/.ssh/authorized_keys

# 3. Test (from NexusVPN server)
# Go back to NexusVPN server and run:
ssh -i /opt/nexusvpn/.ssh/id_rsa root@46.62.201.216 "echo 'SSH works!'"
```

### On VPN Server 2 (91.99.23.239):

```bash
# Repeat the same steps for server 2
ssh root@91.99.23.239
mkdir -p ~/.ssh && chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste the same public key
chmod 600 ~/.ssh/authorized_keys

# Test from NexusVPN server:
ssh -i /opt/nexusvpn/.ssh/id_rsa root@91.99.23.239 "echo 'SSH works!'"
```

---

## 🌐 STEP 2: Access Admin Panel

1. **Open browser:**
   ```
   http://5.161.91.222:5173/#/admin
   ```

2. **Login:**
   - Email: `admin@nexusvpn.com`
   - Password: `password` (or your admin password)

3. **Click "Servers" tab** (top navigation)

---

## ➕ STEP 3: Add Server 1

1. **Click the "Add Server" button** (usually a green "+" button)

2. **Fill in the form:**

   **Server Name:**
   ```
   Server 1 - [Location]
   ```
   Example: `Frankfurt Node 1` or `US East 1`

   **City:**
   ```
   [City name]
   ```
   Examples: `Frankfurt`, `New York`, `London`, `Paris`

   **Country Code:**
   ```
   [2-letter code]
   ```
   Examples:
   - `DE` for Germany
   - `US` for United States
   - `GB` for United Kingdom
   - `FR` for France
   - `NL` for Netherlands
   - `SG` for Singapore

   **IPv4:**
   ```
   46.62.201.216
   ```

3. **Click "Deploy" button**

4. **Wait a few seconds:**
   - System will try to SSH to the server
   - Will automatically fetch WireGuard public key
   - Server should appear in the list

---

## ➕ STEP 4: Add Server 2

1. **Click "Add Server" again**

2. **Fill in the form:**

   **Server Name:**
   ```
   Server 2 - [Location]
   ```

   **City:**
   ```
   [City name]
   ```

   **Country Code:**
   ```
   [2-letter code]
   ```

   **IPv4:**
   ```
   91.99.23.239
   ```

3. **Click "Deploy"**

---

## ✅ STEP 5: Verify Servers

After adding both servers:

1. **Check the list:**
   - Both servers should be visible
   - Status should show "Active" (green)
   - Load percentage should be displayed

2. **Click on a server to view details:**
   - Check that Public Key matches:
     - Server 1: `Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs=`
     - Server 2: `4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw=`

3. **If public key is missing or wrong:**
   - See "Manual Fix" section below

---

## 🔧 STEP 6: Manual Public Key Fix (If Needed)

If SSH didn't work or public key is wrong:

**On NexusVPN server, run:**

```bash
sudo -u postgres psql -d nexusvpn

# Fix Server 1
UPDATE servers 
SET "publicKey" = 'Zg+GFmD4cmOnxogfyh3OJXo+G031/Mu2RXrqoF53DHs='
WHERE ipv4 = '46.62.201.216';

# Fix Server 2
UPDATE servers 
SET "publicKey" = '4FR0Qj9KbrL34qzuu7DEp5zICAgc0Ucmn8d27zp2RUw='
WHERE ipv4 = '91.99.23.239';

# Verify
SELECT name, ipv4, "publicKey" FROM servers;

# Exit
\q
```

---

## 🧪 STEP 7: Test VPN Config Generation

1. **Logout from admin panel**

2. **Login as regular user:**
   - Go to: http://5.161.91.222:5173/#/login
   - Use your user account

3. **Go to Dashboard**

4. **Generate VPN Config:**
   - Look for "Generate Config" or "Add Device" button
   - Select one of your servers from dropdown
   - Click "Generate" or "Download"
   - Save the `.conf` file

5. **Verify the config file:**
   - Open the downloaded file
   - Should contain:
     ```
     [Interface]
     PrivateKey = [generated key]
     Address = 10.100.0.X/32
     DNS = 1.1.1.1
     
     [Peer]
     PublicKey = [Your server's public key]
     Endpoint = 46.62.201.216:51820  (or 91.99.23.239:51820)
     AllowedIPs = 0.0.0.0/0, ::/0
     PersistentKeepalive = 25
     ```

6. **Test in WireGuard client:**
   - Import the config
   - Connect
   - Should work!

---

## 📊 STEP 8: Monitor Your Servers

**In Admin Panel → Servers:**

- **Real-time Status**: See if servers are online/offline
- **Load**: Current server load percentage
- **Ping**: Response time
- **Details**: Click server to see:
  - Terminal access
  - Configuration
  - Logs
  - Usage stats

---

## 🎯 Quick Reference: What to Enter

### Server 1 Form:
```
Name: Server 1 - Frankfurt  (or your choice)
City: Frankfurt  (or actual city)
Country Code: DE  (or actual country code)
IPv4: 46.62.201.216
```

### Server 2 Form:
```
Name: Server 2 - Amsterdam  (or your choice)
City: Amsterdam  (or actual city)
Country Code: NL  (or actual country code)
IPv4: 91.99.23.239
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Server shows as Offline"

**Fix:**
```bash
# Test SSH from NexusVPN server
ssh -i /opt/nexusvpn/.ssh/id_rsa root@46.62.201.216 "uname -a"

# If fails, check:
# 1. SSH key is in authorized_keys on VPN server
# 2. Permissions are correct (600 for authorized_keys)
# 3. Firewall allows SSH (port 22)
```

### Issue: "Public Key not fetched"

**Fix:**
- Use manual database update (Step 6 above)
- Or setup SSH properly and re-add server

### Issue: "Can't generate VPN config"

**Check:**
1. Server is active in admin panel
2. Public key is set correctly
3. Backend logs: `pm2 logs nexusvpn-backend`

---

## ✅ Success Checklist

- [ ] SSH access works to both servers
- [ ] Server 1 added successfully
- [ ] Server 2 added successfully
- [ ] Both show as "Active"
- [ ] Public keys match your configs
- [ ] Can generate VPN configs
- [ ] Configs work in WireGuard client

---

## 🎉 You're Done!

Once both servers are added and working:
- ✅ Users can connect to your VPN servers
- ✅ System manages WireGuard automatically
- ✅ Usage data is tracked
- ✅ Health monitoring works
- ✅ Real VPN service is live!

---

**Need help? Check logs:**
```bash
# Backend logs
pm2 logs nexusvpn-backend

# Deployment logs
tail -f /var/log/nexusvpn-deploy.log
```

---

**Last Updated:** 17-12-2025 | Time: 02:36:44

