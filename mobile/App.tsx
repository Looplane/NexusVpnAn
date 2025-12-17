import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/contexts/ToastContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TwoFactorScreen from './src/screens/TwoFactorScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ServerSelectionScreen from './src/screens/ServerSelectionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DataUsageScreen from './src/screens/DataUsageScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import ConfigDetailsScreen from './src/screens/ConfigDetailsScreen';
import ConnectionHistoryScreen from './src/screens/ConnectionHistoryScreen';
import SupportScreen from './src/screens/SupportScreen';
import ReferralsScreen from './src/screens/ReferralsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#020617" />
              <Stack.Navigator 
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#020617' },
                  animation: 'slide_from_right'
                }}
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="ServerSelection" component={ServerSelectionScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="DataUsage" component={DataUsageScreen} />
                <Stack.Screen name="Devices" component={DevicesScreen} />
                <Stack.Screen name="ConfigDetails" component={ConfigDetailsScreen} />
                <Stack.Screen name="ConnectionHistory" component={ConnectionHistoryScreen} />
                <Stack.Screen name="Support" component={SupportScreen} />
                <Stack.Screen name="Referrals" component={ReferralsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}