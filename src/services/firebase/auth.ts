// src/services/firebase/auth.ts
import { getApp } from '@react-native-firebase/app';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  FirebaseAuthTypes,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  PhoneAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
  verifyPhoneNumber,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export type { FirebaseAuthTypes } from '@react-native-firebase/auth';

const auth = getAuth(getApp());

/* ============================================
 * Email / Password
 * ============================================ */

export const register = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logout = () => signOut(auth);

export const subscribeAuth = (cb: (u: FirebaseAuthTypes.User | null) => void) =>
  onAuthStateChanged(auth, cb);

export const getCurrentUser = () => auth.currentUser;

export const getProviderIds = (): string[] =>
  auth.currentUser?.providerData?.map(p => p.providerId) ?? [];

/* ============================================
 * Google Sign-In
 * ============================================ */

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

export async function signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }).catch(() => {});
  const res = await GoogleSignin.signIn();
  const idToken = (res as any)?.data?.idToken ?? (res as any)?.idToken;
  if (!idToken) throw new Error('Google Sign-In: отсутствует idToken');
  const cred = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, cred);
}

export async function linkGoogleToCurrentUser(): Promise<FirebaseAuthTypes.UserCredential> {
  const user = auth.currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true }).catch(() => {});
  const res = await GoogleSignin.signIn();
  const idToken = (res as any)?.data?.idToken ?? (res as any)?.idToken;
  if (!idToken) throw new Error('Google Sign-In: отсутствует idToken');
  const cred = GoogleAuthProvider.credential(idToken);
  return linkWithCredential(user, cred);
}

export async function googleSignOutIfNeeded() {
  const current = GoogleSignin.getCurrentUser();
  if (current) {
    await GoogleSignin.signOut().catch(() => {});
  }
}

/* ============================================
 * Phone Auth — обычный вход (sign in)
 * ============================================ */

export const startPhoneSignIn = (phoneE164: string) =>
  signInWithPhoneNumber(auth, phoneE164);

export const confirmPhoneCode = (confirmation: FirebaseAuthTypes.ConfirmationResult, code: string) =>
  confirmation.confirm(code);

/* ============================================
 * Phone Auth — привязка телефона
 * ============================================ */

export const startLinkPhone = (phoneE164: string): Promise<{ verificationId: string }> =>
  new Promise((resolve, reject) => {
    const listener = verifyPhoneNumber(auth, phoneE164, 60);

    listener.on(
      'state_changed',
      (snap: FirebaseAuthTypes.PhoneAuthSnapshot) => {
        switch (snap.state) {
          case PhoneAuthProvider.CODE_SENT:
          case PhoneAuthProvider.AUTO_VERIFIED: {
            const verificationId = snap.verificationId;
            if (verificationId) resolve({ verificationId });
            else reject(new Error('Missing verificationId'));
            break;
          }
          case PhoneAuthProvider.ERROR: {
            reject(snap.error ?? new Error('Phone auth error'));
            break;
          }
          default:
            break;
        }
      },
      (err: FirebaseAuthTypes.PhoneAuthError) => reject(err)
    );
  });

export const confirmLinkPhone = async (verificationId: string, code: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  const credential = PhoneAuthProvider.credential(verificationId, code);
  return linkWithCredential(user, credential);
};

/* ============================================
 * Link Email+Password
 * ============================================ */

export const linkEmailPassword = async (email: string, password: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  const credential = EmailAuthProvider.credential(email, password);
  return linkWithCredential(user, credential);
};
