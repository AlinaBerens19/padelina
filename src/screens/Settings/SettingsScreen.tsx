// path: src/screens/SettingsScreen/SettingsScreen.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
  Platform,
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
import { AvatarEditorModal } from './components/AvatarEditorModal';
import { IOSSelect } from './components/IOSSelect';
import { PlacePickerModal } from './components/PlacePickerModal';
import { Coords, LEVELS, SPORTS } from './constants';

const SettingsScreen = () => {
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);

  // form fields
  const [name, setName] = useState(user?.displayName || '');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState<string>(''); // строка из LEVELS
  const [favouriteSport, setFavouriteSport] = useState<string>('');
  const [phone, setPhone] = useState(''); // только цифры
  const [address, setAddress] = useState('');

  // avatar
  const [avatar, setAvatar] = useState(user?.photoURL || '');
  const [imageOk, setImageOk] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);

  // places
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [locationCoords, setLocationCoords] = useState<Coords | null>(null);
  const [addressCoords, setAddressCoords] = useState<Coords | null>(null);

  // load profile
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

        // location + coords
        setLocation(typeof data.location === 'string' ? data.location : '');
        const locLat = typeof data.locationLat === 'number' ? data.locationLat : undefined;
        const locLng = typeof data.locationLng === 'number' ? data.locationLng : undefined;
        setLocationCoords(
          typeof locLat === 'number' && typeof locLng === 'number'
            ? { lat: locLat, lng: locLng }
            : null
        );

        // address + coords
        setAddress(typeof data.address === 'string' ? data.address : '');
        const addrLat = typeof data.addressLat === 'number' ? data.addressLat : undefined;
        const addrLng = typeof data.addressLng === 'number' ? data.addressLng : undefined;
        setAddressCoords(
          typeof addrLat === 'number' && typeof addrLng === 'number'
            ? { lat: addrLat, lng: addrLng }
            : null
        );

        // level/sport
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

        // phone
        setPhone(
          typeof data.phone === 'string'
            ? data.phone.replace(/\D/g, '').slice(0, 10)
            : '',
        );

        // avatar
        const avatarUrl =
          typeof data.avatar === 'string' && data.avatar.trim()
            ? data.avatar.trim()
            : user.photoURL || '';
        setAvatar(avatarUrl);
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

      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        Alert.alert('Invalid phone', 'Phone number must contain exactly 10 digits.');
        return;
      }
      if (!SPORTS.includes(favouriteSport as any)) {
        Alert.alert('Validation', 'Please select your favourite sport.');
        return;
      }
      if (!LEVELS.includes(level as any)) {
        Alert.alert('Validation', 'Please select your level.');
        return;
      }

      const levelNum = parseFloat(level);

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
        avatar: avatar?.trim() || '',
      };

      // coords
      if (locationCoords) {
        payload.locationLat = locationCoords.lat;
        payload.locationLng = locationCoords.lng;
      }
      if (addressCoords) {
        payload.addressLat = addressCoords.lat;
        payload.addressLng = addressCoords.lng;
      }

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

        {/* Avatar */}
        <View style={styles.avatarOuter}>
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

          <TouchableOpacity
            onPress={() => setEditingAvatar(true)}
            activeOpacity={0.9}
            style={styles.avatarEditBtn}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
          placeholder={loadingProfile ? 'Loading...' : 'Enter full name'}
        />

        {/* Location (place picker) */}
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity
          style={styles.inputPressable}
          onPress={() => setShowCityPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={location ? styles.inputPressableText : styles.inputPressablePlaceholder}>
            {location || (loadingProfile ? 'Loading...' : 'City, Country')}
          </Text>
        </TouchableOpacity>

        {/* Address (place picker) */}
        <Text style={styles.label}>Address</Text>
        <TouchableOpacity
          style={styles.inputPressable}
          onPress={() => setShowAddressPicker(true)}
          activeOpacity={0.8}
        >
          <Text style={address ? styles.inputPressableText : styles.inputPressablePlaceholder}>
            {address || (loadingProfile ? 'Loading...' : 'Street, Building, etc.')}
          </Text>
        </TouchableOpacity>

        {/* Level */}
        <Text style={styles.label}>Level</Text>
        {Platform.OS === 'ios' ? (
          <IOSSelect
            value={level}
            onChange={(v) => setLevel(String(v))}
            options={LEVELS}
            placeholder="Select level"
            loading={loadingProfile}
          />
        ) : (
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
        )}

        {/* Favourite Sport */}
        <Text style={styles.label}>Favourite Sport</Text>
        {Platform.OS === 'ios' ? (
          <IOSSelect
            value={favouriteSport}
            onChange={(v) => setFavouriteSport(String(v))}
            options={SPORTS}
            placeholder="Select sport"
            loading={loadingProfile}
          />
        ) : (
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
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          style={styles.input}
          keyboardType="phone-pad"
          placeholder={loadingProfile ? 'Loading...' : 'e.g., 0501234567'}
          maxLength={10}
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

      {/* Modals */}
      <AvatarEditorModal
        visible={editingAvatar}
        initialUrl={avatar}
        onClose={() => setEditingAvatar(false)}
        onConfirm={(url) => {
          setAvatar(url);
          setImageOk(true);
          setEditingAvatar(false);
        }}
        onClear={() => {
          setAvatar('');
          setImageOk(true);
          setEditingAvatar(false);
        }}
      />

      <PlacePickerModal
        visible={showCityPicker}
        mode="city"
        onClose={() => setShowCityPicker(false)}
        onPick={({ label, lat, lng }) => {
          setLocation(label);
          setLocationCoords({ lat, lng });
        }}
      />

      <PlacePickerModal
        visible={showAddressPicker}
        mode="address"
        onClose={() => setShowAddressPicker(false)}
        onPick={({ label, lat, lng }) => {
          setAddress(label);
          setAddressCoords({ lat, lng });
        }}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
