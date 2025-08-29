// path: src/screens/Welcome/WelcomeScreen.tsx
// Экран списка: тянем все профили игроков (http / gs:// / путь),
// заполняем playerProfiles у матча, скрываем заполнённые матчи (2/4 слота).

import { MaterialCommunityIcons } from '@expo/vector-icons';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  BounceIn,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Match, PlayerProfile } from 'types/firebase';
import { createMatch } from '../../services/firebase/matches';
import { usePlayerStore } from '../../store/playerStore';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './WelcomeScreen.styles';
import AddMatchModal from './components/AddMatchModal';
import MatchCard from './components/MatchCard';

// нормализация спорта
const getSafeSport = (sport: string): Match['sport'] =>
  ['Tennis', 'Padel', 'Pickleball'].includes(sport as any) ? (sport as Match['sport']) : 'Padel';

export default function WelcomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { players: cachedPlayers, addPlayers } = usePlayerStore();
  const snapshotInitialized = useRef(false);

  // подгружаем недостающие профили игроков (батчами по 10 id)
  const fetchMissingPlayers = useCallback(
    async (ids: string[]): Promise<Record<string, PlayerProfile>> => {
      if (ids.length === 0) return {};
      const usersRef = firestore().collection('users');

      // делим на чанки по 10 для where in
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

      const results: Record<string, PlayerProfile> = {};

      const snaps = await Promise.all(
        chunks.map((chunk) =>
          usersRef.where(firestore.FieldPath.documentId(), 'in', chunk).get()
        )
      );

      for (const snap of snaps) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as any;

          // возможные поля для аватара
          const rawPath: string | null =
            (typeof data?.avatar === 'string' && data.avatar) ||
            (typeof data?.avatarUrl === 'string' && data.avatarUrl) ||
            null;

          let avatar: string | null = null;

          if (rawPath) {
            if (rawPath.startsWith('http')) {
              // уже https
              avatar = rawPath;
            } else if (rawPath.startsWith('gs://')) {
              // gs:// → обязательно refFromURL
              try {
                avatar = await storage().refFromURL(rawPath).getDownloadURL();
              } catch (err) {
                console.warn('⚠️ Failed to load avatar (gs://)', docSnap.id, rawPath, err);
              }
            } else {
              // путь в бакете
              try {
                avatar = await storage().ref(rawPath).getDownloadURL();
              } catch (err) {
                console.warn('⚠️ Failed to load avatar (path)', docSnap.id, rawPath, err);
              }
            }
          }

          results[docSnap.id] = {
            id: docSnap.id,
            name: data?.name ?? data?.fullName ?? null,
            avatar, // уже нормализованный https или null
          };
        }
      }

      if (Object.keys(results).length) addPlayers(results); // кешируем в zustand
      return results;
    },
    [addPlayers]
  );

  // парсим снапшот матчей
  const parseSnapshot = useCallback(
    async (
      snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>
    ) => {
      const matchesList: (Match & { playerProfiles?: PlayerProfile[] })[] = snapshot.docs.map(
        (docSnap) => {
          const d = docSnap.data() as any;
          const playersArr: string[] = Array.isArray(d.players) ? d.players : [];

          const maxPlayers = Number.isFinite(Number(d.maxPlayers))
            ? Number(d.maxPlayers)
            : d.singles
            ? 2
            : 4;

          return {
            id: docSnap.id,
            location: String(d.location ?? d.address ?? '—'),
            level: Number.isFinite(Number(d.level)) ? Number(d.level) : 0,
            sport: getSafeSport(String(d.sport ?? 'Padel')),
            price: Number.isFinite(Number(d.price)) ? Number(d.price) : 0,
            time: d.time ?? null,
            phone: d.phone ? String(d.phone) : undefined,
            players: playersArr,
            maxPlayers,
            playersCount: Number.isFinite(Number(d.playersCount))
              ? Number(d.playersCount)
              : playersArr.length,
            imageUrl: typeof d.imageUrl === 'string' && d.imageUrl.length > 0 ? d.imageUrl : null,
            singles: !!d.singles,
          } as Match;
        }
      );

      // собираем все id игроков для догрузки
      const allIds = new Set<string>();
      matchesList.forEach((m) => m.players?.forEach((uid: string) => allIds.add(uid)));
      const missing = Array.from(allIds).filter((id) => !cachedPlayers[id]);

      let newlyFetched: Record<string, PlayerProfile> = {};
      if (missing.length > 0) {
        try {
          newlyFetched = await fetchMissingPlayers(missing);
        } catch (e) {
          console.warn('Failed to fetch missing players', e);
        }
      }

      const profilesMap: Record<string, PlayerProfile> = { ...cachedPlayers, ...newlyFetched };

      // приклеиваем playerProfiles в порядке item.players
      const updated = matchesList.map((m) => ({
        ...m,
        playerProfiles: m.players?.map((uid: string) => profilesMap[uid]).filter(Boolean) || [],
      }));

      setMatches(updated as any);
    },
    [cachedPlayers, fetchMissingPlayers]
  );

  // разовая подписка на список матчей
  useEffect(() => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');

    const unsub = firestore()
      .collection('matches')
      .onSnapshot(
        async (snapshot) => {
          if (snapshotInitialized.current) return;
          snapshotInitialized.current = true;
          await parseSnapshot(snapshot);
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
  }, [parseSnapshot]);

  const loadMatches = useCallback(async () => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');
    try {
      const snapshot = await firestore().collection('matches').get();
      await parseSnapshot(snapshot);
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      spinner.hide();
    }
  }, [parseSnapshot]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  // навигация Waze
  const openWaze = async (loc: string) => {
    if (!loc) return;
    const ios = `waze://?q=${encodeURIComponent(loc)}&navigate=yes`;
    const android = `https://waze.com/ul?q=${encodeURIComponent(loc)}&navigate=yes`;
    const url = Platform.OS === 'ios' ? ios : android;
    const ok = await Linking.canOpenURL(url);
    Linking.openURL(ok ? url : android);
  };

  // WhatsApp
  const openWhatsApp = async (phone?: string) => {
    if (!phone) return;
    const clean = phone.replace(/[^\d+]/g, '');
    const app = `whatsapp://send?phone=${clean}`;
    const web = `https://wa.me/${clean}`;
    const ok = await Linking.canOpenURL(app);
    Linking.openURL(ok ? app : web);
  };

  // Звонок
  const callPhone = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  // фильтруем заполнённые матчи (исчезают из списка)
  const visibleMatches = matches.filter((m: any) => {
    const cap = m.maxPlayers ?? (m.singles ? 2 : 4);
    const cnt = m.playersCount ?? m.players?.length ?? 0;
    return cnt < cap;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>Matches Near You</Text>

      <FlatList
        data={visibleMatches}
        keyExtractor={(item) => item.id}
        initialNumToRender={5}
        renderItem={({ item }) => (
          <MatchCard item={item} onWaze={openWaze} onWhatsApp={openWhatsApp} onCall={callPhone} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />

      {modalVisible && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
          <Animated.View
            entering={SlideInUp.springify().damping(18)}
            exiting={SlideOutDown.springify().damping(18)}
            style={styles.modalContainer}
          >
            <Animated.View entering={ZoomIn} exiting={ZoomOut}>
              <AddMatchModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={async (data) => {
                  try {
                    const id = await createMatch(data);
                    Alert.alert('Match created', `ID: ${id}`);
                    await loadMatches();
                  } catch (e: any) {
                    Alert.alert('Save error', e?.message ?? String(e));
                  }
                }}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}

      <Animated.View entering={BounceIn} style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="tennis-ball" size={30} color="#fff" />
          <Text style={styles.createButtonText}>CREATE MATCH</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
