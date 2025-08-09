import authRN from '@react-native-firebase/auth';
import firestoreRN from '@react-native-firebase/firestore';
import storageRN from '@react-native-firebase/storage';

export const auth = authRN();        // инстанс
export const db = firestoreRN();     // инстанс
export const storage = storageRN();  // инстанс

export const firebaseApp = auth.app; // если где-то нужен сам App