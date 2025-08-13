import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  list: { gap: 12 },
  emptyText: { color: '#777' },

  // Карточка
  card: {
    position: 'relative',
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 12,
    paddingBottom: 72,     // запас под крупные аватары и кнопку
    minHeight: 160,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  // Верхняя строка: слева изображение, справа текст
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // левая картинка
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
  thumbPlaceholderText: { color: '#999', fontSize: 12 },

  // Правая колонка с выравниванием вправо
  infoCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  primaryLine: { fontSize: 20, fontWeight: '700', color: '#111' },
  line: { fontSize: 13, color: '#333', marginTop: 2, textAlign: 'right' },

  // Ряд иконок (Waze, WhatsApp, Phone)
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

  // Аватары снизу слева (увеличены и раздвинуты)
  avatarsRow: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    height: 52,   // под 44px кружки
    width: 200,   // шаг 40px * 3 + ширина 44px ≈ 164, берем с запасом
  },
  avatar: {
    position: 'absolute',
    width: 44,
    height: 44,
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
  avatarPlaceholder: { backgroundColor: '#ECEFF4' },

  // Кнопка Join — справа снизу
  joinButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  joinButtonDisabled: { backgroundColor: '#C7C9D1' },
  joinText: { color: '#fff', fontWeight: '700' },
});
