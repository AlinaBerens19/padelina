import { collection, onSnapshot, query /*, orderBy, where */ } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../services/firebase/db'; // путь от текущего файла
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './WelcomeScreen.styles';

export type Match = {
  id: string;
  location: string;
  level: number;
  sport: 'Tennis' | 'Padel' | 'Pickleball';
  price: number;
};

export default function WelcomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const spinner = useSpinnerStore.getState();
    spinner.show('Loading matches...');

    // можно добавить сортировку/фильтр:
    // const q = query(collection(db, 'matches'), where('sport', '==', 'Padel'), orderBy('price', 'asc'));
    const q = query(collection(db, 'matches'));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Match[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data() as Record<string, any>;
          return {
            id: docSnap.id,
            location: String(d.location ?? '—'),
            level: Number.isFinite(Number(d.level)) ? Number(d.level) : 0,
            sport: (['Tennis', 'Padel', 'Pickleball'].includes(d.sport)
              ? d.sport
              : 'Padel') as Match['sport'],
            price: Number.isFinite(Number(d.price)) ? Number(d.price) : 0,
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

  const renderItem = ({ item }: { item: Match }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.price}>₪{item.price}</Text>
        <Text>{item.location}</Text>
        <Text>Level {item.level}</Text>
        <Text>{item.sport}</Text>
      </View>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.heading}>Matches Near You</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text>No matches found.</Text>}
      />
    </SafeAreaView>
  );
}
