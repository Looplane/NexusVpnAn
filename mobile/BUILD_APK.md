# Building NexusVPN APK

Complete guide for building Android APK files for NexusVPN mobile app.

## 🚀 Quick Start

### Option 1: EAS Build (Easiest - Cloud Build)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```
   Create a free account at https://expo.dev if needed.

3. **Configure EAS (First Time)**
   ```bash
   cd mobile
   eas build:configure
   ```
   This creates `eas.json` if it doesn't exist.

4. **Build APK**
   ```bash
   npm run build:android:apk
   ```
   OR
   ```bash
   eas build --platform android --profile production
   ```

5. **Download APK**
   - Visit https://expo.dev/accounts/[your-username]/projects/nexusvpn-mobile/builds
   - Wait for build to complete (5-15 minutes)
   - Download the APK file

### Option 2: Local Build (Requires Android Studio)

1. **Install Prerequisites**
   - Android Studio: https://developer.android.com/studio
   - Java JDK 11+
   - Android SDK (via Android Studio)

2. **Generate Native Project**
   ```bash
   cd mobile
   npm run prebuild
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Find APK**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: Expo Development Build

For testing on physical devices:
```bash
cd mobile
npx expo run:android
```

## 📋 Build Configuration

### Current Settings
- **Package Name**: `com.nexusvpn.mobile`
- **Version**: `1.0.0`
- **Version Code**: `1`
- **Min SDK**: 21 (Android 5.0+)
- **Target SDK**: 33 (Android 13)

### Update Version
Edit `mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

## 🔧 Pre-Build Checklist

- [ ] Update API URL in `src/services/apiClient.ts` for production
- [ ] Update version in `app.json` if needed
- [ ] Ensure all assets exist (`assets/icon.png`, `assets/splash.png`, etc.)
- [ ] Test app in development mode
- [ ] Review Android permissions in `app.json`

## 🌐 Production API Configuration

Before building for production, update `mobile/src/services/apiClient.ts`:

```typescript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Development
  : 'https://nexusvpn-api.onrender.com/api';  // Production
```

Replace `https://nexusvpn-api.onrender.com/api` with your actual backend URL.

## 🔐 Signing APK (For Play Store)

### Using EAS
1. Generate keystore:
   ```bash
   eas credentials
   ```
2. EAS will manage signing automatically

### Manual Signing
1. Generate keystore:
   ```bash
   keytool -genkey -v -keystore nexusvpn-release.keystore -alias nexusvpn -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Configure in `android/app/build.gradle`

## 📱 Testing APK

### Install on Device
```bash
adb install app-release.apk
```

### Test Checklist
- [ ] App launches successfully
- [ ] Login/Register works
- [ ] API connections work
- [ ] All screens navigate correctly
- [ ] VPN connection UI works (mock)
- [ ] Settings and profile work

## 🐛 Troubleshooting

### Build Fails
- Clear cache: `npx expo start -c`
- Delete `node_modules`: `rm -rf node_modules && npm install`
- Check Expo CLI version: `npx expo --version`

### APK Too Large
- Enable ProGuard in `android/app/build.gradle`
- Remove unused dependencies
- Optimize images

### Network Errors
- Verify API URL in `apiClient.ts`
- Check backend is running
- Test with development build first

## 📚 Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Build Guide](https://docs.expo.dev/build/android/)
- [App Signing](https://docs.expo.dev/app-signing/app-credentials/)

---

**Note**: For production releases, always test thoroughly on real devices before distribution.

