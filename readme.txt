# Padelina

Mobile app built with **React Native + Expo**, featuring **Firebase** auth and **Zustand** for state management.

> TL;DR: `npm i` → `npm run android|ios` → add `google-services.json` and `GoogleService-Info.plist` — see **Firebase**.

---

## Tech Stack

* Expo SDK **53** (React **19**, React Native **0.79**)
* React Navigation (bottom-tabs, native-stack)
* React Native Firebase v**22**: App, Auth, Firestore, Storage (modular API)
* Zustand (+persist in AsyncStorage)
* Reanimated 3, Gesture Handler, Screens, Safe Area Context
* Expo Image Picker

## Requirements

* Node.js **≥ 18** (recommend 20 LTS)
* npm or yarn/pnpm
* Android Studio (SDK/emulator) and/or Xcode (macOS only)
* JDK **17** for Android builds

## Setup & Run

```bash
# 1) Install deps
npm i

# 2) Start Metro / web
npm run start     # Expo Dev Tools
npm run web       # web mode

# 3) Run natively (creates/updates a dev client)
npm run android
npm run ios
```

### Scripts

* `start` — Expo dev server
* `android` — `expo run:android`
* `ios` — `expo run:ios`
* `web` — `expo start --web`

## Firebase

The app uses **native Firebase config** (RNFirebase):

1. Add config files:

   * **Android**: `android/app/google-services.json`
   * **iOS**: `ios/<ProjectName>/GoogleService-Info.plist`
2. Make sure IDs match your Firebase project:

   * `app.json` → `android.package` and `ios.bundleIdentifier`
3. Uses the **modular API** (like Firebase Web v9):

   * Auth state subscription: `onAuthStateChanged(auth, cb)`
   * Avoid `auth().onAuthStateChanged` and `app()` — deprecated

### Where initialization lives

Helper example:

```
src/services/firebase/init.ts
```

## Project Structure (key files)

```
src/
  components/SpinnerOverlay.tsx
  hooks/useAuth.ts
  navigation/AppNavigator.tsx
  services/firebase/init.ts
  store/authStore.ts
```

## Environment Variables

`dotenv` is included. For values exposed to JS, use the `EXPO_PUBLIC_` prefix (they are bundled at build time):

```
# .env
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

> RNFirebase reads Firebase config from native files, not from `.env`.

## Builds

* **Dev**: `npm run android|ios` — creates/updates a dev client on device/emulator
* **Release**: recommended via EAS Build (see Expo/EAS docs). Ensure correct bundle IDs and signing.

## Tips & Debugging

* Clear Metro cache: `npx expo start --clear` or `npx react-native start --reset-cache`
* Android Gradle clean: `cd android && ./gradlew clean`
* RNFirebase deprecations are fixed by switching to modular calls (`getApp`, `getAuth`, `onAuthStateChanged`)

## Security

* Don’t commit `google-services.json`/`GoogleService-Info.plist` to public repos
* Keep secrets in CI/config rather than plain `.env` (use `EXPO_PUBLIC_` only for non-secrets)

## License

Add a license section if needed (e.g., MIT) — or mark as Proprietary.

---

### Quick Checklist

* [ ] Dependencies installed
* [ ] Firebase files added (Android/iOS)
* [ ] `android.package` and `ios.bundleIdentifier` verified
* [ ] Modular Firebase imports (`getApp`, `getAuth`, `onAuthStateChanged`)
* [ ] First run: `npm run android|ios`
