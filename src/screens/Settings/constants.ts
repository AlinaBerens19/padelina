// path: src/screens/SettingsScreen/constants.ts
export const SPORTS = ['Tennis', 'Padel', 'Pickleball'] as const;
export const LEVELS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'] as const;

export type Coords = { lat: number; lng: number };

export function isValidHttpUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
