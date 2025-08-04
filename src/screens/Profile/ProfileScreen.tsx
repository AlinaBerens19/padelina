import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import type { RootStackParamList } from '../../navigation/types';
import { auth } from '../../services/firebase/init';
import { styles } from './UserProfile.styles';


const UserProfile = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Please log in to view your profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Профиль */}
      <View style={styles.profileSection}>
        {user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#fff', fontSize: 18 }}>{user.displayName?.[0] || '?'}</Text>
          </View>
        )}
        <Text style={styles.name}>{user.displayName || 'No Name'}</Text>
        <View style={styles.locationRow}>
          <Text style={styles.location}>{user.email}</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Инфо */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Level</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.badgeText}>4</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Favourite Sport</Text>
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>Padel</Text>
          </View>
        </View>
      </View>

      {/* Выход */}
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Log Out',
            'You are about to log out of your account.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log Out',
                style: 'default',
                onPress: () => signOut(auth()),
              },
            ],
            { cancelable: true }
          )
        }
        style={{
          marginTop: 30,
          alignSelf: 'center',
          backgroundColor: '#eee',
          paddingVertical: 10,
          paddingHorizontal: 24,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: '#e63946', fontWeight: '600', fontSize: 16 }}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default UserProfile;
