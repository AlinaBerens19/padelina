// path: src/screens/Welcome/components/MatchCard.tsx

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { usePlayerStore } from 'store/playerStore';
import { Match } from 'types/firebase';

// ✅ Дефолтная реализация добавления игрока через Firestore
import auth from '@react-native-firebase/auth';
import { arrayUnion, doc, updateDoc } from '@react-native-firebase/firestore';
import { db } from 'services/firebase/init';

import { styles } from '../WelcomeScreen.styles';

interface Props {
  item: Match;
  onWaze: (location: string) => void;
  onWhatsApp: (phone?: string) => void;
  onCall: (phone?: string) => void;

  // опционально: внешний хендлер добавления (если хотите переопределить поведение)
  onAddPlayer?: (matchId: string) => Promise<void> | void;
}

const AVATAR_SIZE = 58;
const AVATAR_RADIUS = 36;

const MatchCard: React.FC<Props> = ({ item, onWaze, onWhatsApp, onCall, onAddPlayer }) => {
  // ⛑️ Безопасно приводим список игроков
  const players: string[] = useMemo(
    () => (Array.isArray(item.players) ? item.players : []),
    [item.players]
  );

  // 🎯 Вместимость: 2 (singles) или 4 (doubles) — либо берём maxPlayers
  const capacity = item.maxPlayers ?? (item.singles ? 2 : 4);
  const isFull = (item.playersCount ?? players.length) >= capacity;

  // 📒 Берём профили игроков из стора (для аватаров/инициалов)
  const playerStore = usePlayerStore();
  const profiles = useMemo(
    () => players.map((uid) => playerStore.players[uid] || { id: uid }),
    [players, playerStore.players]
  );

  // Инфо-строки карточки
  const lines = [
    `₪${Number.isFinite(Number(item.price)) ? Number(item.price) : 0}`,
    String(item.location ?? '—'),
    `Level ${Number(item.level ?? 0)}`,
    item.sport,
  ];

  // 🧩 Инициалы, если нет аватара
  const initials = (name?: string | null) =>
    (name ?? '')
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // ➕ Присоединение текущего пользователя к матчу
  const addSelfToMatch = useCallback(async () => {
    try {
      if (isFull) return;

      // если передан внешний обработчик — отдаём ему управление
      if (onAddPlayer) {
        await onAddPlayer(item.id!);
        return;
      }

      const user = auth().currentUser;
      if (!user?.uid) {
        Alert.alert('Авторизация', 'Пожалуйста, войдите, чтобы присоединиться к матчу.');
        return;
      }

      const matchRef = doc(db, 'matches', String(item.id));
      await updateDoc(matchRef, {
        // arrayUnion исключит дубли
        players: arrayUnion(user.uid),
        playersCount:
          (item.playersCount ?? players.length) + (players.includes(user.uid) ? 0 : 1),
        updatedAt: Date.now(),
      });

      Alert.alert('Успех', 'Вы присоединились к матчу!');
      // ⚠️ Удалять из списка ничего не нужно — WelcomeScreen отфильтрует заполнённые
    } catch (e: any) {
      console.warn('addSelfToMatch error:', e);
      Alert.alert('Ошибка', e?.message ?? 'Не удалось присоединиться.');
    }
  }, [isFull, onAddPlayer, item.id, item.playersCount, players]);

  // есть ли свободный слот (для показа кнопки "+")
  const hasFreeSlot = profiles.length < capacity;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
      {/* Верхняя часть карточки: превью, локация, цена и т.п. */}
      <View style={styles.topRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={{ width: 108, height: 88, borderRadius: 12 }} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>No image</Text>
          </View>
        )}

        <View style={styles.infoCol}>
          <Text style={styles.primaryLine}>{lines[0]}</Text>
          <Text style={styles.line} numberOfLines={1}>{lines[1]}</Text>
          <Text style={styles.line}>{lines[2]}</Text>
          <Text style={styles.line}>{lines[3]}</Text>

          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => onWaze(String(item.location))}>
              <MaterialCommunityIcons name="waze" size={22} color="#325df6" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} disabled={!item.phone} onPress={() => onWhatsApp(item.phone)}>
              <MaterialCommunityIcons name="whatsapp" size={22} color={item.phone ? '#25D366' : '#BDBDBD'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} disabled={!item.phone} onPress={() => onCall(item.phone)}>
              <MaterialCommunityIcons name="phone" size={22} color={item.phone ? '#4CAF50' : '#BDBDBD'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Ряд аватаров — без скролла, ровно capacity слотов */}
      <View style={[styles.avatarsRow, { flexDirection: 'row' }]}>
        {Array.from({ length: capacity }).map((_, idx) => {
          const p = profiles[idx];

          // слот занят — рисуем аватар/инициалы
          if (p) {
            return (
              <Animated.View
                entering={FadeInUp.delay(idx * 80)}
                key={`${p.id}-${idx}`}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_RADIUS,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#EEE',
                  marginRight: 8,
                }}
              >
                {p.avatar ? (
                  <Image
                    source={{ uri: p.avatar }}
                    style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_RADIUS }}
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials(p.name) || '??'}</Text>
                )}
              </Animated.View>
            );
          }

          // первый пустой слот при незаполненном матче — это кнопка "+"
          if (!isFull && idx === profiles.length && hasFreeSlot) {
            return (
              <TouchableOpacity
                key={`plus-${idx}`}
                onPress={addSelfToMatch}
                activeOpacity={0.85}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_RADIUS,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#7CB342',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  backgroundColor: '#F9FBE7',
                }}
              >
                <MaterialCommunityIcons name="plus" size={28} color="#558B2F" />
              </TouchableOpacity>
            );
          }

          // прочие пустые слоты — плейсхолдеры
          return (
            <View
              key={`ph-${idx}`}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_RADIUS,
                backgroundColor: '#F1F1F1',
                marginRight: 8,
              }}
            />
          );
        })}
      </View>

      {/* Join-кнопка дублирует поведение "+" */}
      <TouchableOpacity
        style={[styles.joinButton, isFull && styles.joinButtonDisabled]}
        disabled={isFull}
        onPress={addSelfToMatch}
      >
        <Text style={styles.joinText}>{isFull ? 'Full' : 'Join'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

function areEqual(prev: Props, next: Props) {
  return prev.item.id === next.item.id;
}

export default React.memo(MatchCard, areEqual);
