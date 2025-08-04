import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: { fontSize: 16, color: '#666', marginRight: 8 },
  settingsButton: { padding: 4 },

  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },

  levelBadge: {
    backgroundColor: '#DCEF34',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sportBadge: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: '#111', fontWeight: '600' },
  sportText: { color: '#444', fontWeight: '600' },

  matchesHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchDate: { fontWeight: '600', fontSize: 16 },
  matchLocation: { fontSize: 14, color: '#666' },
  resultBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultText: { fontWeight: '600' },
  padel: { backgroundColor: '#FDE047' },
  level: { backgroundColor: '#DCEF34' },
  padelText: { color: '#92400E' },
  levelText: { color: '#111' },
});
