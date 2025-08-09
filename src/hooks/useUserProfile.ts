// src/hooks/useUserProfile.ts
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../services/firebase/db'; // поправь путь под свой alias при необходимости

export type Profile = {
  uid: string;
  name?: string;
  email?: string;
  location?: string;
  favouriteSport?: string;
  level?: number;
  avatarUrl?: string;
  address?: string;
  phone?: string;
  updatedAt?: FirebaseFirestoreTypes.Timestamp | Date | null;
};

export function useUserProfile(uid?: string) {
  const [data, setData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const ref = doc(db, 'users', uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        setData(snap.exists() ? ({ uid: snap.id, ...(snap.data() as Profile) }) : null);
        setLoading(false);
      },
      err => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      if (!uid) return Promise.reject(new Error('No uid'));
      const ref = doc(db, 'users', uid);
      return setDoc(
        ref,
        { ...patch, updatedAt: serverTimestamp() },
        { merge: true }
      );
    },
    [uid]
  );

  return { data, loading, error, update };
}
