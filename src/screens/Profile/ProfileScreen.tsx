import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@react-native-firebase/auth';
import { doc, getDoc } from '@react-native-firebase/firestore';
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

import UserProfile from 'components/UserProfile';
import { useAuth } from 'hooks/useAuth';
import type { RootStackParamList } from 'navigation/types';
import { db } from 'services/firebase/db';
import { auth } from 'services/firebase/init';
import { useUserStore } from 'store/userStore';
import { styles } from './UserProfile.styles';

const safeText = (v?: string | null) => (v && v.trim().length ? v.trim() : '—');

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const { profile, setProfile } = useUserStore();

  const [loading, setLoading] = useState(!profile);
  const [imageOk, setImageOk] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || profile) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            uid: user.uid,
            name: data.name ?? '',
            avatarUrl: data.avatar ?? data.avatarUrl ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
            level: data.level ?? 0,
            favouriteSport: data.favouriteSport ?? '',
            updatedAt: data.updatedAt?.toDate?.() ?? undefined,
          });
        }
      } catch (e) {
        console.warn('Failed to load user profile', e);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid, profile]);

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

  if (loading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const name = safeText(profile.name);
  const email = safeText(profile.email);
  const photo = profile.avatarUrl?.trim() ?? '';
  const callPhone = (raw: string) => Linking.openURL(`tel:${raw.replace(/\s+/g, '')}`);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Шапка профиля */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {(avatarLoading || !imageOk) && (
              <View
                style={[
                  styles.avatar,
                  {
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ccc',
                    zIndex: 1,
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>{name[0] || '?'}</Text>
              </View>
            )}
            {photo && imageOk && (
              <Image
                source={{ uri: photo }}
                style={styles.avatar}
                onLoadEnd={() => setAvatarLoading(false)}
                onError={() => {
                  setImageOk(false);
                  setAvatarLoading(false);
                }}
              />
            )}
          </View>

          <Text style={styles.name}>{name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.location}>{email}</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'Settings',
                })
              }
            >
              <Ionicons name="settings-outline" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <UserProfile
          level={profile.level}
          favouriteSport={profile.favouriteSport}
          location={profile.address}
          phone={profile.phone}
          address={profile.address}
          updatedAt={profile.updatedAt}
          onPhonePress={callPhone}
        />

        <TouchableOpacity
          onPress={async () => {
            try {
              await signOut(auth);
              setProfile(null);
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
