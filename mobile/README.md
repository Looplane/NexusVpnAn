# NexusVPN Mobile App

React Native mobile application for NexusVPN built with Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (optional, included in dependencies)

### Installation
```bash
cd mobile
npm install
```

### Run the App

#### Web (for testing)
```bash
npm run web
```

#### iOS Simulator
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

#### Development Server
```bash
npm start
```

## 📱 Features

- ✅ User Authentication (Login/Register)
- ✅ Two-Factor Authentication (2FA)
- ✅ Server Selection
- ✅ VPN Connection Management (Mock - ready for native module)
- ✅ Settings & Profile Management
- ✅ Real-time Connection Status
- ✅ Pull-to-Refresh

## 🔧 Configuration

### API Configuration
Edit `src/services/apiClient.ts`:

```typescript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Android emulator
  : 'https://your-backend.onrender.com/api';  // Production
```

**Note**: 
- Android Emulator: Use `10.0.2.2` for localhost
- iOS Simulator: Use `localhost` or your LAN IP
- Physical Device: Use your computer's LAN IP

## 📁 Project Structure

```
mobile/
├── App.tsx                    # Navigation setup
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── src/
│   ├── components/
│   │   └── UI.tsx            # Reusable UI components
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── TwoFactorScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ServerSelectionScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── services/
│       ├── apiClient.ts      # Backend API client
│       └── vpnService.ts     # VPN connection service
```

## 🔌 API Integration

The app connects to the NexusVPN backend API:

- **Authentication**: `/api/auth/*`
- **Locations**: `/api/locations`
- **VPN**: `/api/vpn/*`
- **User**: `/api/users/*`

See `src/services/apiClient.ts` for all endpoints.

## 🔐 Security

### Token Storage
- Uses `expo-secure-store` for secure token storage
- Tokens are encrypted and stored securely

### Security Notes
- See `SECURITY_NOTES.md` for vulnerability information
- Development tool vulnerabilities don't affect production builds

## 📦 Building APK

### Prerequisites for APK Build
- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Expo account (free): Sign up at https://expo.dev

### Method 1: EAS Build (Recommended - Cloud Build)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure

# Build APK for Android
npm run build:android:apk
# OR
eas build --platform android --profile production
```

The APK will be available for download from your Expo dashboard.

### Method 2: Local Build (Requires Android Studio)
```bash
# Generate native Android project
npm run prebuild

# Build APK locally (requires Android Studio setup)
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Method 3: Expo Development Build
```bash
# For testing on physical devices
npx expo run:android
```

### Build Configuration
- **Package Name**: `com.nexusvpn.mobile`
- **Version**: `1.0.0` (versionCode: 1)
- **Min SDK**: 21 (Android 5.0+)
- **Target SDK**: 33 (Android 13)

### Environment-Specific Builds
Update `src/services/apiClient.ts` before building:
```typescript
const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Development
  : 'https://nexusvpn-api.onrender.com/api';  // Production
```

## 🎯 Next Steps

### For Native WireGuard Integration (MOB-004)
1. Install WireGuard native module
2. Replace mock in `vpnService.ts`
3. Add VPN permissions to `app.json`
4. Test on real devices

### For Production
1. Update API URL in `apiClient.ts`
2. Configure app signing in EAS
3. Build for App Store/Play Store
4. Test on real devices

## 🐛 Troubleshooting

### Common Issues

#### "Network request failed"
- Check API URL in `apiClient.ts`
- Ensure backend is running
- For Android emulator, use `10.0.2.2` instead of `localhost`

#### "Cannot connect to Metro"
- Clear cache: `npx expo start -c`
- Restart Metro bundler

#### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `npx expo start -c`

## 📚 Documentation

- **Completion Summary**: `--DOCUMENTATIONS--/MOBILE_APP_COMPLETE.md`
- **Security Notes**: `SECURITY_NOTES.md`
- **Backend API**: See backend documentation

## 📄 License

Proprietary - All Rights Reserved

---

**Built with ❤️ using React Native & Expo**

