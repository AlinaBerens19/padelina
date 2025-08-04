import { create } from 'zustand';

export type AppUser = {
  uid: string;
  name: string;
  avatarUrl?: string;
  rating?: number;
  phone?: string;
  address?: string;
  email?: string;
  level?: number;
  favouriteSport?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // любые будущие поля
};

type UserState = {
  profile: AppUser | null;
  setProfile: (profile: AppUser | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
