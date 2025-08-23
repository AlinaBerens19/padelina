import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// src/types/firebase.ts
export type FirebaseUserLite = {
  uid: string;
  email?: string;
};

// src/types/PlayerProfile.ts
export type PlayerProfile = {
  id: string;
  name?: string | null;
  avatar?: string | null;
};

// src/types/Match.ts
export type Match = {
id: string;
location: string;
level: number;
sport: 'Tennis' | 'Padel' | 'Pickleball';
price: number;
time?: FirebaseFirestoreTypes.Timestamp | null;
phone?: string;
players?: string[];
maxPlayers?: number;
playersCount?: number;
imageUrl?: string | null;
singles?: boolean;
playerProfiles?: PlayerProfile[];
};

// src/types/AppUser.ts
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
};


