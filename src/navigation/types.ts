// types.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import type { MainStackParamList } from './MainStackNavigator'; // путь подкорректируй под проект

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList>;
  EmailVerification: undefined;
  Login: undefined;
  Register: undefined;
};
