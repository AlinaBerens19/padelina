// src/hooks/useAuth.ts
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { onAuthStateChanged } from '@react-native-firebase/auth'; // ⬅️ добавили модульную функцию
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase/init';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore(s => s.firebaseUser);
  const setUser = useAuthStore(s => s.setFirebaseUser);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // ⬅️ вместо auth.onAuthStateChanged(...) вызываем модульную форму
    const unsubscribe = onAuthStateChanged(
      auth,
      (u: FirebaseAuthTypes.User | null) => {
        setUser(u);
        setInitializing(false);
      }
    );

    return unsubscribe;
  }, [setUser]);

  return { user, isAuthenticated, initializing };
};
