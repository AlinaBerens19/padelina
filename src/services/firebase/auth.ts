// src/services/firebase/auth.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import { auth } from './init';

/**
 * Регистрирует пользователя по email/password
 * @returns Promise с результатом регистрации
 */
export function register(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Логинит пользователя по email/password
 * @returns Promise с результатом логина
 */
export function login(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}
