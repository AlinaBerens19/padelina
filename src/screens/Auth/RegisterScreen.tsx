// path: src/screens/RegisterScreen.tsx
import 'react-native-get-random-values';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../../navigation/types';

// Firebase Auth (RNFirebase)
import authRN, { FirebaseAuthTypes } from '@react-native-firebase/auth';
// Firestore (RNFirebase)
import firestore from '@react-native-firebase/firestore';

// Google Sign-In
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

// Apple Sign-In (Expo)
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Random from 'expo-random';
import { styles } from './styles/RegisterScreen.styles';

// ✅ стили

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  // email/password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // phone
  const [phone, setPhone] = useState(''); // в формате +9725.... (E.164)
  const [code, setCode] = useState('');
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // ui
  const [loading, setLoading] = useState(false);
  const appleAvailable = useAppleAvailable();

  // ========= helpers =========
  const ensureUserDoc = async (user: FirebaseAuthTypes.User) => {
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            id: user.uid,
            email: user.email ?? null,
            name: user.displayName ?? '',
            phone: user.phoneNumber ?? null,
          },
          { merge: true }
        );
    } catch (e) {
      console.warn('ensureUserDoc error', e);
    }
  };

  // ========= email/password =========
  const handleRegisterEmail = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    try {
      setLoading(true);
      const cred = await authRN().createUserWithEmailAndPassword(
        email.trim(),
        password
      );
      await ensureUserDoc(cred.user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  // ========= phone =========
  const sendPhoneCode = async () => {
    const phoneE164 = phone.trim();
    if (!phoneE164.startsWith('+')) {
      Alert.alert(
        'Phone',
        'Введите номер в международном формате, например +9725...'
      );
      return;
    }
    try {
      setLoading(true);
      const confirmation = await authRN().signInWithPhoneNumber(phoneE164);
      setConfirm(confirmation);
      Alert.alert('SMS sent', 'Введите код из SMS');
    } catch (e: any) {
      Alert.alert('Phone auth', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const confirmPhoneCode = async () => {
    if (!confirm || !code.trim()) {
      Alert.alert('Phone', 'Сначала запросите код и введите его');
      return;
    }
    try {
      setLoading(true);
      const result = await confirm.confirm(code.trim());
      await ensureUserDoc(result.user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      Alert.alert('Invalid code', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  // ========= Google (через getTokens) =========
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 1) открываем нативный диалог входа
      const response = await GoogleSignin.signIn();

      // 2) корректно обрабатываем union-ответ
      if (isCancelledResponse(response)) return;
      if (!isSuccessResponse(response)) throw new Error('Google sign-in failed');

      // 3) берём токены отдельным вызовом
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('No Google idToken');

      // 4) Firebase credential
      const googleCredential = authRN.GoogleAuthProvider.credential(idToken);
      const { user } = await authRN().signInWithCredential(googleCredential);

      await ensureUserDoc(user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!/cancel/i.test(msg)) Alert.alert('Google Sign-In', msg);
    } finally {
      setLoading(false);
    }
  };

  // ========= Apple (iOS) =========
  const signInWithApple = async () => {
    try {
      setLoading(true);

      const rawNonce = await getSecureRandomHex(16);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const apple = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!apple.identityToken) throw new Error('No identityToken from Apple');

      const credential = authRN.AppleAuthProvider.credential(
        apple.identityToken,
        rawNonce
      );

      const { user } = await authRN().signInWithCredential(credential);
      await ensureUserDoc(user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!/canceled|cancelled/i.test(msg)) Alert.alert('Apple Sign-In', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      {/* email/пароль */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        inputMode="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterEmail} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Create with Email</Text>}
      </TouchableOpacity>

      {/* разделитель */}
      <Text style={styles.sep}>OR</Text>

      {/* телефон */}
      <TextInput
        style={styles.input}
        placeholder="Phone (+9725...)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {confirm ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="SMS Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={confirmPhoneCode} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Confirm Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.secondaryBtn} onPress={sendPhoneCode} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.secondaryText}>Send SMS Code</Text>}
        </TouchableOpacity>
      )}

      {/* разделитель */}
      <Text style={styles.sep}>OR</Text>

      {/* Google */}
      <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} disabled={loading}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Apple — только iOS, и только если доступно */}
      {appleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={{ width: '100%', height: 48, marginTop: 12 }}
          onPress={signInWithApple}
        />
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="Already have an account? Login" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
};

/** Проверяем доступность AppleAuth (iOS реальные устройства/симулятор с iOS13+) */
function useAppleAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (Platform.OS !== 'ios') return;
      try {
        const ok = await AppleAuthentication.isAvailableAsync();
        if (mounted) setAvailable(ok);
      } catch {
        if (mounted) setAvailable(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return available;
}

/** Генерируем криптографически стойкую HEX-строку (для rawNonce) */
async function getSecureRandomHex(lenBytes = 16): Promise<string> {
  const bytes = await Random.getRandomBytesAsync(lenBytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default RegisterScreen;
