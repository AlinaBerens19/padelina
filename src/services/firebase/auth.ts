// src/services/firebase/auth.ts
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';

const auth = getAuth();

export function register(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function login(email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// опционально: удобная обёртка для подписки
export function subscribeAuth(cb: (u: FirebaseAuthTypes.User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth.currentUser;
}