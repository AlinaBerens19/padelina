// path: src/services/firebase/matches.ts
// файл-утилита для создания матча в Firestore

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Тип входных данных из модалки
export type CreateMatchInput = {
  location: string;            // место (обяз.)
  sport: 'Tennis' | 'Padel' | 'Pickleball';
  price: number;               // цена (обяз.)
  time?: Date | null;          // Дата/время (конвертируем в Timestamp)
  duration: number;            // длительность мин
  booked: boolean;             // корты забронированы?
  // ниже — опциональные поля; если не придут — не пишем
  maxPlayers?: number;
  imageUrl?: string | null;
  singles?: boolean;
  level?: number | null;
  address?: string | null;
  phone?: string | null;       // у тебя убрано из UI — оставим null
};

// Создание документа в коллекции 'matches'
export async function createMatch(input: CreateMatchInput) {
  // текущий пользователь
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Не найден auth().currentUser');

  // Подготовим запись по твоей схеме
  const payload: any = {
    // базовые поля
    location: input.location,
    price: input.price,
    duration: input.duration,
    booked: input.booked,
    // игроки/счётчики
    players: [uid],                 // первый игрок — автор
    playersCount: 1,
    maxPlayers: input.maxPlayers ?? (input.singles ? 2 : 4),
    singles: input.singles ?? (input.maxPlayers === 2),
    // визуальные/доп. поля
    imageUrl: input.imageUrl ?? null,
    level: input.level ?? null,
    address: input.address ?? null,
    phone: input.phone ?? null,     // сейчас null, т.к. поля нет в UI
    // служебные
    sport: input.sport,
    time: firestore.Timestamp.fromDate(input.time ?? new Date()),  // конвертация
    createdAt: firestore.FieldValue.serverTimestamp(),
    createdBy: uid,
  };

  // Пишем в коллекцию
  const ref = await firestore().collection('matches').add(payload);
  return ref.id;
}
