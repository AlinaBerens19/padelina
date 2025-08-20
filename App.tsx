// App.tsx
import 'expo-dev-client';
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import './src/polyfills/xhr-sanitize'; // 👈 новый мягкий патч
// (удали любые прежние polyfills/networking)

import { getApp } from '@react-native-firebase/app';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import SpinnerOverlay from './src/components/SpinnerOverlay';
import { useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

// Google Sign-In конфиг (использует EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID)
import { configureGoogleSignIn } from './src/services/firebase/auth';

export default function App() {
  const { initializing } = useAuth();

  React.useEffect(() => {
    // Инициализация Google Sign-In один раз на старте
    configureGoogleSignIn();

    // Проверка, что Firebase [DEFAULT] поднят
    try {
      const app = getApp();
      console.log('✅ Firebase default app:', app.name);
    } catch (e) {
      console.warn('⚠️ Firebase app not initialized yet:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      {initializing ? (
        <SafeAreaView style={styles.spinnerScreen}>
          <SpinnerOverlay />
        </SafeAreaView>
      ) : (
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  spinnerScreen: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
