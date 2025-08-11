import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {
  collection,
  onSnapshot,
  query /* , where, orderBy */
} from '@react-native-firebase/firestore';

import { db } from '../../services/firebase/db';
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

  const fmtTime = (t?: FirebaseFirestoreTypes.Timestamp | null) =>
    t ? t.toDate().toLocaleString() : '';


  const renderItem = ({ item }: { item: Match }) => {
    const playersLen = item.players?.length ?? 0;
    const capacity = item.maxPlayers ?? 4;
    const isFull = playersLen >= capacity;

    return (
      <View style={styles.card}>
        {/* Превью изображения (или плейсхолдер) */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbPlaceholderText}>No image</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.price}>₪{item.price}</Text>
          <Text>{item.location}</Text>
          <Text>Level {item.level}</Text>
          <Text>{item.sport}</Text>
          {!!item.time && <Text>{fmtTime(item.time)}</Text>}
          {!!item.phone && <Text>☎ {item.phone}</Text>}
          <Text>
            {playersLen}/{capacity} players
          </Text>

        </View>

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


