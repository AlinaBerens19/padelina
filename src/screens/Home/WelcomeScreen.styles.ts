// path: src/screens/Welcome/components/WelcomeScreen.styles.ts
import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  list: {
    gap: 12,
  },

  emptyText: {
    color: '#777',
  },

  // Карточка
  card: {
    position: 'relative',
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 12,
    paddingBottom: 72,
    minHeight: 160,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  thumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eee',
  },

  thumbPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbPlaceholderText: {
    color: '#999',
    fontSize: 12,
  },

  infoCol: {
    flex: 1,
    alignItems: 'flex-end',
  },

  primaryLine: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  line: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
    textAlign: 'right',
  },

  iconRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  iconButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#EDF1F7',
  },

  avatarsRow: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    height: 52,
    width: 200,
  },

  avatar: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 22,
    backgroundColor: '#D6E4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2A3A67',
  },

  avatarPlaceholder: {
    backgroundColor: '#ECEFF4',
  },

  joinButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#1ba158',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 199,
  },

  joinButtonDisabled: {
    backgroundColor: '#C7C9D1',
  },

  joinText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Кнопка CREATE MATCH
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
  },

  createButton: {
    backgroundColor: '#00C853',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  createButtonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 99,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0006',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // 🔽 Стили для AddMatchModal
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.35)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  kav: { width: '100%' },
  modal: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    width: '100%', 
    maxWidth: 520, 
    maxHeight: '90%', 
    padding: 16 
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },

  label: { marginTop: 12, marginBottom: 6, fontSize: 13, opacity: 0.8 },
  labelInline: { fontSize: 14, opacity: 0.9 },

  input: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    marginBottom: 10 
  },

  // убрали фиксированную высоту
  pickerBox: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 10, 
    overflow: 'hidden', 
    marginBottom: 10,
  },

  // высокий контейнер для колёсных picker'ов
  pickerTall: {
    height: Platform.select({ ios: 180, android: 48 }),
  },

  // стиль текста элементов picker
  pickerItem: {
    fontSize: 16,
    color: '#111827',
  },

  row: { 
    flexDirection: 'row', 
    gap: 10, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  rowItem: { flex: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  dateSummary: { fontSize: 14, fontWeight: '600', color: '#111827' },

  actions: { 
    marginTop: 16, 
    flexDirection: 'row', 
    gap: 12, 
    justifyContent: 'flex-end' 
  },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnPrimary: { backgroundColor: '#325df6' },
  btnDisabled: { opacity: 0.6 },
  btnGhost: { backgroundColor: '#f3f4f6' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnGhostText: { color: '#111827' },

  // Для модалки выбора клуба
  clubField: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubFieldText: { fontSize: 14, color: '#111827' },

  fullModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0, // SafeArea покрывает верх
  },
  fullModalHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  fullModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  searchBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  listItemText: {
    fontSize: 15,
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },

  // чекбоксы для Duration
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  checkboxOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOptionActive: {
    backgroundColor: '#325df6',
    borderColor: '#325df6',
  },
  checkboxText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  checkboxTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
