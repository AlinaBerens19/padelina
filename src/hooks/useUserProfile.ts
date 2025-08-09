// hooks/useUserProfile.ts
import firestore from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

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
  updatedAt?: any;
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
    const ref = firestore().collection('users').doc(uid);

    const unsub = ref.onSnapshot(
      snap => {
        setData(snap.exists ? ({ uid: snap.id, ...(snap.data() as Profile) }) : null);
        setLoading(false);
      },
      err => {
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  const update = useCallback(
    (patch: Partial<Profile>) => {
      if (!uid) return Promise.reject(new Error('No uid'));
      return firestore()
        .collection('users')
        .doc(uid)
        .set(
          { ...patch, updatedAt: firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );
    },
    [uid]
  );

  return { data, loading, error, update };
}
