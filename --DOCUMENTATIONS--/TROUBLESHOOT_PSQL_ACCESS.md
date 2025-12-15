# 🔧 Troubleshooting PostgreSQL Access Issues

## Issue: `sudo -u postgres psql -d nexusvpn` - No Response / Beep

### Common Causes:
1. **Terminal hanging** - psql is waiting for input
2. **Database connection issue** - PostgreSQL not running
3. **Permission issue** - User can't access database
4. **Terminal encoding** - Special characters causing issues

---

## ✅ Quick Fixes

### Option 1: Check if PostgreSQL is Running

```bash
sudo systemctl status postgresql
```

If not running:
```bash
sudo systemctl start postgresql
```

### Option 2: Try Direct psql Access (No sudo)

```bash
psql -U postgres -d nexusvpn
```

If it asks for password, use the postgres password or try:
```bash
psql -U postgres -d nexusvpn -h localhost
```

### Option 3: Use psql with Explicit Connection

```bash
sudo -u postgres psql -h localhost -d nexusvpn
```

### Option 4: Check PostgreSQL Port

```bash
sudo netstat -tlnp | grep 5432
```

Should show PostgreSQL listening on port 5432.

---

## 🔍 Alternative: Use SQL File Instead

If psql interactive mode doesn't work, create a SQL file and execute it:

### Step 1: Create SQL File

```bash
cat > /tmp/find_server.sql << 'EOF'
SELECT id, name, ipv4, "sshUser", city, country, "createdAt" 
FROM servers 
ORDER BY "createdAt" DESC;
EOF
```

### Step 2: Execute SQL File

```bash
sudo -u postgres psql -d nexusvpn -f /tmp/find_server.sql
```

### Step 3: Update Server (if found)

```bash
cat > /tmp/update_server.sql << 'EOF'
UPDATE servers SET "sshUser" = 'Administrator' WHERE ipv4 = '91.99.23.239';
SELECT id, name, ipv4, "sshUser" FROM servers WHERE ipv4 = '91.99.23.239';
EOF

sudo -u postgres psql -d nexusvpn -f /tmp/update_server.sql
```

---

## 🚀 One-Line Commands (Copy-Paste Ready)

### Find Server by IP:
```bash
sudo -u postgres psql -d nexusvpn -c "SELECT id, name, ipv4, \"sshUser\", city, country FROM servers WHERE ipv4 = '91.99.23.239';"
```

### List All Servers:
```bash
sudo -u postgres psql -d nexusvpn -c "SELECT id, name, ipv4, \"sshUser\", city, country, \"createdAt\" FROM servers ORDER BY \"createdAt\" DESC;"
```

### Update sshUser:
```bash
sudo -u postgres psql -d nexusvpn -c "UPDATE servers SET \"sshUser\" = 'Administrator' WHERE ipv4 = '91.99.23.239'; SELECT id, name, ipv4, \"sshUser\" FROM servers WHERE ipv4 = '91.99.23.239';"
```

---

## 🔧 If psql Still Doesn't Work

### Check PostgreSQL Installation:
```bash
which psql
psql --version
```

### Check Database Exists:
```bash
sudo -u postgres psql -l | grep nexusvpn
```

### Check User Permissions:
```bash
sudo -u postgres psql -c "\du"
```

---

## 💡 PuTTY-Specific Issues

### Issue: Terminal Not Responding
1. **Press `Ctrl+C`** to cancel
2. **Try typing `exit`** and press Enter
3. **Close and reopen PuTTY session**

### Issue: Special Characters
- Make sure PuTTY encoding is set to **UTF-8**
- Settings → Window → Translation → UTF-8

### Issue: Terminal Size
- Try resizing PuTTY window
- Settings → Window → Columns: 80, Rows: 24

---

## ✅ Recommended: Use One-Line Commands

Instead of interactive psql, use `-c` flag for single commands:

```bash
# Find server
sudo -u postgres psql -d nexusvpn -c "SELECT id, name, ipv4, \"sshUser\" FROM servers WHERE ipv4 = '91.99.23.239';"

# Update server
sudo -u postgres psql -d nexusvpn -c "UPDATE servers SET \"sshUser\" = 'Administrator' WHERE ipv4 = '91.99.23.239';"

# Verify update
sudo -u postgres psql -d nexusvpn -c "SELECT id, name, ipv4, \"sshUser\" FROM servers WHERE ipv4 = '91.99.23.239';"
```

This avoids interactive mode issues!

