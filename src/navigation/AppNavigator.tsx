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

import auth from '@react-native-firebase/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && user) {
      verifyUser();
    } else if (!initializing && !user) {
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [initializing, user?.uid]);

  const verifyUser = async () => {
    try {
      await auth().currentUser?.reload(); // 🔄 Получаем актуальные данные о пользователе
      const refreshedUser = auth().currentUser;

      if (refreshedUser?.emailVerified) {
        navigationRef.current?.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              state: {
                index: 0,
                routes: [{ name: 'BottomTabs', params: { userId: refreshedUser.uid } }],
              },
            },
          ],
        });
      } else {
        navigationRef.current?.reset({ index: 0, routes: [{ name: 'EmailVerification' }] });
      }
    } catch (e) {
      console.warn('Error verifying user', e);
      navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

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
