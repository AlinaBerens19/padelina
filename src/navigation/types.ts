// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import type { MainStackParamList } from './MainStackNavigator'; // поправь путь при необходимости

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainStackParamList> | undefined; // ⬅️ добавили | undefined
  EmailVerification: undefined;
  Login: undefined;
  Register: undefined;
};
