// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { navigationRef } from './navigationRef';

import EmailVerificationScreen from '../screens/Auth/EmailVerificationScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import MainStackNavigator from './MainStackNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    // ✅ Более явная и безопасная проверка
    if (user.emailVerified === true) {
      navigationRef.current?.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              index: 0,
              routes: [{ name: 'UserProfile', params: { userId: user.uid } }],
            },
          },
        ],
      });
    } else {
      // ✅ Если user.emailVerified === false или undefined
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'EmailVerification' }] });
    }
  }, [initializing, user?.uid, user?.emailVerified]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainStackNavigator} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}