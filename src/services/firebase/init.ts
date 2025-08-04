// src/services/firebase/init.ts

// Нативная инициализация RNFirebase (App Registry под капотом)
import '@react-native-firebase/app';

// Экспортируем «инстансы» модулей
import auth from '@react-native-firebase/auth';
import { default as db, default as firestore } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';


export { auth, db, firestore, storage };

