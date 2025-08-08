// src/services/firebase/init.ts
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

// Берём дефолтный App (создаётся автоматически по google-services.json / GoogleService-Info.plist)
const app = getApp();

// Экспортируем готовые экземпляры модулей
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; // Экспортируем сам App, если нужно