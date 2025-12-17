# 🚀 Build APK Now - Quick Guide

## Method 1: Automated Script (Easiest)

Run the PowerShell script:

```powershell
cd mobile
.\build-apk-now.ps1
```

The script will:
1. Check/install EAS CLI
2. Prompt you to login (if needed)
3. Start the APK build

## Method 2: Manual Steps

### Step 1: Login to Expo

```bash
cd mobile
eas login
```

- Enter your email/username
- Enter your password  
- **Don't have an account?** Create one at https://expo.dev (free)

### Step 2: Build APK

```bash
npm run build:android:apk
```

OR

```bash
eas build --platform android --profile production
```

### Step 3: Wait & Download

- Build takes **5-15 minutes**
- You'll get a notification when done
- Download APK from: https://expo.dev/accounts/[your-username]/projects/nexusvpn-mobile/builds

## 📱 Install APK on Device

1. Transfer APK to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Open NexusVPN app

## ⚠️ Troubleshooting

### "Not logged in" error
- Run `eas login` first
- Create account at https://expo.dev if needed

### Build fails
- Check internet connection
- Ensure you're in the `mobile` directory
- Try: `npx expo start -c` to clear cache first

### Need help?
- See `BUILD_APK.md` for detailed guide
- Check Expo docs: https://docs.expo.dev/build/introduction/

---

**Ready? Run:** `.\build-apk-now.ps1` or follow Method 2 above! 🎯

