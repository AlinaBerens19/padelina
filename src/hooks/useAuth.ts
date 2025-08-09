// src/hooks/useAuth.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase/init';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore(s => s.firebaseUser);
  const setUser = useAuthStore(s => s.setFirebaseUser);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (u: FirebaseAuthTypes.User | null) => {
        setUser(u);
        setInitializing(false);
      }
    );
    return unsubscribe;
  }, [setUser]); // или []

  return { user, isAuthenticated, initializing };
};
