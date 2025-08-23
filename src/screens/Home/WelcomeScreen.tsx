// WelcomeScreen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';
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
import { db } from '../../services/firebase/init';
import { usePlayerStore } from '../../store/playerStore';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './WelcomeScreen.styles';
import AddMatchModal from './components/AddMatchModal';
import MatchCard from './components/MatchCard';

const getSafeSport = (sport: string): Match['sport'] =>
  ['Tennis', 'Padel', 'Pickleball'].includes(sport)
    ? (sport as Match['sport'])
    : 'Padel';

export default function WelcomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Глобальный кэш профилей игроков
  const { players: cachedPlayers, addPlayers } = usePlayerStore();

  // Чтобы избежать двойного первого срабатывания в dev-режиме
  const snapshotInitialized = useRef(false);

  /**
   * Загружаем отсутствующие профили игроков пачками (in / chunks по 10)
   */
  const fetchMissingPlayers = useCallback(
    async (ids: string[]): Promise<Record<string, PlayerProfile>> => {
      if (ids.length === 0) return {};

      const usersRef = collection(db, 'users');
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

      const results: Record<string, PlayerProfile> = {};

      const snaps = await Promise.all(
        chunks.map((chunk) => {
          const qUsers = query(usersRef, where('__name__', 'in', chunk));
          return getDocs(qUsers);
        })
      );

      for (const snap of snaps) {
        for (const docSnap of snap.docs) {
          const data = docSnap.data() as any;
          const rawPath: string | null =
            (typeof data?.avatar === 'string' && data.avatar) ||
            (typeof data?.avatarUrl === 'string' && data.avatarUrl) ||
            null;

          let avatar: string | null = null;
          if (rawPath && rawPath.length > 0) {
            if (rawPath.startsWith('http')) {
              avatar = rawPath;
            } else {
              // это путь в Firebase Storage
              try {
                avatar = await storage().ref(rawPath).getDownloadURL();
              } catch (err) {
                console.warn('⚠️ Failed to load avatar from storage', docSnap.id, rawPath, err);
              }
            }
          }

          results[docSnap.id] = {
            id: docSnap.id,
            name: data?.name ?? data?.fullName ?? null,
            avatar,
          };
        }
      }

      // положим в глобальный кэш
      if (Object.keys(results).length) addPlayers(results);

      return results;
    },
    [addPlayers]
  );

  /**
   * Разбор снапшота матчей, подгрузка недостающих профилей и формирование playerProfiles
   */
  const parseSnapshot = useCallback(
    async (snapshot: any) => {
      const matchesList: Match[] = snapshot.docs.map((docSnap: any) => {
        const d = docSnap.data() as Record<string, any>;
        const playersArr = Array.isArray(d.players) ? d.players : [];
        const maxPlayers = Number.isFinite(Number(d.maxPlayers))
          ? Number(d.maxPlayers)
          : d.singles
          ? 2
          : 4;

        return {
          id: docSnap.id,
          location: String(d.location ?? d.address ?? '—'),
          level: Number.isFinite(Number(d.level)) ? Number(d.level) : 0,
          sport: getSafeSport(d.sport),
          price: Number.isFinite(Number(d.price)) ? Number(d.price) : 0,
          time: d.time ?? null,
          phone: d.phone ? String(d.phone) : undefined,
          players: playersArr,
          maxPlayers,
          playersCount: Number.isFinite(Number(d.playersCount))
            ? Number(d.playersCount)
            : playersArr.length,
          imageUrl:
            typeof d.imageUrl === 'string' && d.imageUrl.length > 0
              ? d.imageUrl
              : null,
          singles: !!d.singles,
        };
      });

      // Собираем юзеров, которых нет в кэше
      const allIds = new Set<string>();
      matchesList.forEach((m) => m.players?.forEach((uid) => allIds.add(uid)));
      const missing = Array.from(allIds).filter((id) => !cachedPlayers[id]);

      let newlyFetched: Record<string, PlayerProfile> = {};
      if (missing.length > 0) {
        try {
          newlyFetched = await fetchMissingPlayers(missing);
        } catch (e) {
          console.warn('Failed to fetch missing players', e);
        }
      }

      const profilesMap: Record<string, PlayerProfile> = {
        ...cachedPlayers,
        ...newlyFetched,
      };

      const updated = matchesList.map((m) => ({
        ...m,
        playerProfiles: m.players?.map((uid) => profilesMap[uid]).filter(Boolean) || [],
      }));

      setMatches(updated);
    },
    [cachedPlayers, fetchMissingPlayers]
  );

  const loadMatches = useCallback(async () => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');
    try {
      const qMatches = query(collection(db, 'matches'));
      const snapshot = await getDocs(qMatches);
      await parseSnapshot(snapshot);
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      spinner.hide();
    }
  }, [parseSnapshot]);

  useEffect(() => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');
    const qMatches = query(collection(db, 'matches'));

    const unsub = onSnapshot(
      qMatches,
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const openWaze = async (loc: string) => {
    if (!loc) return;
    const ios = `waze://?q=${encodeURIComponent(loc)}&navigate=yes`;
    const android = `https://waze.com/ul?q=${encodeURIComponent(loc)}&navigate=yes`;
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>Matches Near You</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        initialNumToRender={5}
        renderItem={({ item }) => (
          <MatchCard
            item={item}
            onWaze={openWaze}
            onWhatsApp={openWhatsApp}
            onCall={callPhone}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />

      {modalVisible && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.modalOverlay}>
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
                onSubmit={({ location, price }) => {
                  Alert.alert('Submit', `Location: ${location}, Price: ${price}`);
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
