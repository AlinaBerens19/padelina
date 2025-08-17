import { MainStackParamList } from "./MainStackNavigator";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateMatch: undefined;
  Chat: undefined;
  Profile: undefined;
  Search: undefined;
  Settings: undefined;
  UserProfile: { userId: string };
  UserLevel: { userId: string };
  EmailVerification: undefined;
  // 'Main' теперь может принимать параметры, чтобы указать, на какой экран
  // внутри него нужно перейти, и какие параметры ему передать.
  Main: {
    screen: keyof MainStackParamList;
    params?: {
      userId?: string;
    };
  } | undefined;
};

// Чтобы использовать тип Main, нам нужно знать, какие экраны есть в MainStack.
// Создайте этот тип, если он еще не существует.
// src/navigation/MainStackNavigator.tsx
// export type MainStackParamList = {
//   Home: undefined;
//   Settings: undefined;
//   UserProfile: { userId: string };
//   UserLevel: { userId: string };
// };