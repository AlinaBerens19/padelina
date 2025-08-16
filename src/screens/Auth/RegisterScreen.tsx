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
import authRN, {
  AppleAuthProvider,
  FirebaseAuthTypes,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Google Sign-In
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

// Apple Sign-In (Expo)
import * as AppleAuthentication from 'expo-apple-authentication';

// 🔐 SHA-256 без expo-crypto
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

import { styles } from './styles/RegisterScreen.styles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const appleAvailable = useAppleAvailable();

  const ensureUserDoc = async (user: FirebaseAuthTypes.User) => {
    try {
      await firestore().collection('users').doc(user.uid).set({
        id: user.uid,
        email: user.email ?? null,
        name: user.displayName ?? '',
        phone: user.phoneNumber ?? null,
      }, { merge: true });
    } catch (e) {
      console.warn('ensureUserDoc error', e);
    }
  };

  const handleRegisterEmail = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    try {
      setLoading(true);
      const cred = await authRN().createUserWithEmailAndPassword(email.trim(), password);
      await ensureUserDoc(cred.user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    const phoneE164 = phone.trim();
    if (!phoneE164.startsWith('+')) {
      Alert.alert('Phone', 'Введите номер в международном формате, например +9725...');
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) return;
      if (!isSuccessResponse(response)) throw new Error('Google sign-in failed');

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('No Google idToken');

      const credential = GoogleAuthProvider.credential(idToken);
      const { user } = await authRN().signInWithCredential(credential);

      await ensureUserDoc(user);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!/cancel/i.test(msg)) Alert.alert('Google Sign-In', msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);

      const rawNonce = getSecureRandomHex(16);
      const hashedNonce = sha256Hex(rawNonce);

      const apple = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!apple.identityToken) throw new Error('No identityToken from Apple');

      const credential = AppleAuthProvider.credential(
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

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" inputMode="email" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.primaryBtn} onPress={handleRegisterEmail} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Create with Email</Text>}
      </TouchableOpacity>

      <Text style={styles.sep}>OR</Text>

      <TextInput style={styles.input} placeholder="Phone (+9725...)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {confirm ? (
        <>
          <TextInput style={styles.input} placeholder="SMS Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
          <TouchableOpacity style={styles.primaryBtn} onPress={confirmPhoneCode} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Confirm Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.secondaryBtn} onPress={sendPhoneCode} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.secondaryText}>Send SMS Code</Text>}
        </TouchableOpacity>
      )}

      <Text style={styles.sep}>OR</Text>

      <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} disabled={loading}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

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

function getSecureRandomHex(lenBytes = 16): string {
  const bytes = new Uint8Array(lenBytes);
  // @ts-ignore
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sha256Hex(s: string): string {
  return bytesToHex(sha256(utf8ToBytes(s)));
}

export default RegisterScreen;
