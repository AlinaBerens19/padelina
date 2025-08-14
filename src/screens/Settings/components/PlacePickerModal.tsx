// path: src/screens/SettingsScreen/components/PlacePickerModal.tsx
import Constants from 'expo-constants';
import React from 'react';
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-get-random-values'; // важно: полифилл для uuid/crypto
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';

function getGooglePlacesKey(): string | undefined {
  const fromExpoConfig = (Constants.expoConfig?.extra as any)?.GOOGLE_PLACES_KEY;
  const fromManifest = (Constants as any)?.manifest?.extra?.GOOGLE_PLACES_KEY;
  const fromEnv = (process.env as any)?.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  return fromExpoConfig || fromManifest || fromEnv;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  mode: 'city' | 'address';
  onPick: (data: { label: string; lat: number; lng: number }) => void;
};

export const PlacePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  mode,
  onPick,
}) => {
  const GOOGLE_KEY = getGooglePlacesKey();
  const placeholder = mode === 'city' ? 'Search city' : 'Search address';

  if (!GOOGLE_KEY) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
            <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', padding: 8 }}>
              <Text style={{ fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 16, marginBottom: 8, fontWeight: '600' }}>
              Google Places key is missing
            </Text>
            <Text style={{ fontSize: 14, color: '#555' }}>
              Добавь ключ в app.config.js → extra.GOOGLE_PLACES_KEY
              (или используй EXPO_PUBLIC_GOOGLE_PLACES_KEY), затем перезапусти Metro.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const query: any = {
    key: GOOGLE_KEY,
    language: 'he',
    components: 'country:il',
    ...(mode === 'city' ? { types: '(cities)' } : { types: 'address' }),
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', padding: 8 }}>
            <Text style={{ fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        <GooglePlacesAutocomplete
          placeholder={placeholder}
          fetchDetails
          enablePoweredByContainer={false}
          minLength={2}
          debounce={200}
          predefinedPlaces={[]}               // гарантируем массив
          keepResultsAfterBlur={false}
          listUnderlayColor="transparent"
          onFail={(err) => console.warn('Places error', err)}
          query={query}
          // 🔧 критично: передаём textInputProps, чтобы не было undefined.onFocus
          textInputProps={{
            onFocus: () => {},
            onBlur: () => {},
            autoCapitalize: 'none',
            autoCorrect: false,
            returnKeyType: 'search',
            placeholderTextColor: '#999',
          }}
          onPress={(data, details) => {
            const label =
              mode === 'city'
                ? data?.structured_formatting?.main_text || data?.description
                : details?.formatted_address || data?.description;

            const lat = details?.geometry?.location?.lat;
            const lng = details?.geometry?.location?.lng;

            if (typeof lat === 'number' && typeof lng === 'number' && label) {
              onPick({ label, lat, lng });
              onClose();
            } else {
              Alert.alert('Error', 'Could not read place coordinates.');
            }
          }}
          styles={{
            textInput: {
              height: 50,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              fontSize: 16,
              marginHorizontal: 16,
              marginTop: 8,
            },
            listView: { marginHorizontal: 16 },
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};
