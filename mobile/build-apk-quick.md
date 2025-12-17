# Quick APK Build Instructions

## Option 1: EAS Build (Cloud - Recommended)

1. **Login to Expo** (one-time setup):
   ```bash
   cd mobile
   eas login
   ```
   - Enter your email/username
   - Enter your password
   - Or create account at https://expo.dev

2. **Build APK**:
   ```bash
   npm run build:android:apk
   ```
   - Wait 5-15 minutes
   - Download APK from https://expo.dev

## Option 2: Local Build (Requires Android Studio)

1. **Install Android Studio** (if not installed):
   - Download: https://developer.android.com/studio
   - Install Android SDK

2. **Build APK**:
   ```bash
   cd mobile\android
   .\gradlew assembleRelease
   ```
   - APK will be at: `android\app\build\outputs\apk\release\app-release.apk`

## Option 3: Development Build (For Testing)

```bash
cd mobile
npx expo run:android
```
This builds and installs on connected device/emulator.

