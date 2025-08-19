// C:\Users\Alina\Desktop\PadelinaClean\padelina\src\navigation\MainStackNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import BottomTabs from './BottomTabs';

// Типы маршрутов для MainStackNavigator
export type MainStackParamList = {
  Home: undefined;
  Settings: undefined;
  UserProfile: { userId: string };
  UserLevel: { userId: string };
};

const MainStack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <MainStack.Screen name="Home" component={BottomTabs} />
      <MainStack.Screen name="Settings" component={SettingsScreen} />
      <MainStack.Screen name="UserProfile" component={SettingsScreen} />
    </MainStack.Navigator>
  );
}
