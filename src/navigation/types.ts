import { NavigatorScreenParams } from '@react-navigation/native';

// Типы для MainStackNavigator
export type MainStackParamList = {
  UserProfile: { userId: string };
  // Добавьте другие экраны, если они есть в MainStackNavigator
};

// Типы для корневого навигатора AppNavigator
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList>; // ✅ Это говорит, что Main — это навигатор, и мы можем навигировать на его экраны
  EmailVerification: undefined;
  Login: undefined;
  Register: undefined;
};