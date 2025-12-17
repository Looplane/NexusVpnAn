# 🔒 Fix 403 Forbidden Error on Admin Endpoints

## Problem

Getting `403 Forbidden` when accessing `/api/admin/stats` or other admin endpoints.

**Error:**
```
Request URL: http://5.161.91.222:3000/api/admin/stats
Status Code: 403 Forbidden
```

## Root Cause

The JWT token validation wasn't extracting the `role` field, so the `RolesGuard` couldn't verify admin access.

## ✅ Solution Applied

### Backend Fix

**File:** `backend/src/auth/jwt.strategy.ts`

**Changed:**
```typescript
// Before
async validate(payload: any) {
  return { userId: payload.sub, email: payload.email, plan: payload.plan };
}

// After
async validate(payload: any) {
  return { 
    userId: payload.sub, 
    email: payload.email, 
    plan: payload.plan,
    role: payload.role || 'user' // Include role for RolesGuard
  };
}
```

### Frontend Fix

**File:** `frontend/services/apiClient.ts`

Added better error handling for 403 errors:
```typescript
// Handle 403 Forbidden (Admin access required)
if (res.status === 403) {
  const errorText = await res.text();
  console.error(`[API] 403 Forbidden for ${endpoint}:`, errorText);
  window.dispatchEvent(new CustomEvent('auth:forbidden', { detail: { endpoint, message: errorText } }));
  throw new Error('Access denied. Admin privileges required.');
}
```

---

## 🔧 Deployment Steps

### Step 1: Update Backend

```bash
cd /opt/nexusvpn/backend
git pull origin main
npm run build
pm2 restart nexusvpn-backend
```

### Step 2: Update Frontend

```bash
cd /opt/nexusvpn/frontend
git pull origin main
# Frontend will auto-reload if using dev mode
# Or restart if using production build
```

### Step 3: Verify User Has Admin Role

Check if your user has admin role in the database:

```bash
sudo -u postgres psql -d nexusvpn -c "SELECT email, role FROM users WHERE email = 'your-email@example.com';"
```

If role is not 'admin', update it:

```bash
sudo -u postgres psql -d nexusvpn -c "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
```

### Step 4: Re-login

**Important:** After the fix, you need to **log out and log back in** to get a new JWT token with the role field properly included.

1. Log out from the admin panel
2. Log back in
3. The new token will include the role field
4. Admin endpoints should now work

---

## 🧪 Testing

### Test 1: Check Token Contains Role

After logging in, check the JWT token in browser console:

```javascript
// In browser console
const token = localStorage.getItem('nexus_vpn_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Role:', payload.role); // Should be 'admin'
```

### Test 2: Test Admin Endpoint

```bash
# Get token from browser localStorage
TOKEN="your-jwt-token-here"

# Test admin stats endpoint
curl -H "Authorization: Bearer $TOKEN" \
     http://5.161.91.222:3000/api/admin/stats
```

Should return JSON data, not 403.

---

## 🐛 Troubleshooting

### Issue: Still getting 403 after fix

**Possible causes:**

1. **User doesn't have admin role:**
   ```bash
   # Check user role
   sudo -u postgres psql -d nexusvpn -c "SELECT email, role FROM users;"
   
   # Make user admin
   sudo -u postgres psql -d nexusvpn -c "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
   ```

2. **Old token still in use:**
   - Clear browser localStorage
   - Log out and log back in
   - New token will have role field

3. **Backend not restarted:**
   ```bash
   cd /opt/nexusvpn/backend
   pm2 restart nexusvpn-backend
   pm2 logs nexusvpn-backend --lines 20
   ```

4. **JWT secret mismatch:**
   - Check `backend/.env` has `JWT_SECRET` set
   - Restart backend after changing secret

### Issue: Token doesn't have role field

**Check JWT payload:**
```javascript
// In browser console
const token = localStorage.getItem('nexus_vpn_token');
if (token) {
  const parts = token.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Role in token:', payload.role);
  }
}
```

If role is missing, the login endpoint needs to include it. Check `backend/src/auth/auth.service.ts`:

```typescript
// Should include role in payload
const payload = { email: user.email, sub: user.id, plan: user.plan, role: user.role };
```

---

## 📋 Checklist

Before reporting the issue:

- [ ] Backend code updated and restarted
- [ ] Frontend code updated
- [ ] User has `role = 'admin'` in database
- [ ] Logged out and logged back in (new token)
- [ ] JWT token contains `role` field (check in console)
- [ ] Backend logs show no errors
- [ ] Network tab shows Authorization header with Bearer token

---

## 🔍 Debug Commands

### Check Backend Logs

```bash
pm2 logs nexusvpn-backend --lines 50
```

Look for:
- JWT validation errors
- Role guard failures
- Authentication errors

### Check Database

```bash
# List all users and roles
sudo -u postgres psql -d nexusvpn -c "SELECT id, email, role, \"isActive\" FROM users;"

# Check specific user
sudo -u postgres psql -d nexusvpn -c "SELECT * FROM users WHERE email = 'your-email@example.com';"
```

### Test API Directly

```bash
# Get token from browser
TOKEN="paste-token-here"

# Test endpoint
curl -v \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://5.161.91.222:3000/api/admin/stats
```

---

## ✅ Expected Behavior

After fix:

1. ✅ User logs in with admin account
2. ✅ JWT token includes `role: 'admin'`
3. ✅ Admin endpoints return data (not 403)
4. ✅ Admin panel loads stats successfully

---

**Last Updated:** December 2025  
**Status:** ✅ Fixed

