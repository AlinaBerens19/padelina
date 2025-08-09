// src/services/firebase/auth.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from './init';

export function register(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return auth.createUserWithEmailAndPassword(email, password);
}

export function login(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return auth.signInWithEmailAndPassword(email, password);
}

export function logout() {
  return auth.signOut();
}
