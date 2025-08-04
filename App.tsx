import firebase from '@react-native-firebase/app';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpinnerOverlay from './src/components/SpinnerOverlay';
import { useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  // Проверяем, что нативный Firebase App подхватывается автоматически
  useEffect(() => {
    console.log('✅ Firebase default app:', firebase.app().name);
  }, []);

  const { initializing, isAuthenticated } = useAuth();

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
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe}>
          {isAuthenticated ? (
            <AppNavigator />
          ) : (
            <Text style={styles.center}>Please log in to continue</Text>
          )}
        </SafeAreaView>
        <SpinnerOverlay />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  safe: { flex: 1, backgroundColor: '#fff' },
});
