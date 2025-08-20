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
import 'react-native-get-random-values';
import GooglePlacesTextInput from 'react-native-google-places-textinput';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  mode: 'city' | 'address';
  onPick: (data: { label: string; lat: number; lng: number }) => void;
};

function getGooglePlacesKey(): string | undefined {
  const fromExpoConfig = (Constants.expoConfig?.extra as any)?.GOOGLE_PLACES_KEY;
  const fromManifest = (Constants as any)?.manifest?.extra?.GOOGLE_PLACES_KEY;
  const fromEnv = (process.env as any)?.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  return fromExpoConfig || fromManifest || fromEnv;
}

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

  // Конфигурация запроса: язык/регион и фильтр типов
  const languageCode = 'he';
  const includedRegionCodes = ['il'];
  // Для городов — специальный фильтр "(cities)"; для адресов — можно оставить пустым или перечислить типы адресов
  const types = mode === 'city' ? ['(cities)'] : ['street_address', 'route', 'premise'];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'flex-end', padding: 8 }}>
            <Text style={{ fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        <GooglePlacesTextInput
          apiKey={GOOGLE_KEY}
          placeHolderText={placeholder}
          // Поиск
          languageCode={languageCode}
          includedRegionCodes={includedRegionCodes}
          types={types}
          minCharsToFetch={2}
          debounceDelay={200}
          // Детали места (чтобы получить координаты)
          fetchDetails={true}
          detailsFields={[
            'displayName',
            'formattedAddress',
            'location',      // вернёт LatLng: { latitude, longitude } — см. Places API (New) поля. :contentReference[oaicite:1]{index=1}
            'viewport',
            'types',
          ]}
          // UI и поведение в модалке со скроллом
          scrollEnabled={false}
          nestedScrollEnabled={false}
          showClearButton={true}
          showLoadingIndicator={true}
          // Стили (минимальные)
          style={{
            container: { paddingHorizontal: 16 },
            input: {
              height: 50,
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              fontSize: 16,
              marginTop: 8,
            },
            suggestionsContainer: { backgroundColor: '#fff', maxHeight: 300 },
            suggestionItem: { paddingVertical: 12, paddingHorizontal: 8 },
            suggestionText: {
              main: { fontSize: 16, color: '#333' },
              secondary: { fontSize: 13, color: '#666' },
            },
            placeholder: { color: '#999' },
          }}
          // Ошибки
          onError={(err: any) => {
            console.warn('Places error', err);
          }}
          // Выбор места
          onPlaceSelect={(place: any) => {
            // label: сначала отформатированный адрес, потом текстовое имя
            const label =
              place?.details?.formattedAddress ||
              place?.details?.displayName?.text ||
              place?.displayName?.text ||
              '';

            // координаты: в новом API LatLng => { latitude, longitude }
            const lat =
              place?.details?.location?.latitude ??
              place?.location?.latitude;
            const lng =
              place?.details?.location?.longitude ??
              place?.location?.longitude;

            if (typeof lat === 'number' && typeof lng === 'number' && label) {
              onPick({ label, lat, lng });
              onClose();
            } else {
              Alert.alert('Error', 'Could not read place coordinates.');
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default PlacePickerModal;
