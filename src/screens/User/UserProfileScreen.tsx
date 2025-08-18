// C:\Users\Alina\Desktop\PadelinaClean\padelina\src\screens\User\UserProfileScreen.tsx
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from 'navigation/MainStackNavigator';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IOSSelect } from 'screens/Settings/components/IOSSelect';
import { PlacePickerModal } from 'screens/Settings/components/PlacePickerModal';
import { Coords, SPORTS } from 'screens/Settings/constants';
import { styles } from '../../../styles/SettingsScreen.styles';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/firebase/db';
import { useSpinnerStore } from '../../store/spinnerStore';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'UserProfile'>;
};

const UserProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const spinner = useSpinnerStore.getState();
  const [loadingProfile, setLoadingProfile] = useState(true);

  // form fields
  const [name, setName] = useState(user?.displayName || '');
  const [location, setLocation] = useState('');
  const [favouriteSport, setFavouriteSport] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // places
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [locationCoords, setLocationCoords] = useState<Coords | null>(null);
  const [addressCoords, setAddressCoords] = useState<Coords | null>(null);

  useEffect(() => {
    // ✅ Добавляем проверку здесь
    if (!user) {
      // Если пользователь не существует, перенаправляем на экран 'Login'
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
      return;
    }
    
    // Если user существует, но у него нет uid, также перенаправляем
    if (!user?.uid) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
      return;
    }

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
        const locLat = typeof data.locationLat === 'number' ? data.locationLat : undefined;
        const locLng = typeof data.locationLng === 'number' ? data.locationLng : undefined;
        setLocationCoords(
          typeof locLat === 'number' && typeof locLng === 'number'
            ? { lat: locLat, lng: locLng }
            : null
        );

        setAddress(typeof data.address === 'string' ? data.address : '');
        const addrLat = typeof data.addressLat === 'number' ? data.addressLat : undefined;
        const addrLng = typeof data.addressLng === 'number' ? data.addressLng : undefined;
        setAddressCoords(
          typeof addrLat === 'number' && typeof addrLng === 'number'
            ? { lat: addrLat, lng: addrLng }
            : null
        );

        setPhone(
          typeof data.phone === 'string'
            ? data.phone.replace(/\D/g, '').slice(0, 10)
            : '',
        );

      } catch (e: any) {
        Alert.alert('Ошибка', e?.message || 'Не удалось загрузить профиль.');
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [user?.uid, user?.displayName, user?.photoURL, navigation]); // ✅ Добавлено `navigation` в зависимости

  // ... (остальной код handleSave и рендера)
  const handleSave = async () => {
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

      const payload: Record<string, any> = {
        uid: user.uid,
        name: name.trim(),
        location: location.trim(),
        favouriteSport,
        phone: phoneDigits,
        address: address.trim(),
        email: user.email,
        updatedAt: serverTimestamp(),
      };

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

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );

    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save profile.');
    } finally {
      spinner.hide();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
          placeholder={loadingProfile ? 'Loading...' : 'Enter full name'}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.inputPressable} onPress={() => setShowCityPicker(true)} activeOpacity={0.8}>
          <Text style={location ? styles.inputPressableText : styles.inputPressablePlaceholder}>
            {location || (loadingProfile ? 'Loading...' : 'City, Country')}
          </Text>
        </TouchableOpacity>

        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <TouchableOpacity style={styles.inputPressable} onPress={() => setShowAddressPicker(true)} activeOpacity={0.8}>
          <Text style={address ? styles.inputPressableText : styles.inputPressablePlaceholder}>
            {address || (loadingProfile ? 'Loading...' : 'Street, Building, etc.')}
          </Text>
        </TouchableOpacity>

        {/* Favourite Sport */}
        <Text style={styles.label}>Favourite Sport *</Text>
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
              <Picker.Item label={loadingProfile ? 'Loading...' : 'Select sport'} value="" />
              {SPORTS.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
        )}

        {/* Phone */}
        <Text style={styles.label}>Phone *</Text>
        <TextInput
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
          style={styles.input}
          keyboardType="phone-pad"
          placeholder={loadingProfile ? 'Loading...' : 'e.g., 0501234567'}
          maxLength={10}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loadingProfile} activeOpacity={0.8}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>

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

export default UserProfileScreen;