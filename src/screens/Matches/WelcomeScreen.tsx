import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {
  collection,
  onSnapshot,
  query /* , where, orderBy */
} from '@react-native-firebase/firestore';

import { db } from '../../services/firebase/init'; // ✅ централизованная инициализация

import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './WelcomeScreen.styles';

// Базовый тип + новые (опциональные) поля
export type Match = {
  id: string;
  location: string;
  level: number;
  sport: 'Tennis' | 'Padel' | 'Pickleball';
  price: number;

  // новые (могут отсутствовать в документе)
  time?: FirebaseFirestoreTypes.Timestamp | null;
  phone?: string;
  players?: string[];
  maxPlayers?: number;
  playersCount?: number;
  imageUrl?: string | null;
  singles?: boolean;
};

export default function WelcomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');

    // пример для фильтра/сортировки:
    // const q = query(collection(db, 'matches'), where('sport', '==', 'Padel'), orderBy('price', 'asc'));
    const q = query(collection(db, 'matches'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Match[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as Record<string, any>;
          const players = Array.isArray(d.players) ? d.players : [];
          const maxPlayers = Number.isFinite(Number(d.maxPlayers))
            ? Number(d.maxPlayers)
            : d?.singles
              ? 2
              : 4;

          return {
            id: docSnap.id,
            location: String(d.location ?? d.address ?? '—'),
            level: Number.isFinite(Number(d.level)) ? Number(d.level) : 0,
            sport: (['Tennis', 'Padel', 'Pickleball'].includes(d.sport)
              ? d.sport
              : 'Padel') as Match['sport'],
            price: Number.isFinite(Number(d.price)) ? Number(d.price) : 0,

            // новые поля, если есть
            time: d.time ?? null,
            phone: d.phone ? String(d.phone) : undefined,
            players,
            maxPlayers,
            playersCount: Number.isFinite(Number(d.playersCount))
              ? Number(d.playersCount)
              : players.length,
            imageUrl:
              typeof d.imageUrl === 'string' && d.imageUrl.length > 0
                ? d.imageUrl
                : null,
            singles: !!d.singles,
          };
        });
        setMatches(list);
        spinner.hide();
      },
      (e) => {
        console.error('Failed to fetch matches:', e);
        spinner.hide();
      }
    );

    return () => {
      spinner.hide();
      unsub();
    };
  }, []);

  // helpers
  const openWaze = async (query: string) => {
    if (!query) return;
    const ios = `waze://?q=${encodeURIComponent(query)}&navigate=yes`;
    const android = `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
    const url = Platform.OS === 'ios' ? ios : android;
    const ok = await Linking.canOpenURL(url);
    Linking.openURL(ok ? url : android);
  };

  const openWhatsApp = async (phone?: string) => {
    if (!phone) return;
    const clean = phone.replace(/[^\d+]/g, '');
    const app = `whatsapp://send?phone=${clean}`;
    const web = `https://wa.me/${clean}`;
    const ok = await Linking.canOpenURL(app);
    Linking.openURL(ok ? app : web);
  };

  const callPhone = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const renderItem = ({ item }: { item: Match }) => {
    const playersLen = item.players?.length ?? 0;
    const capacity = item.maxPlayers ?? 4;
    const isFull = playersLen >= capacity;

    // Первые 4 строки справа от изображения
    const lines = [
      `₪${item.price}`,
      item.location,
      `Level ${item.level}`,
      item.sport,
    ];

    return (
      <View style={styles.card}>
        {/* Верхняя зона: слева изображение, справа 4 строки (выровнены вправо) */}
        <View style={styles.topRow}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumb}
              resizeMode="cover"
            />
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

            {/* Иконки вместо явных телефона/счетчика */}
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => openWaze(item.location)}
                accessibilityLabel="Open in Waze"
              >
                <MaterialCommunityIcons name="waze" size={22} color="#325df6" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                disabled={!item.phone}
                onPress={() => openWhatsApp(item.phone)}
                accessibilityLabel="Open WhatsApp"
              >
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={22}
                  color={item.phone ? '#25D366' : '#BDBDBD'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                disabled={!item.phone}
                onPress={() => callPhone(item.phone)}
                accessibilityLabel="Call phone"
              >
                <MaterialCommunityIcons
                  name="phone"
                  size={22}
                  color={item.phone ? '#4CAF50' : '#BDBDBD'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Нижняя зона: аватары игроков (до 4 штук), слева внизу */}
        <View style={styles.avatarsRow}>
          {(item.players ?? []).slice(0, 4).map((p, idx) => (
            <View
              key={`${p}-${idx}`}
              style={[styles.avatar, { zIndex: 10 - idx, left: idx * 40 }]}
            >
              <Text style={styles.avatarText}>
                {initials(typeof p === 'string' ? p : String(p))}
              </Text>
            </View>
          ))}
          {/* Плейсхолдеры, если игроков меньше 4 */}
          {Array.from({ length: Math.max(0, 4 - (item.players?.length ?? 0)) }).map((_, idx) => {
            const offset = ((item.players?.length ?? 0) + idx) * 40;
            return (
              <View
                key={`ph-${idx}`}
                style={[styles.avatar, styles.avatarPlaceholder, { left: offset }]}
              />
            );
          })}
        </View>

        {/* Кнопка Join — справа снизу */}
        <TouchableOpacity
          style={[styles.joinButton, isFull && styles.joinButtonDisabled]}
          disabled={isFull}
          onPress={() => {
            if (isFull) return;
            Alert.alert('Join', 'Coming soon 🙂');
          }}
        >
          <Text style={styles.joinText}>{isFull ? 'Full' : 'Join'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>Matches Near You</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />
    </SafeAreaView>
  );
}
