import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from '@react-native-firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';

import { db } from 'services/firebase/init';
import { Match } from '../WelcomeScreen';
import { styles } from '../WelcomeScreen.styles';

interface Props {
  item: Match;
  onWaze: (location: string) => void;
  onWhatsApp: (phone?: string) => void;
  onCall: (phone?: string) => void;
}

type PlayerProfile = {
  id: string;
  name?: string | null;
  avatar?: string | null; // поле "avatar" как в скрине
};

const MatchCard: React.FC<Props> = ({ item, onWaze, onWhatsApp, onCall }) => {
  const players: string[] = useMemo(() => (Array.isArray(item.players) ? item.players : []), [item.players]);
  const capacity = item.maxPlayers ?? (item.singles ? 2 : 4);
  const isFull = (item.playersCount ?? players.length) >= capacity;

  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!players.length) {
      setProfiles([]);
      return;
    }
    (async () => {
      try {
        const result = await Promise.all(
          players.slice(0, 4).map(async (uid) => {
            try {
              const snap = await getDoc(doc(db, 'users', uid));
              const data = snap.exists ? (snap.data() as any) : null;
              return {
                id: uid,
                name: data?.name ?? data?.fullName ?? null,
                avatar: data?.avatar ?? data?.avatarUrl ?? null,
              } as PlayerProfile;
            } catch {
              return { id: uid } as PlayerProfile;
            }
          })
        );
        if (!cancelled) setProfiles(result);
      } catch (e) {
        if (!cancelled) setProfiles(players.slice(0, 4).map((id) => ({ id })));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [players]);

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
    <View style={styles.card}>
      <View style={styles.topRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
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

      {/* Аватары игроков */}
      <View style={styles.avatarsRow}>
        {profiles.slice(0, 4).map((p, idx) => (
          <View
            key={`${p.id}-${idx}`}
            style={[styles.avatar, { zIndex: 10 - idx, left: idx * 60, width: 48, height: 48, borderRadius: 24 }]}
          >
            {p.avatar ? (
              <Image source={{ uri: p.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            ) : (
              <Text style={styles.avatarText}>{initials(p.name) || '??'}</Text>
            )}
          </View>
        ))}
        {Array.from({ length: Math.max(0, 4 - profiles.length) }).map((_, idx) => {
          const offset = (profiles.length + idx) * 60;
          return (
            <View key={`ph-${idx}`} style={[styles.avatar, styles.avatarPlaceholder, { left: offset, width: 48, height: 48, borderRadius: 24 }]} />
          );
        })}
      </View>

      {/* Join */}
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

export default MatchCard;
