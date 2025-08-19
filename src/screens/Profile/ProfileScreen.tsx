import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signOut } from '@react-native-firebase/auth';
import { doc, onSnapshot } from '@react-native-firebase/firestore';

import UserProfile from 'components/UserProfile';
import { auth } from 'services/firebase/init';
import { useAuth } from '../../hooks/useAuth';
import type { RootStackParamList } from '../../navigation/types';
import { db } from '../../services/firebase/db';
import { styles } from './UserProfile.styles';

type Profile = {
  level?: number;
  favouriteSport?: string;
  /** новое поле из БД */
  avatar?: string;
  /** на всякий случай поддержим старое имя */
  avatarUrl?: string;
  name?: string;
  email?: string;
  location?: string;
  phone?: string;
  address?: string;
  updatedAt?: any; // Firestore Timestamp
};

const safeText = (v?: string | null) => (v && v.trim().length ? v.trim() : '—');

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageOk, setImageOk] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      snap => {
        setProfile(snap.exists() ? (snap.data() as Profile) : null);
        setLoading(false);
        setImageOk(true); // при обновлении профиля попробуем снова показать картинку
      },
      err => {
        console.error('Firestore profile error:', err);
        Alert.alert('Error', 'Failed to load user profile.');
        setLoading(false);
      }
    );

    return unsub;
  }, [user?.uid]);

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            Please log in to view your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Шапка: Firestore -> Firebase Auth -> заглушка
  const name = safeText(profile?.name ?? user.displayName);
  const email = safeText(profile?.email ?? user.email);

  // основное: читаем фото из поля `avatar` (и поддерживаем `avatarUrl`)
  const photo =
    (profile?.avatar && profile.avatar.trim()) ||
    (profile?.avatarUrl && profile.avatarUrl.trim()) ||
    (user.photoURL ?? '');

  const callPhone = (raw: string) => {
    const tel = raw.replace(/\s+/g, '');
    Linking.openURL(`tel:${tel}`);
  };

  const FallbackAvatar = (
    <View
      style={[
        styles.avatar,
        { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
      ]}
    >
      <Text style={{ color: '#fff', fontSize: 18 }}>{name[0] || '?'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Шапка профиля */}
        <View style={styles.profileSection}>
          {photo && imageOk ? (
            <Image
              source={{ uri: photo }}
              style={styles.avatar}
              onError={() => setImageOk(false)}
              // можно раскомментировать, если есть локальный плейсхолдер
              // defaultSource={require('../../../assets/avatar-placeholder.png')}
            />
          ) : (
            FallbackAvatar
          )}

          <Text style={styles.name}>{name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.location}>{email}</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Main', {
                          screen: 'Settings',
                        })}

            >
              <Ionicons name="settings-outline" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Карточка UserProfile */}
        <UserProfile
          level={profile?.level}
          favouriteSport={profile?.favouriteSport}
          location={profile?.location}
          phone={profile?.phone}
          address={profile?.address}
          updatedAt={profile?.updatedAt}
          onPhonePress={callPhone}
        />

        {/* Выход */}
        <TouchableOpacity
          onPress={async () => {
            try {
              await signOut(auth);
            } catch (e: any) {
              Alert.alert('Ошибка', `Не удалось выйти: ${e?.message ?? 'unknown error'}`);
            }
          }}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
