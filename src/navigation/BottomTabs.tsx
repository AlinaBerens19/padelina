import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import WelcomeScreen from 'screens/Matches/WelcomeScreen';
import ProfileScreen from 'screens/Profile/ProfileScreen';
import SettingsScreen from 'screens/Settings/SettingsScreen';
// import Placeholder from 'components/Placeholder'; // не нужен если есть реальные экраны

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, [string, string]> = {
            Matches: ['tennisball', 'tennisball-outline'], // 🟢 мяч
            Profile: ['person', 'person-outline'],
            Settings: ['settings', 'settings-outline'],
          };
          const [filled, outline] = icons[route.name] || ['ellipse', 'ellipse-outline'];
          const name = focused ? filled : outline;
          return <Ionicons name={name as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1ba158',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Matches" component={WelcomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
