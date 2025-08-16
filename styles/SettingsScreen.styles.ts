// path: src/screens/SettingsScreen/SettingsScreen.styles.ts
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

  // === Нажимаемый "инпут" (для iOS-выбора Location/Address через модалку) ===
  inputPressable: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: RADIUS,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  inputPressableText: { fontSize: 16, color: '#111' },
  inputPressablePlaceholder: { fontSize: 16, color: '#999' },

  // === Кнопка-поле для iOS ActionSheet (IOSSelect) ===
  inputButton: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: RADIUS,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputButtonText: { fontSize: 16, color: '#111' },
  inputButtonPlaceholder: { fontSize: 16, color: '#999' },

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
    ...(Platform.OS === 'ios' ? { height: FIELD_HEIGHT } : null),
  },
  // iOS: высота строки выпадающего списка (если используешь native Picker)
  pickerItemIOS: {
    fontSize: 16,
    height: FIELD_HEIGHT,
    lineHeight: 22,
  },

  // ===== Аватар =====
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    width: 104,
    height: 104,
    alignSelf: 'center',
  },
  // используется в JSX как контейнер
  avatarOuter: {
    position: 'relative',
    width: 104,
    height: 104,
    alignSelf: 'center',
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
  // кнопка-карандаш
  avatarEditBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1ba158', // твой цвет
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
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

  // ===== Modal для ввода URL аватара и PlacePicker =====
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalPreview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    marginBottom: 12,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtn: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalBtnSecondary: {
    backgroundColor: '#777',
  },
  modalBtnDanger: {
    backgroundColor: '#c63c3c',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
