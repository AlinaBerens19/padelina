import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '../../services/firebase/init';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './HomeScreen.styles';

export type Match = {
  id: string;
  location: string;
  level: number;
  sport: 'Tennis' | 'Padel' | 'Pickleball';
  price: number;
};

export default function HomeScreen() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const loadMatches = async () => {
      const spinner = useSpinnerStore.getState();
      try {
        spinner.show('Loading matches...');
        const snapshot = await firestore().collection('matches').get();
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Match[];
        setMatches(list);
      } catch (e) {
        console.error('Failed to fetch matches:', e);
      } finally {
        spinner.hide();
      }
    };

    loadMatches();
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
