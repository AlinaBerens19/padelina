// src/store/authStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface AuthState {
  firebaseUser: FirebaseAuthTypes.User | null;
  isAuthenticated: boolean;
  setFirebaseUser: (user: FirebaseAuthTypes.User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        firebaseUser: null,
        isAuthenticated: false,
        setFirebaseUser: (user) =>
          set({
            firebaseUser: user,
            isAuthenticated: !!user,
          }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (s) => ({
          isAuthenticated: s.isAuthenticated,
          firebaseUser: s.firebaseUser
            ? {
                uid: s.firebaseUser.uid,
                email: s.firebaseUser.email,
                displayName: s.firebaseUser.displayName,
              }
            : null,
        }),
      }
    )
  )
);
