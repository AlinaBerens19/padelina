import { useUserStore } from '../userStore';

describe('userStore', () => {
  it('sets and gets AppUser profile correctly', () => {
    const mockProfile = {
      uid: 'user123',
      name: 'Test User',
      avatarUrl: 'https://avatar.url',
      rating: 4,
    };

    useUserStore.getState().setProfile(mockProfile);
    const result = useUserStore.getState().profile;

    expect(result?.uid).toBe('user123');
    expect(result?.name).toBe('Test User');
  });

  it('clears AppUser profile on logout', () => {
    useUserStore.getState().setProfile(null);
    const result = useUserStore.getState().profile;

    expect(result).toBeNull();
  });
});