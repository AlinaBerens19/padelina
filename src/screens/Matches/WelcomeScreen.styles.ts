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
  card: {
    backgroundColor: '#f6f6f6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 20, fontWeight: '600' },
  joinButton: {
    backgroundColor: '#d6ff00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinText: { fontWeight: '600' },
});
