// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// экраны Auth
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// экраны Main
import SettingsScreen from '../screens/Settings/SettingsScreen';
import BottomTabs from './BottomTabs';

import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isAuthenticated: boolean;
};

export default function AppNavigator({ isAuthenticated }: Props) {
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // Основной стек для авторизованных пользователей
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Основная вкладочная навигация */}
          <Stack.Screen name="Home" component={BottomTabs} />

          {/* Дополнительные экраны */}
          <Stack.Screen name="Settings"    component={SettingsScreen} />
        </Stack.Navigator>
      ) : (
        // Стек для неавторизованных (Login / Register)
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
