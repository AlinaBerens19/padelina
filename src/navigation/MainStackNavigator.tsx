// src/navigation/MainStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import UserLevelScreen from '../screens/User/UserLevelScreen';
import UserProfileScreen from '../screens/User/UserProfileScreen';
import BottomTabs from './BottomTabs';

// 1. Определение типов для экранов в этом навигаторе
export type MainStackParamList = {
  Home: undefined;
  Settings: undefined;
  UserProfile: { userId: string };
  UserLevel: { userId: string };
};

// 2. Создание навигатора с использованием типизации
const MainStack = createNativeStackNavigator<MainStackParamList>();

// 3. Компонент навигатора
export default function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Home" component={BottomTabs} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="UserProfile" component={UserProfileScreen} />
      <MainStack.Screen name="UserLevel" component={UserLevelScreen} />
    </MainStack.Navigator>
  );
}