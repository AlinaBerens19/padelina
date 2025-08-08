// src/hooks/useAuth.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { auth } from '../services/firebase/init';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore(s => s.firebaseUser);
  const setUser = useAuthStore(s => s.setFirebaseUser);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Подписываемся на изменения статуса аутентификации
    const unsubscribe = onAuthStateChanged(
      auth,
      (u: FirebaseAuthTypes.User | null) => {
        setUser(u);
        if (initializing) setInitializing(false);
      }
    );
    return unsubscribe;
  }, [initializing, setUser]);

  return { user, isAuthenticated, initializing };
};
