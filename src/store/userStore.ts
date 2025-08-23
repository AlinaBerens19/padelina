import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppUser } from 'types/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


type UserState = {
  profile: AppUser | null;
  setProfile: (profile: AppUser | null) => void;
};

// Адаптер AsyncStorage под интерфейс zustand
const storage = {
  getItem: async (name: string) => {
    const value = await AsyncStorage.getItem(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name: string, value: any) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'user-profile-cache',
      storage,
    }
  )
);
// Теперь профиль пользователя будет сохраняться в AsyncStorage и восстанавливаться при перезапуске приложения