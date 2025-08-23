// src/store/playerStore.ts

import { PlayerProfile } from 'types/firebase';
import { create } from 'zustand';


type PlayerStoreState = {
  players: Record<string, PlayerProfile>;
  addPlayers: (newPlayers: Record<string, PlayerProfile>) => void;
  getById: (uid: string) => PlayerProfile | undefined;
};

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  players: {},
  addPlayers: (newPlayers) =>
    set((state) => ({
      players: { ...state.players, ...newPlayers },
    })),
  getById: (uid) => get().players[uid],
}));
