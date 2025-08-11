// src/services/photoUpload.ts
// Механизм выбора картинки из галереи и загрузки в Firebase Storage

import storage from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type UploadResult = {
  downloadURL: string;
  storagePath: string;
};

export async function pickSingleImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  // В SDK 52+ / 53 используем массив mediaTypes вместо MediaTypeOptions
  // https://docs.expo.dev/versions/latest/sdk/imagepicker/
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],          // <-- только изображения (без deprecated MediaTypeOptions)
    allowsEditing: true,             // опционально: крутим кроппер
    aspect: [1, 1],                  // квадрат под аватар
    quality: 0.9,
    allowsMultipleSelection: false,
  });

  if (result.canceled) return null;
  return result.assets?.[0] ?? null;
}

export async function uploadToUserAvatars(
  uid: string,
  localUri: string,
  onProgress?: (progress01: number) => void
): Promise<UploadResult> {
  // аккуратно определяем расширение
  const guessedExt = (() => {
    const fromName = localUri.split('?')[0].split('#')[0];
    const part = fromName.split('.').pop()?.toLowerCase();
    if (!part || part.length > 5) return 'jpg';
    return part;
  })();

  const fileName = `avatar_${Date.now()}.${guessedExt}`;
  const storagePath = `users/${uid}/${fileName}`;
  const ref = storage().ref(storagePath);

  // На iOS иногда лучше убрать префикс file://
  const pathForPut =
    Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri;

  const contentType =
    guessedExt === 'png'
      ? 'image/png'
      : guessedExt === 'webp'
      ? 'image/webp'
      : 'image/jpeg';

  // putFile принимает локальный путь (uri) и умеет слать прогресс
  // https://rnfirebase.io/storage/usage
  const task = ref.putFile(pathForPut, { contentType });

  return await new Promise<UploadResult>((resolve, reject) => {
    task.on(
      'state_changed',
      snapshot => {
        if (onProgress && snapshot.totalBytes) {
          onProgress(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      reject,
      async () => {
        try {
          const downloadURL = await ref.getDownloadURL();
          resolve({ downloadURL, storagePath });
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/**
 * Удобный фасад: выбрать 1 изображение и тут же загрузить его в /users/{uid}/
 * Вернет null, если пользователь отменил выбор.
 */
export async function pickAndUploadUserAvatar(
  uid: string,
  onProgress?: (progress01: number) => void
): Promise<UploadResult | null> {
  const asset = await pickSingleImage();
  if (!asset) return null; // отмена
  return await uploadToUserAvatars(uid, asset.uri, onProgress);
}

export async function deleteFromStorage(storagePath: string) {
  await storage().ref(storagePath).delete();
}
