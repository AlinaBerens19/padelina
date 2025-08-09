// src/services/firebase/db.ts
import { collection, doc, getFirestore } from '@react-native-firebase/firestore';
export const db = getFirestore();

export const usersRef = (uid: string) => doc(db, 'users', uid);
export const matchesCol = collection(db, 'matches');
export const matchesRef = (id: string) => doc(db, 'matches', id);