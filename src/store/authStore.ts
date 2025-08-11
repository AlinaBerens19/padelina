import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

type UserSnapshot = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

interface AuthState {
  // runtime-only объект из Firebase (не персистится)
  firebaseUser: FirebaseAuthTypes.User | null;

  // лёгкий снимок для UI (персистится)
  userSnapshot: UserSnapshot | null;

  isAuthenticated: boolean;

  // устанавливем пользователя и синхронизируем snapshot/флаг
  setFirebaseUser: (user: FirebaseAuthTypes.User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        firebaseUser: null,
        userSnapshot: null,
        isAuthenticated: false,
        setFirebaseUser: (user) =>
          set({
            firebaseUser: user,
            userSnapshot: user
              ? {
                  uid: user.uid,
                  email: user.email ?? null,
                  displayName: user.displayName ?? null,
                }
              : null,
            isAuthenticated: !!user,
          }),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        version: 2,
        // сохраняем ТОЛЬКО сериализуемые куски
        partialize: (s) => ({
          isAuthenticated: s.isAuthenticated,
          userSnapshot: s.userSnapshot,
        }),
        // миграция: удаляем ранее сохранённый "firebaseUser"
        migrate: (persisted, version) => {
          if (!persisted) return persisted as any;
          if (version < 2) {
            const { firebaseUser: _drop, ...rest } = persisted as any;
            return { ...rest };
          }
          return persisted as any;
        },
      }
    )
  )
);
