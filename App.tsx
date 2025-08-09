import auth from '@react-native-firebase/auth';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SpinnerOverlay from './src/components/SpinnerOverlay';
import { useAuth } from './src/hooks/useAuth';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const { initializing, isAuthenticated } = useAuth();

  React.useEffect(() => {
    console.log('✅ Firebase default app:', auth().app.name); // [DEFAULT]
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
