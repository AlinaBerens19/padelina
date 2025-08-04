import firestore from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useSpinnerStore } from '../../store/spinnerStore';
import { styles } from './SettingsScreen.styles';

const SettingsScreen = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [favouriteSport, setFavouriteSport] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSave = async () => {
    const spinner = useSpinnerStore.getState();
    try {
      spinner.show('Saving...');
      if (!user) throw new Error('User not found');

      const profile = {
        uid: user.uid,
        name,
        location,
        level: Number(level),
        favouriteSport,
        phone,
        address,
        email: user.email,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('users').doc(user.uid).set(profile);
      Alert.alert('Saved', 'Your changes have been saved.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save profile.');
    } finally {
      spinner.hide();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Profile Settings</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />

        <Text style={styles.label}>Location</Text>
        <TextInput value={location} onChangeText={setLocation} style={styles.input} />

        <Text style={styles.label}>Level</Text>
        <TextInput value={level} onChangeText={setLevel} style={styles.input} keyboardType="numeric" />

        <Text style={styles.label}>Favourite Sport</Text>
        <TextInput value={favouriteSport} onChangeText={setFavouriteSport} style={styles.input} />

        <Text style={styles.label}>Phone</Text>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

        <Text style={styles.label}>Address</Text>
        <TextInput value={address} onChangeText={setAddress} style={styles.input} />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
