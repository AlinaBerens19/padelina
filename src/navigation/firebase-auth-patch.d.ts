declare module "firebase/auth" {
  export function createUserWithEmailAndPassword(
    auth: import("firebase/auth").Auth,
    email: string,
    password: string
  ): Promise<import("firebase/auth").UserCredential>;

  export function signInWithEmailAndPassword(
    auth: import("firebase/auth").Auth,
    email: string,
    password: string
  ): Promise<import("firebase/auth").UserCredential>;

  export function initializeAuth(
    app: import("firebase/app").FirebaseApp,
    dependencies?: {
      persistence?: import("firebase/auth").Persistence | import("firebase/auth").Persistence[];
    }
  ): import("firebase/auth").Auth;

  export function getReactNativePersistence(
    storage: typeof import("@react-native-async-storage/async-storage")
  ): import("firebase/auth").Persistence;
}

declare module "firebase/firestore" {
  export function doc(
    db: import("firebase/firestore").Firestore,
    collectionPath: string,
    documentId: string
  ): import("firebase/firestore").DocumentReference;

  export function setDoc(
    docRef: import("firebase/firestore").DocumentReference,
    data: Record<string, any>
  ): Promise<void>;

  export function getFirestore(
    app: import("firebase/app").FirebaseApp
  ): import("firebase/firestore").Firestore;
}
