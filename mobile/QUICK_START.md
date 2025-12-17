# ⚡ Quick Start - Build APK Now

## 🎯 One-Command Build

```powershell
cd mobile
.\build-apk-now.ps1
```

That's it! The script will:
1. ✅ Check/install EAS CLI
2. ✅ Prompt for Expo login (if needed)
3. ✅ Generate assets (if missing)
4. ✅ Start the build

## 📱 After Build Completes

1. **Visit**: https://expo.dev/accounts/[your-username]/projects/nexusvpn-mobile/builds
2. **Download** the APK file
3. **Transfer** to your Android device
4. **Install** and test!

## 🔧 Manual Build (Alternative)

```powershell
cd mobile
eas login                    # Login to Expo
npm run build:android:apk    # Build APK
```

## ⚠️ Troubleshooting

**"Not logged in"**
```powershell
eas login
```

**"Build failed"**
- Check `DEPENDENCY_FIX.md` for version issues
- Verify assets exist: `mobile/assets/`
- Run: `npx expo-doctor`

**"Dependencies outdated"**
```powershell
npx expo install --check
```

---

**Ready? Run the build script above!** 🚀

