// src/navigation/navigationRef.ts
import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Условный кортеж: если у экрана params = undefined, второй аргумент опционален;
// иначе — обязателен.
type NavArgs<Name extends keyof RootStackParamList> =
  undefined extends RootStackParamList[Name]
    ? [screen: Name] | [screen: Name, params: RootStackParamList[Name]]
    : [screen: Name, params: RootStackParamList[Name]];

export function navigate<Name extends keyof RootStackParamList>(
  ...args: NavArgs<Name>
) {
  if (navigationRef.isReady()) {
    // TS знает сигнатуру navigate с кортежем; any — чтобы не спорить про вариадик.
    navigationRef.navigate(...(args as any));
  }
}

// Удобные ресеты
export function resetToMain() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    })
  );
}

export function resetToLogin() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
}

// Если нужно явно открыть вложенный экран Home внутри MainStack
export function resetToMainHome() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Main', state: { index: 0, routes: [{ name: 'Home' }] } }],
    })
  );
}
