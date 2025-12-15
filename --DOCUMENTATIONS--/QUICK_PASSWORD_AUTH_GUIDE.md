# ⚡ Quick Password Authentication Guide

## TL;DR

NexusVPN now supports **optional password authentication** for SSH connections. Perfect for Windows Server 2019 and servers without SSH keys configured.

---

## 🚀 Quick Start

### Adding a Server with Password

1. **Go to Admin Panel** → Servers tab
2. **Click "Add New VPN Server"**
3. **Fill in the form:**
   - Server IP: `91.99.23.239`
   - SSH User: `Administrator`
   - **SSH Password:** `YourPassword123` ⭐ (NEW - Optional)
   - Name, City, Country, etc.
4. **Click "Add Server"**

That's it! The system will use password authentication if SSH keys aren't configured.

---

## 🔑 How It Works

### Authentication Priority

1. **First:** Tries SSH key authentication (if key exists)
2. **Fallback:** Uses password authentication (if password provided)
3. **Error:** If both fail, shows authentication error

### When to Use Password

✅ **Use password when:**
- Windows Server 2019 (like your 91.99.23.239 server)
- SSH keys not configured on remote server
- Quick setup without key exchange
- Testing or development

❌ **Don't use password when:**
- SSH keys are properly configured (more secure)
- Production servers with key-based auth working

---

## 📋 Database Migration

**One-time setup required:**

```sql
ALTER TABLE servers ADD COLUMN "sshPassword" TEXT;
```

Run this on your PostgreSQL database before using password authentication.

---

## 🔒 Security Notes

⚠️ **Important:**
- Passwords are currently stored in **plain text** in the database
- This is fine for development/testing
- **For production:** Consider encrypting passwords (see full guide)

✅ **Good news:**
- Passwords sent over HTTPS (encrypted in transit)
- Key-based auth still preferred (tried first)
- Password only used when needed

---

## 🐛 Troubleshooting

### "Authentication failed" error?

1. **Check password is correct** (no extra spaces)
2. **Verify SSH service running** on remote server
3. **Check firewall** allows port 22
4. **Test manually:**
   ```bash
   ssh Administrator@91.99.23.239
   # Enter password when prompted
   ```

### Password not being used?

1. **Check database** - password field exists and has value
2. **Check logs** - look for authentication attempts
3. **Verify** password is not empty string

---

## 📚 Full Documentation

For complete details, see:
- **[PASSWORD_AUTHENTICATION_IMPLEMENTATION.md](./PASSWORD_AUTHENTICATION_IMPLEMENTATION.md)** - Full technical guide
- **[WINDOWS_SERVER_2019_SSH_SETUP.md](./WINDOWS_SERVER_2019_SSH_SETUP.md)** - Windows SSH setup

---

## ✅ Checklist

Before using password authentication:

- [ ] Database migration run (`ALTER TABLE servers ADD COLUMN "sshPassword" TEXT;`)
- [ ] Backend code updated and deployed
- [ ] Frontend code updated and deployed
- [ ] Tested with a server (e.g., Windows Server 2019)
- [ ] Password authentication working
- [ ] (Optional) Password encryption implemented for production

---

**Last Updated:** December 2025  
**Status:** ✅ Ready to Use

