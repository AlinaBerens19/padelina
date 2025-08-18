import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Button,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Yup from 'yup';

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';
import {
  AppleAuthProvider,
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from '@react-native-firebase/auth';
import { doc, setDoc } from '@react-native-firebase/firestore';
import {
  GoogleSignin,
  isCancelledResponse,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import LoadingButton from 'components/LoadingButton';
import * as AppleAuthentication from 'expo-apple-authentication';
import 'react-native-get-random-values';

import { auth, db } from 'services/firebase/init';
import { navigationRef } from '../../navigation/navigationRef';
import type { RootStackParamList } from '../../navigation/types';
import { styles } from './styles/RegisterScreen.styles';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password too short').required('Password is required'),
});

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailErrorAnim] = useState(new Animated.Value(0));

  const appleAvailable = useAppleAvailable();

  const showError = (title: string, message?: string) => {
    Alert.alert(title, message ?? 'Some error occurred');
  };

  const ensureUserDoc = async (user: FirebaseAuthTypes.User) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
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

  const handlePostRegistration = async (user: FirebaseAuthTypes.User) => {
    await ensureUserDoc(user);

    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });

    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'UserProfile',
          params: { userId: user.uid },
        });
      }
    }, 0);
  };

  const handleRegisterEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await handlePostRegistration(cred.user);
    } catch (e: any) {
      showError('Registration Error', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    const phoneE164 = phone.trim();
    if (!/^\+\d{9,15}$/.test(phoneE164)) {
      showError('Invalid Phone', 'Enter phone number in international format (e.g. +9725...)');
      return;
    }
    try {
      setLoading(true);
      const confirmation = await signInWithPhoneNumber(auth, phoneE164);
      setConfirm(confirmation);
      showError('Phone code sent', 'Please check your SMS for the verification code');
    } catch (e: any) {
      showError('Phone Verification Error', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const confirmPhoneCode = async () => {
    if (!confirm || !code.trim()) {
      showError('Error', 'Please send the code first or enter a valid code');
      return;
    }
    try {
      setLoading(true);
      const result = await confirm.confirm(code.trim());
      await handlePostRegistration(result.user);
    } catch (e: any) {
      showError('Code Confirmation Error', e?.message ?? String(e));
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
      const { user } = await signInWithCredential(auth, credential);
      await handlePostRegistration(user);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!/cancel/i.test(msg)) showError('Google Sign-In', msg);
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

      const { user } = await signInWithCredential(auth, credential);
      await handlePostRegistration(user);
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (!/canceled|cancelled/i.test(msg)) showError('Apple Sign-In', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={RegisterSchema}
        onSubmit={({ email, password }) => handleRegisterEmail(email, password)}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={values.email}
              onChangeText={(text) => {
                handleChange('email')(text);
                Animated.timing(emailErrorAnim, {
                  toValue: errors.email && touched.email ? 1 : 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start();
              }}
              onBlur={handleBlur('email')}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Animated.View style={{ height: emailErrorAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }}>
              {touched.email && errors.email && (
                <Text style={{ color: 'red', fontSize: 12 }}>{errors.email}</Text>
              )}
            </Animated.View>

            <View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!passwordVisible}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              <TouchableOpacity onPress={() => setPasswordVisible((v) => !v)}>
                <Text style={{ color: 'blue', textAlign: 'right', marginRight: 8 }}>
                  {passwordVisible ? 'Hide' : 'Show'} Password
                </Text>
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={{ color: 'red' }}>{errors.password}</Text>}

            <LoadingButton
              title="Create with Email"
              loading={loading}
              onPress={handleSubmit as () => void}
              style={styles.primaryBtn}
              textStyle={styles.primaryText}
            />
          </>
        )}
      </Formik>

      <Text style={styles.sep}>OR</Text>

      <TextInput style={styles.input} placeholder="Phone (+9725...)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {confirm ? (
        <>
          <TextInput style={styles.input} placeholder="SMS Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
          <LoadingButton
            title="Confirm Code"
            loading={loading}
            onPress={confirmPhoneCode}
            style={styles.primaryBtn}
            textStyle={styles.primaryText}
          />
        </>
      ) : (
        <LoadingButton
          title="Send SMS Code"
          loading={loading}
          onPress={sendPhoneCode}
          style={styles.secondaryBtn}
          textStyle={styles.secondaryText}
        />
      )}

      <Text style={styles.sep}>OR</Text>

      <LoadingButton
        title="Continue with Google"
        loading={loading}
        onPress={signInWithGoogle}
        style={styles.googleBtn}
        textStyle={styles.googleText}
      />

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
