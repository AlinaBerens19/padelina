// UserLevelScreen.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function UserLevelScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User level</Text>
      <Text style={styles.value}>42</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  value: { fontSize: 32, fontWeight: '700' },
});

