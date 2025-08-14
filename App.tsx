// App.tsx
import 'react-native-get-random-values'; // ← для uuid/crypto
import './src/polyfills/networking'; // ← патч RN Networking (timeout/withCredentials)

import { getApp } from '@react-native-firebase/app';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpinnerOverlay from './src/components/SpinnerOverlay';
import { useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

// ✅ конфиг Google Sign-In (использует EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)
import { configureGoogleSignIn } from './src/services/firebase/auth';

export default function App() {
  const { initializing, isAuthenticated } = useAuth();

  React.useEffect(() => {
    // 1) Инициализация Google Sign-In
    configureGoogleSignIn();

    // 2) (опционально) проверка, что Firebase App поднят
    try {
      const app = getApp(); // [DEFAULT]
      console.log('✅ Firebase default app:', app.name);
    } catch (e) {
      console.warn('⚠️ Firebase app not initialized yet:', e);
    }
  }, []);

  if (initializing) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.center}>
          <Text>Initializing App...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator isAuthenticated={isAuthenticated} />
      <SpinnerOverlay />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
