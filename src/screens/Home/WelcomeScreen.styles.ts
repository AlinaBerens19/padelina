// WelcomeScreen.styles.ts
import { StyleSheet } from 'react-native';

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
});
