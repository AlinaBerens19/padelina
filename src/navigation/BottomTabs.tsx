import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import ProfileScreen from 'screens/Profile/ProfileScreen';
import SettingsScreen from 'screens/Settings/SettingsScreen';
import Placeholder from '../components/Placeholder';
import HomeScreen from '../screens/Home/HomeScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Settings') iconName = 'settings'; // <--- добавлено
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1ba158',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen || Placeholder('Home')} />
      <Tab.Screen name="Profile" component={ProfileScreen || Placeholder('Profile')} />
      <Tab.Screen name="Settings" component={SettingsScreen || Placeholder('Settings')} />
    </Tab.Navigator>
  );
}
