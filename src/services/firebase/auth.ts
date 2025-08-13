// src/services/firebase/auth.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export type { FirebaseAuthTypes } from '@react-native-firebase/auth';

/* ============================================
 * Email / Password
 * ============================================ */

export const register = (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> =>
  auth().createUserWithEmailAndPassword(email, password);

export const login = (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> =>
  auth().signInWithEmailAndPassword(email, password);

export const resetPassword = (email: string) =>
  auth().sendPasswordResetEmail(email);

export const logout = () => auth().signOut();

export const subscribeAuth = (
  cb: (u: FirebaseAuthTypes.User | null) => void
) => auth().onAuthStateChanged(cb);

export const getCurrentUser = () => auth().currentUser;

export const getProviderIds = (): string[] =>
  auth().currentUser?.providerData?.map(p => p.providerId) ?? [];

/* ============================================
 * Google Sign-In (новый API google-signin)
 * ============================================ */

/** Вызови один раз при старте приложения (например, в App.tsx useEffect) */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // Web client ID из Firebase (OAuth 2.0 client_type: 3).
    // Удобно хранить в .env: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

/** Вход через Google -> Firebase */
export async function signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    } catch {}
    const res = await GoogleSignin.signIn();
    // v13+ возвращает { data: { idToken } }, старые — { idToken }.
    const idToken = (res as any)?.data?.idToken ?? (res as any)?.idToken;
    if (!idToken) throw new Error('Google Sign-In: отсутствует idToken (проверь webClientId)');
    const cred = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(cred);
  } catch (e) {
    throw e;
  }
}

/** Привязать Google к уже залогиненному пользователю */
export async function linkGoogleToCurrentUser(): Promise<FirebaseAuthTypes.UserCredential> {
  const user = auth().currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  try {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    } catch {}
    const res = await GoogleSignin.signIn();
    const idToken = (res as any)?.data?.idToken ?? (res as any)?.idToken;
    if (!idToken) throw new Error('Google Sign-In: отсутствует idToken');
    const cred = auth.GoogleAuthProvider.credential(idToken);
    return user.linkWithCredential(cred);
  } catch (e) {
    throw e;
  }
}

/** (Опционально) Выход из Google в native SDK (не из Firebase Auth) */
export async function googleSignOutIfNeeded() {
  const current = GoogleSignin.getCurrentUser(); // новый API вместо isSignedIn()
  if (current) {
    try {
      await GoogleSignin.signOut();
    } catch {}
  }
}

/* ============================================
 * Phone Auth — обычный вход (sign in)
 * ============================================ */

export const startPhoneSignIn = (
  phoneE164: string
): Promise<FirebaseAuthTypes.ConfirmationResult> =>
  auth().signInWithPhoneNumber(phoneE164);

export const confirmPhoneCode = (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  code: string
): Promise<FirebaseAuthTypes.UserCredential> => confirmation.confirm(code);

/* ============================================
 * Phone Auth — привязка телефона к существующему аккаунту (link)
 * ============================================ */

export const startLinkPhone = (
  phoneE164: string
): Promise<{ verificationId: string }> =>
  new Promise((resolve, reject) => {
    const listener: FirebaseAuthTypes.PhoneAuthListener =
      auth().verifyPhoneNumber(phoneE164);

    // .on(...) возвращает снова PhoneAuthListener (чейнится), не функцию.
    listener.on(
      'state_changed',
      (snap: FirebaseAuthTypes.PhoneAuthSnapshot) => {
        switch (snap.state) {
          case auth.PhoneAuthState.CODE_SENT:
          case auth.PhoneAuthState.AUTO_VERIFIED: {
            const verificationId = snap.verificationId;
            if (verificationId) resolve({ verificationId });
            else reject(new Error('Missing verificationId'));
            break;
          }
          case auth.PhoneAuthState.ERROR: {
            reject(snap.error ?? new Error('Phone auth error'));
            break;
          }
          default:
            // DEFAULT / AUTO_VERIFY_TIMEOUT — не завершаем промис
            break;
        }
      },
      (err: FirebaseAuthTypes.PhoneAuthError) => reject(err)
    );
  });

export const confirmLinkPhone = async (
  verificationId: string,
  code: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  const user = auth().currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  const credential = auth.PhoneAuthProvider.credential(verificationId, code);
  return user.linkWithCredential(credential);
};

/* ============================================
 * Link Email+Password к аккаунту, созданному по телефону
 * ============================================ */
export const linkEmailPassword = async (
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> => {
  const user = auth().currentUser;
  if (!user) throw new Error('Нет авторизованного пользователя');
  const credential = auth.EmailAuthProvider.credential(email, password);
  return user.linkWithCredential(credential);
};
