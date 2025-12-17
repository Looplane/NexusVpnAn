# 🧪 End-to-End Testing Guide - NexusVPN Mobile App

Complete testing checklist and procedures for the NexusVPN mobile application.

---

## 📋 Pre-Testing Checklist

### Prerequisites
- [ ] Backend API is deployed and accessible
- [ ] Database is set up and migrations are run
- [ ] APK is built and installed on test device
- [ ] Test user account is created
- [ ] Network connectivity is available

### Test Environment Setup
- [ ] Development backend URL configured
- [ ] Production backend URL configured (if testing production build)
- [ ] Test device has Android 5.0+ (API 21+)
- [ ] Device has internet connection

---

## 🔐 Authentication Testing

### Test Case 1: User Registration
**Steps:**
1. Open app
2. Tap "Register" or "Sign Up"
3. Fill in registration form:
   - Email: `test@example.com`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
   - Full Name: `Test User`
4. Tap "Register"

**Expected Results:**
- ✅ Form validation works (empty fields show errors)
- ✅ Password confirmation matches
- ✅ Email format is validated
- ✅ Registration succeeds
- ✅ User is redirected to login or dashboard
- ✅ Success message is displayed

**Negative Tests:**
- ❌ Invalid email format → Error shown
- ❌ Password too short → Error shown
- ❌ Passwords don't match → Error shown
- ❌ Duplicate email → Error shown

### Test Case 2: User Login
**Steps:**
1. Open app
2. Enter email: `test@example.com`
3. Enter password: `Test1234!`
4. Tap "Login"

**Expected Results:**
- ✅ Login succeeds
- ✅ User is redirected to Dashboard
- ✅ Token is stored securely
- ✅ User data is loaded

**Negative Tests:**
- ❌ Wrong password → Error shown
- ❌ Non-existent email → Error shown
- ❌ Network error → Error message displayed

### Test Case 3: Two-Factor Authentication (2FA)
**Steps:**
1. Login with account that has 2FA enabled
2. Enter 2FA code when prompted
3. Submit code

**Expected Results:**
- ✅ 2FA screen appears after login
- ✅ Code input accepts 6 digits
- ✅ Valid code → Login succeeds
- ✅ Invalid code → Error shown

**Negative Tests:**
- ❌ Wrong code → Error shown
- ❌ Expired code → Error shown
- ❌ Too many attempts → Account locked message

### Test Case 4: Session Management
**Steps:**
1. Login successfully
2. Close app
3. Reopen app

**Expected Results:**
- ✅ User remains logged in (if token valid)
- ✅ Token expiration → Auto logout
- ✅ User redirected to login if token expired

---

## 🏠 Dashboard Testing

### Test Case 5: Dashboard Load
**Steps:**
1. Login successfully
2. View dashboard

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ Connection status displays correctly
- ✅ Server information is shown
- ✅ Usage statistics are displayed
- ✅ All navigation buttons are visible

**Data Verification:**
- ✅ Current server name is correct
- ✅ Connection status (Connected/Disconnected) is accurate
- ✅ Data usage numbers are correct
- ✅ Connection time is displayed (if connected)

### Test Case 6: VPN Connection (Mock)
**Steps:**
1. On dashboard, tap "Connect" button
2. Wait for connection
3. Verify status changes
4. Tap "Disconnect"

**Expected Results:**
- ✅ Connect button changes to "Disconnecting..."
- ✅ Status updates to "Connected"
- ✅ Connection timer starts
- ✅ Disconnect button works
- ✅ Status returns to "Disconnected"

**Note:** This is currently mocked. Real VPN connection requires native WireGuard module.

---

## 🌍 Server Selection Testing

### Test Case 7: Server List
**Steps:**
1. Navigate to Server Selection screen
2. View server list

**Expected Results:**
- ✅ Server list loads from API
- ✅ All servers are displayed
- ✅ Server information is correct:
  - Country/Region name
  - City name
  - Server status (Online/Offline)
  - Load percentage
  - Ping/latency

**Data Verification:**
- ✅ Server count matches backend
- ✅ Server details match API response
- ✅ Offline servers are marked appropriately

### Test Case 8: Server Selection
**Steps:**
1. View server list
2. Tap on a server
3. Confirm selection

**Expected Results:**
- ✅ Server is selected
- ✅ Selection is highlighted
- ✅ User can confirm selection
- ✅ Returns to dashboard
- ✅ Selected server is shown on dashboard

**Negative Tests:**
- ❌ Selecting offline server → Warning shown
- ❌ Network error → Error message displayed

---

## ⚙️ Settings & Profile Testing

### Test Case 9: Profile View
**Steps:**
1. Navigate to Settings screen
2. View profile section

**Expected Results:**
- ✅ User email is displayed
- ✅ User name is displayed
- ✅ Account creation date is shown
- ✅ Subscription status is shown (if applicable)

### Test Case 10: Update Profile
**Steps:**
1. Go to Settings
2. Tap "Edit Profile"
3. Update name
4. Save changes

**Expected Results:**
- ✅ Profile form loads with current data
- ✅ Changes can be saved
- ✅ Success message is shown
- ✅ Updated data is reflected immediately

**Negative Tests:**
- ❌ Invalid data → Validation errors
- ❌ Network error → Error message

### Test Case 11: Change Password
**Steps:**
1. Go to Settings
2. Tap "Change Password"
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Save

**Expected Results:**
- ✅ Password change succeeds
- ✅ User can login with new password
- ✅ Old password no longer works

**Negative Tests:**
- ❌ Wrong current password → Error
- ❌ New password too weak → Validation error
- ❌ Passwords don't match → Error

---

## 📊 Data Usage Testing

### Test Case 12: Usage Statistics
**Steps:**
1. Navigate to Data Usage screen
2. View statistics

**Expected Results:**
- ✅ Total data used is displayed
- ✅ Upload/download breakdown is shown
- ✅ Usage history is listed
- ✅ Charts/graphs display correctly (if implemented)
- ✅ Date range filters work

**Data Verification:**
- ✅ Numbers match backend data
- ✅ Formatting is correct (MB/GB)
- ✅ History is sorted correctly

### Test Case 13: Usage History
**Steps:**
1. View Data Usage screen
2. Scroll through history
3. Tap on a history entry

**Expected Results:**
- ✅ History list loads
- ✅ Entries are in chronological order
- ✅ Details are accurate
- ✅ Pull-to-refresh works

---

## 🔧 Device Management Testing

### Test Case 14: Device List
**Steps:**
1. Navigate to Devices screen
2. View device list

**Expected Results:**
- ✅ All user devices are listed
- ✅ Device names are shown
- ✅ Device types are indicated
- ✅ Last active time is displayed
- ✅ Device status is shown

### Test Case 15: Generate VPN Config
**Steps:**
1. Go to Devices screen
2. Tap "Add Device" or "Generate Config"
3. Enter device name
4. Select server
5. Generate config

**Expected Results:**
- ✅ Config generation succeeds
- ✅ Config details screen is shown
- ✅ QR code is displayed
- ✅ Config file content is shown
- ✅ Copy/share buttons work

**Data Verification:**
- ✅ Config file format is correct (WireGuard format)
- ✅ QR code contains config data
- ✅ Device appears in device list

### Test Case 16: Revoke Device
**Steps:**
1. View device list
2. Tap on a device
3. Tap "Revoke" or "Delete"
4. Confirm deletion

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Device is removed after confirmation
- ✅ Device list updates
- ✅ Revoked device cannot connect

---

## 📱 VPN Config Details Testing

### Test Case 17: Config Display
**Steps:**
1. Navigate to a VPN config
2. View config details

**Expected Results:**
- ✅ QR code is displayed correctly
- ✅ Config file content is shown
- ✅ Device information is displayed
- ✅ Server information is shown
- ✅ Copy button works
- ✅ Share button works

### Test Case 18: QR Code Functionality
**Steps:**
1. View config with QR code
2. Scan QR code with WireGuard app (if available)

**Expected Results:**
- ✅ QR code is scannable
- ✅ QR code contains valid config data
- ✅ WireGuard app can import config

---

## 📜 Connection History Testing

### Test Case 19: History List
**Steps:**
1. Navigate to Connection History screen
2. View history list

**Expected Results:**
- ✅ Connection history loads
- ✅ Entries show:
  - Connection date/time
  - Server location
  - Duration
  - Data transferred
- ✅ List is sorted by date (newest first)
- ✅ Pull-to-refresh works

### Test Case 20: History Details
**Steps:**
1. View connection history
2. Tap on a history entry

**Expected Results:**
- ✅ Details screen opens
- ✅ All connection details are shown
- ✅ Information is accurate

---

## 🎫 Support Tickets Testing

### Test Case 21: Ticket List
**Steps:**
1. Navigate to Support screen
2. View ticket list

**Expected Results:**
- ✅ All user tickets are listed
- ✅ Ticket status is shown (Open/Closed/Resolved)
- ✅ Ticket subject is displayed
- ✅ Creation date is shown
- ✅ Empty state is shown if no tickets

### Test Case 22: Create Ticket
**Steps:**
1. Go to Support screen
2. Tap "New Ticket"
3. Fill in:
   - Subject
   - Message
   - Category (if applicable)
4. Submit ticket

**Expected Results:**
- ✅ Form validation works
- ✅ Ticket is created successfully
- ✅ Success message is shown
- ✅ Ticket appears in list
- ✅ Ticket status is "Open"

**Negative Tests:**
- ❌ Empty fields → Validation errors
- ❌ Network error → Error message

### Test Case 23: View Ticket
**Steps:**
1. View ticket list
2. Tap on a ticket

**Expected Results:**
- ✅ Ticket details screen opens
- ✅ Subject and message are shown
- ✅ Status is displayed
- ✅ Replies are shown (if any)
- ✅ Creation date is shown

---

## 🎁 Referrals Testing

### Test Case 24: Referral Stats
**Steps:**
1. Navigate to Referrals screen
2. View referral information

**Expected Results:**
- ✅ Referral code is displayed
- ✅ Total referrals count is shown
- ✅ Active referrals are listed
- ✅ Rewards/credits are displayed (if applicable)

### Test Case 25: Share Referral
**Steps:**
1. View Referrals screen
2. Tap "Share" or "Copy Code"

**Expected Results:**
- ✅ Referral code is copied to clipboard
- ✅ Share dialog opens (if share button)
- ✅ Code can be shared via messaging apps

---

## 🔄 Navigation Testing

### Test Case 26: Screen Navigation
**Steps:**
1. Navigate through all screens
2. Use back button
3. Use navigation menu

**Expected Results:**
- ✅ All screens are accessible
- ✅ Back navigation works
- ✅ Navigation menu works
- ✅ Deep linking works (if implemented)
- ✅ No navigation errors

**Screens to Test:**
- ✅ Login
- ✅ Register
- ✅ Dashboard
- ✅ Server Selection
- ✅ Settings
- ✅ Data Usage
- ✅ Devices
- ✅ Config Details
- ✅ Connection History
- ✅ Support
- ✅ Referrals

---

## 🌐 API Integration Testing

### Test Case 27: API Connectivity
**Steps:**
1. Ensure backend is running
2. Perform various API calls through the app

**Expected Results:**
- ✅ All API calls succeed
- ✅ Data is fetched correctly
- ✅ Errors are handled gracefully
- ✅ Loading states are shown
- ✅ Network errors are displayed

**API Endpoints to Test:**
- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `GET /api/locations`
- ✅ `GET /api/vpn/devices`
- ✅ `POST /api/vpn/generate`
- ✅ `GET /api/users/profile`
- ✅ `GET /api/usage/history`
- ✅ `GET /api/support/tickets`

### Test Case 28: Error Handling
**Steps:**
1. Disconnect device from internet
2. Try to perform API calls
3. Reconnect internet
4. Retry operations

**Expected Results:**
- ✅ Network errors are caught
- ✅ User-friendly error messages are shown
- ✅ Retry functionality works (if implemented)
- ✅ App doesn't crash
- ✅ Data syncs when connection restored

---

## 🔒 Security Testing

### Test Case 29: Token Storage
**Steps:**
1. Login successfully
2. Check token storage

**Expected Results:**
- ✅ Token is stored securely (expo-secure-store)
- ✅ Token is not visible in logs
- ✅ Token is sent in API requests
- ✅ Token expiration is handled

### Test Case 30: Session Security
**Steps:**
1. Login
2. Close app
3. Try to access app data

**Expected Results:**
- ✅ Session persists correctly
- ✅ Expired tokens cause logout
- ✅ Sensitive data is protected

---

## 📱 Device Compatibility Testing

### Test Case 31: Different Android Versions
**Test on:**
- Android 5.0 (API 21)
- Android 8.0 (API 26)
- Android 10 (API 29)
- Android 12 (API 31)
- Android 13+ (API 33+)

**Expected Results:**
- ✅ App installs on all versions
- ✅ App runs without crashes
- ✅ All features work
- ✅ UI displays correctly
- ✅ Permissions are requested correctly

### Test Case 32: Different Screen Sizes
**Test on:**
- Small phones (4-5 inches)
- Standard phones (5-6 inches)
- Large phones (6+ inches)
- Tablets (if supported)

**Expected Results:**
- ✅ UI adapts to screen size
- ✅ Text is readable
- ✅ Buttons are tappable
- ✅ No layout issues
- ✅ Responsive design works

---

## 🐛 Bug Reporting Template

When reporting bugs, include:

```
**Device:** [Device model and Android version]
**App Version:** [APK version]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Logs:**
[Error logs if available]
```

---

## ✅ Testing Checklist Summary

### Critical Tests (Must Pass)
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads
- [ ] API connectivity works
- [ ] VPN config generation works
- [ ] No crashes on main flows

### Important Tests (Should Pass)
- [ ] All screens are accessible
- [ ] Navigation works correctly
- [ ] Data displays correctly
- [ ] Error handling works
- [ ] Settings/profile updates work

### Nice-to-Have Tests
- [ ] All edge cases handled
- [ ] Performance is acceptable
- [ ] UI is polished
- [ ] Animations work smoothly

---

## 📊 Test Results Template

```
## Test Session: [Date]

### Environment
- Backend URL: [URL]
- App Version: [Version]
- Device: [Device]
- Android Version: [Version]

### Results
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional notes]
```

---

**Happy Testing!** 🧪

Run through these tests systematically and document any issues found. This will help ensure a high-quality release.

