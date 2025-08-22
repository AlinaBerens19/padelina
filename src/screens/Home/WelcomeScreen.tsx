import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {
  collection,
  onSnapshot,
  query,
} from '@react-native-firebase/firestore';

import { db } from '../../services/firebase/init';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './WelcomeScreen.styles';
import AddMatchModal from './components/AddMatchModal';
import MatchCard from './components/MatchCard';

export type Match = {
  id: string;
  location: string;
  level: number;
  sport: 'Tennis' | 'Padel' | 'Pickleball';
  price: number;
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
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>Matches Near You</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            item={item}
            onWaze={openWaze}
            onWhatsApp={openWhatsApp}
            onCall={callPhone}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 120 }]}
        ListEmptyComponent={<Text style={styles.emptyText}>No matches found.</Text>}
      />

      <AddMatchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={({ location, price }) => {
          Alert.alert('Submit', `Location: ${location}, Price: ${price}`);
        }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: 40,
          alignSelf: 'center',
          zIndex: 99,
        }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#00C853',
            width: 120,
            height: 120,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          onPress={() => setModalVisible(true)}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="tennis-ball" size={30} color="#fff" />
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: 16,
                marginTop: 6,
                textAlign: 'center',
              }}>
              CREATE MATCH
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
