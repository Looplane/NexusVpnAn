# ⚡ Quick Guide: Add Your 2 VPN Servers

**Document ID:** SET-QUICK-ADD-001  
**Created:** 17-12-2025 | Time: 02:36:44  
**Last Updated:** 17-12-2025 | Time: 02:36:44

**Related Documents:**
- @--DOCUMENTATIONS--/07-Setup/04-SET-Step_By_Step_Add_Servers_17-12-2025_023644.md
- @--DOCUMENTATIONS--/07-Setup/02-SET-Add_VPN_Servers_Guide_17-12-2025_022800.md

---

## 🎯 What You Need

From your configs:
- **Server 1**: `46.62.201.216:51820`
- **Server 2**: `91.99.23.239:51820`

---

## 🚀 Quick Steps

### 1. Setup SSH (5 minutes)

**On NexusVPN server:**
```bash
cat /opt/nexusvpn/.ssh/id_rsa.pub
# Copy the output
```

**On each VPN server (46.62.201.216 and 91.99.23.239):**
```bash
ssh root@46.62.201.216
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit

# Repeat for server 2
ssh root@91.99.23.239
# Same commands
```

### 2. Add Servers in Admin Panel

**Access:** http://5.161.91.222:5173/#/admin

**Login:** `admin@nexusvpn.com` / `password`

**For Server 1:**
- Click "Add Server"
- Name: `Server 1` (or your choice)
- City: `[Your city]`
- Country Code: `[2 letters, e.g., DE, US, FR]`
- IPv4: `46.62.201.216`
- Click "Deploy"

**For Server 2:**
- Click "Add Server"
- Name: `Server 2` (or your choice)
- City: `[Your city]`
- Country Code: `[2 letters]`
- IPv4: `91.99.23.239`
- Click "Deploy"

### 3. Verify

- Both servers should appear in the list
- Status should be "Active"
- Public keys should be auto-fetched

### 4. Test

- Logout from admin
- Login as user
- Generate VPN config
- Should work!

---

**That's it! Your servers are now integrated!** ✅

---

**Last Updated:** 17-12-2025 | Time: 02:36:44

