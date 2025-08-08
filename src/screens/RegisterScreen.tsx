// src/screens/RegisterScreen.tsx
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';

// Нативный модульный Auth
import { createUserWithEmailAndPassword } from '@react-native-firebase/auth';
// Нативный модульный Firestore
import { doc, setDoc } from '@react-native-firebase/firestore';

// Инстансы из вашего init.ts
import { auth, db } from '../services/firebase/init';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name || !city) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // 1) Регистрируем в Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = userCredential.user.uid;

      // 2) Создаём документ в Firestore
      await setDoc(doc(db, 'users', uid), {
        id: uid,
        name,
        email: email.trim(),
        city,
        level: 1,
        favoriteSport: 'tennis',
      });

      // 3) Переходим на главный экран
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Create Account" onPress={handleRegister} />
      <View style={{ marginTop: 10 }}>
        <Button
          title="Already have an account? Login"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});

export default RegisterScreen;
