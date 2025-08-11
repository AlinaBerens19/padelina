// path: src/screens/SettingsScreen/SettingsScreen.tsx
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/firebase/db';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './SettingsScreen.styles';

const SPORTS = ['Tennis', 'Padel', 'Pickleball'] as const;
const LEVELS = ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'] as const;

const SettingsScreen = () => {
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [name, setName] = useState(user?.displayName || '');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState<string>(''); // строка из LEVELS
  const [favouriteSport, setFavouriteSport] = useState<string>('');
  const [phone, setPhone] = useState(''); // только цифры
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(user?.photoURL || '');
  const [imageOk, setImageOk] = useState(true);

  // Подтягиваем дефолты из Firestore: users/{uid}
  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        setLoadingProfile(true);
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = (snap.exists() ? snap.data() : {}) as Record<string, any>;

        setName(
          typeof data.name === 'string' && data.name.trim()
            ? data.name
            : user.displayName || '',
        );
        setLocation(typeof data.location === 'string' ? data.location : '');

        const lvlStr =
          typeof data.level === 'number'
            ? String(data.level)
            : typeof data.level === 'string'
            ? data.level
            : '';
        setLevel(LEVELS.includes(lvlStr as any) ? lvlStr : '');

        const sportStr =
          typeof data.favouriteSport === 'string' ? data.favouriteSport : '';
        setFavouriteSport(SPORTS.includes(sportStr as any) ? sportStr : '');

        setPhone(
          typeof data.phone === 'string'
            ? data.phone.replace(/\D/g, '').slice(0, 10)
            : '',
        );
        setAddress(typeof data.address === 'string' ? data.address : '');

        // аватар: новое поле avatar, иначе Firebase Auth
        setAvatar(
          typeof data.avatar === 'string' && data.avatar.trim()
            ? data.avatar.trim()
            : user.photoURL || '',
        );
        setImageOk(true);
      } catch (e: any) {
        Alert.alert('Ошибка', e?.message || 'Не удалось загрузить профиль.');
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user?.uid, user?.displayName, user?.photoURL]);

  const handleSave = async () => {
    const spinner = useSpinnerStore.getState();
    try {
      spinner.show('Saving...');
      if (!user) throw new Error('User not found');

      // Телефон: ровно 10 цифр
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        Alert.alert('Invalid phone', 'Phone number must contain exactly 10 digits.');
        return;
      }

      // Валидация выбора из списков
      if (!SPORTS.includes(favouriteSport as any)) {
        Alert.alert('Validation', 'Please select your favourite sport.');
        return;
      }
      if (!LEVELS.includes(level as any)) {
        Alert.alert('Validation', 'Please select your level.');
        return;
      }

      const levelNum = parseFloat(level); // допускаем 1.5 и т.п.

      const payload: Record<string, any> = {
        uid: user.uid,
        name: name.trim(),
        location: location.trim(),
        favouriteSport,
        phone: phoneDigits,
        address: address.trim(),
        email: user.email,
        updatedAt: serverTimestamp(),
        level: Number.isFinite(levelNum) ? levelNum : undefined,
      };

      if (avatar?.trim()) payload.avatar = avatar.trim();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, payload, { merge: true });

      Alert.alert('Saved', 'Your changes have been saved.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save profile.');
    } finally {
      spinner.hide();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Profile Settings</Text>

        {/* Круглый аватар с фолбэком-инициалом */}
        <View style={styles.avatarWrap}>
          {avatar && imageOk ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              onError={() => setImageOk(false)}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarFallbackText}>
                {(name || user?.displayName || '?').trim().charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
          placeholder={loadingProfile ? 'Loading...' : 'Enter full name'}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          placeholder={loadingProfile ? 'Loading...' : 'City, Country'}
        />

        <Text style={styles.label}>Level</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={level}
            onValueChange={(v) => setLevel(String(v))}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="#111"
          >
            <Picker.Item
              label={loadingProfile ? 'Loading...' : 'Select level'}
              value=""
            />
            {LEVELS.map((lvl) => (
              <Picker.Item key={lvl} label={lvl} value={lvl} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Favourite Sport</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={favouriteSport}
            onValueChange={(v) => setFavouriteSport(String(v))}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="#111"
          >
            <Picker.Item
              label={loadingProfile ? 'Loading...' : 'Select sport'}
              value=""
            />
            {SPORTS.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          style={styles.input}
          keyboardType="phone-pad"
          placeholder={loadingProfile ? 'Loading...' : 'e.g., 0501234567'}
          maxLength={10}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          placeholder={
            loadingProfile ? 'Loading...' : 'Street, Building, etc.'
          }
        />

        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loadingProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
