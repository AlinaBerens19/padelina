import { Platform, StyleSheet } from 'react-native';

const FIELD_HEIGHT = 56; // единая высота для всех полей
const RADIUS = 8;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 32,
    backgroundColor: '#fff',
    flexGrow: 1,
  },

  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 6 },

  // TextInput — строго FIELD_HEIGHT
  input: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 0,            // фикс. высота → паддинг по вертикали не нужен
    textAlignVertical: 'center',   // Android: текст по центру
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  // Picker — высота задаётся wrapper’ом
  pickerWrapper: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: RADIUS,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 16,
  },
  picker: {
    color: '#111',
    fontSize: 16,
    // iOS уважает height у самого Picker:
    ...(Platform.OS === 'ios' ? { height: FIELD_HEIGHT } : null),
  },
  // iOS: высота строки выпадающего списка
  pickerItemIOS: {
    fontSize: 16,
    height: FIELD_HEIGHT,
    lineHeight: 22,
  },

    avatarWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#ddd',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },

  // Save button
  saveButton: {
    backgroundColor: '#ECFCCB',
    borderWidth: 1,
    borderColor: '#A3E635',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  saveText: { color: '#365314', fontWeight: '700', fontSize: 16 },
});
