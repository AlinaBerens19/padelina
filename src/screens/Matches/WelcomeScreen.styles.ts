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

  card: {
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // центр карточки
  cardContent: { flex: 1 },
  price: { fontSize: 20, fontWeight: '600' },

  // кнопка Join
  joinButton: {
    backgroundColor: '#d6ff00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonDisabled: { opacity: 0.5 },
  joinText: { fontWeight: '600' },

  // dev-ссылка на загрузку
  uploadLink: { marginTop: 8 },
  uploadLinkText: { color: '#3b82f6' },
});
