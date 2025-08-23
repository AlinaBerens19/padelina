// MatchCard.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { usePlayerStore } from 'store/playerStore';
import { Match } from 'types/firebase';
import { styles } from '../WelcomeScreen.styles';

interface Props {
  item: Match;
  onWaze: (location: string) => void;
  onWhatsApp: (phone?: string) => void;
  onCall: (phone?: string) => void;
}

const MatchCard: React.FC<Props> = ({ item, onWaze, onWhatsApp, onCall }) => {
  const players: string[] = useMemo(() => (Array.isArray(item.players) ? item.players : []), [item.players]);
  const capacity = item.maxPlayers ?? (item.singles ? 2 : 4);
  const isFull = (item.playersCount ?? players.length) >= capacity;

  const playerStore = usePlayerStore();
  const profiles = useMemo(() => {
    return players
      .slice(0, 4)
      .map((uid) => playerStore.players[uid] || { id: uid });
  }, [players, playerStore.players]);

  const lines = [
    `₪${Number.isFinite(Number(item.price)) ? Number(item.price) : 0}`,
    String(item.location ?? '—'),
    `Level ${Number(item.level ?? 0)}`,
    item.sport,
  ];

  const initials = (name?: string | null) =>
    (name ?? '')
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.card}>
      <View style={styles.topRow}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: 108, height: 88, borderRadius: 12 }}
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

      <View style={styles.avatarsRow}>
        {profiles.slice(0, 4).map((p, idx) => (
          <Animated.View
            entering={FadeInUp.delay(idx * 100)}
            key={`${p.id}-${idx}`}
            style={[styles.avatar, { zIndex: 10 - idx, left: idx * 60, width: 58, height: 58, borderRadius: 36 }]}
          >
            {p.avatar ? (
              <Image
                source={{ uri: p.avatar }}
                style={{ width: 58, height: 58, borderRadius: 36 }}
              />
            ) : (
              <Text style={styles.avatarText}>{initials(p.name) || '??'}</Text>
            )}
          </Animated.View>
        ))}
        {Array.from({ length: Math.max(0, 4 - profiles.length) }).map((_, idx) => {
          const offset = (profiles.length + idx) * 60;
          return (
            <View key={`ph-${idx}`} style={[styles.avatar, styles.avatarPlaceholder, { left: offset, width: 58, height: 58, borderRadius: 36 }]} />
          );
        })}
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
    </Animated.View>
  );
};

function areEqual(prev: Props, next: Props) {
  return prev.item.id === next.item.id;
}

export default React.memo(MatchCard, areEqual);
