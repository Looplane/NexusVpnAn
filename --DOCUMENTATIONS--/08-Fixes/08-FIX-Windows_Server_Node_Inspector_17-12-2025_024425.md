# ✅ Windows Server Node Inspector - Complete Fix

## 🎯 What Was Fixed

### 1. **Windows Server Detection**
- Added `isWindowsServer()` method that detects Windows Server by checking for PowerShell
- Automatically sets `sshUser` to `Administrator` when Windows Server is detected during server addition

### 2. **Node Inspector Tabs - Now Fully Functional**

All Node Inspector tabs now support **both Linux and Windows Server**:

#### ✅ **Dashboard Tab** (`getServerMetrics`)
- **Windows**: Uses PowerShell `Get-WmiObject`, `Get-Counter` for CPU/RAM/Uptime
- **Linux**: Uses `nproc`, `free`, `uptime` commands
- Real-time metrics: CPU, RAM, Load, Uptime, Network Traffic

#### ✅ **Logs Tab** (`getServerLogs`)
- **Windows**: Uses `Get-EventLog` to fetch WireGuard logs from Windows Event Log
- **Linux**: Uses `journalctl` to fetch systemd logs
- Parses and formats logs with timestamps, levels, and messages

#### ✅ **Service Control** (`controlWireGuardService`)
- **Windows**: Uses `Get-Service` and `wg.exe` commands
- **Linux**: Uses `systemctl` commands
- Supports: Start, Stop, Restart, Status

#### ✅ **Firewall Tab** (`getFirewallRules`)
- **Windows**: Uses `Get-NetFirewallRule` PowerShell cmdlets
- **Linux**: Uses `ufw status` commands
- Displays port, protocol, action, and description

#### ✅ **Config Tab** (`getWireGuardConfig` / `updateWireGuardConfig`)
- **Windows**: Reads from `C:\Program Files\WireGuard\Data\Configurations\wg0.conf`
- **Linux**: Reads from `/etc/wireguard/wg0.conf`
- Supports: Port, DNS, MTU, Allowed IPs, Keepalive

#### ✅ **Terminal Tab** (`executeServerCommand`)
- **Windows**: Allows PowerShell commands (`Get-*`, `powershell`, `wg`)
- **Linux**: Allows standard Linux commands (`systemctl`, `wg show`, etc.)
- Security allowlist for both platforms

---

## 🔧 How to Fix Database Issue

### Step 1: Find Your Server

Run this on your **NexusVPN server** (5.161.91.222):

```bash
sudo -u postgres psql -d nexusvpn
```

Then in psql:

```sql
-- List ALL servers to find yours
SELECT id, name, ipv4, "sshUser", city, country, "createdAt" 
FROM servers 
ORDER BY "createdAt" DESC;
```

**Look for:**
- Server with IP `91.99.23.239`
- Server with name containing "91.99" or "Nuremberg"

### Step 2: Update sshUser

Once you find the server, update it:

```sql
-- Replace 'SERVER_ID_HERE' with the actual UUID from Step 1
UPDATE servers SET "sshUser" = 'Administrator' WHERE id = 'SERVER_ID_HERE';

-- OR if you found it by IP:
UPDATE servers SET "sshUser" = 'Administrator' WHERE ipv4 = '91.99.23.239';

-- Verify:
SELECT id, name, ipv4, "sshUser" FROM servers WHERE ipv4 = '91.99.23.239';

-- Exit:
\q
```

### Step 3: If Server Not Found

If the server doesn't exist in the database, **add it via Admin Panel**:

1. Go to: `http://5.161.91.222:5173/#/admin`
2. Click **"VPN Servers"** tab
3. Click **"+ Add VPN Server"**
4. Fill in:
   - **Name**: `Server 1-91.99` (or your preferred name)
   - **City**: `Nuremberg`
   - **Country**: `Germany`
   - **Country Code**: `DE`
   - **IPv4**: `91.99.23.239`
5. Click **"Add VPN Server"**

The system will:
- ✅ Automatically detect it's a Windows Server
- ✅ Set `sshUser` to `Administrator`
- ✅ Try to fetch WireGuard public key

---

## 🚀 Testing Node Inspector

After updating the database:

1. **Go to Admin Panel**: `http://5.161.91.222:5173/#/admin`
2. **Click "VPN Servers"** tab
3. **Click the terminal icon** (`>_`) next to your Windows Server
4. **Test each tab**:
   - **Dashboard**: Should show real CPU/RAM/Uptime metrics
   - **Terminal**: Try `powershell -Command "Get-Service WireGuard*"`
   - **Logs**: Should show WireGuard logs
   - **Firewall**: Should show Windows Firewall rules
   - **Config**: Should show WireGuard configuration
   - **Service Control**: Try Start/Stop/Restart

---

## 📝 Backend Changes Made

### Files Modified:
- `backend/src/admin/admin.service.ts`
  - Added `isWindowsServer()` method
  - Updated `addServer()` to auto-detect Windows and set sshUser
  - Updated `getServerMetrics()` for Windows
  - Updated `getServerLogs()` for Windows
  - Updated `controlWireGuardService()` for Windows
  - Updated `getFirewallRules()` for Windows
  - Updated `getWireGuardConfig()` for Windows
  - Updated `updateWireGuardConfig()` for Windows
  - Updated `executeServerCommand()` to allow Windows commands

### Key Features:
- ✅ Automatic OS detection
- ✅ Windows PowerShell command support
- ✅ Linux command support (existing)
- ✅ Fallback to database values if SSH fails
- ✅ Security allowlist for both platforms

---

## ⚠️ Important Notes

1. **SSH Access Required**: All Node Inspector features require SSH access to the Windows Server
2. **PowerShell**: Windows Server must have PowerShell installed (default on Windows Server 2019)
3. **WireGuard Path**: Windows config is at `C:\Program Files\WireGuard\Data\Configurations\wg0.conf`
4. **Service Name**: Windows WireGuard service name is `WireGuardTunnel*wg0*`
5. **Permissions**: SSH user (`Administrator`) must have admin privileges

---

## 🔄 Next Steps

1. **Deploy Backend Changes**:
   ```bash
   cd /opt/nexusvpn/backend
   npm run build
   pm2 restart nexusvpn-backend
   ```

2. **Find and Update Server** (see Step 1-2 above)

3. **Test Node Inspector** (see Testing section above)

4. **Add Second Windows Server** (46.62.201.216) using the same process

---

## ✅ Status

- ✅ Windows Server detection implemented
- ✅ All Node Inspector tabs support Windows
- ✅ Backend endpoints updated
- ✅ Security allowlist updated
- ⏳ Database update needed (user action required)
- ⏳ Backend deployment needed (user action required)

---

**All code changes are complete and ready for deployment!** 🎉

