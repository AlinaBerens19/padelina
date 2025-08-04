import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Экспортируем готовые инстансы
export { auth };
export const db = firestore;
export { storage };


