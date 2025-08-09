import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Card({
  title,
  headerRight,
  children,
}: {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      {(title || headerRight) && (
        <View style={s.header}>
          {title ? <Text style={s.title}>{title}</Text> : <View />}
          {headerRight}
        </View>
      )}
      <View style={s.content}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  content: { gap: 10 },
});
