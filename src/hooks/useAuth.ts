// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase/init';
import { useAuthStore } from '../store/authStore';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const useAuth = () => {
  const user = useAuthStore(s => s.firebaseUser);
  const setUser = useAuthStore(s => s.setFirebaseUser);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (u: FirebaseAuthTypes.User | null) => {
        setUser(u);
        if (initializing) setInitializing(false);
      }
    );
    return unsubscribe;
  }, [initializing, setUser]);

  return { user, isAuthenticated, initializing };
};
