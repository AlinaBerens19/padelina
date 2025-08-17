// src/screens/Auth/EmailVerificationScreen.tsx
import auth from '@react-native-firebase/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoadingButton from 'components/LoadingButton';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles/EmailVerificationScreen.styles';

type EmailVerificationScreenProps = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const checkVerification = async () => {
    try {
      setLoading(true);
      await auth().currentUser?.reload();
      const user = auth().currentUser;
      const verified = user?.emailVerified ?? false;
      setEmailVerified(verified);
      if (verified) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              params: {
                screen: 'UserProfile',
                params: {
                  userId: user?.uid,
                },
              },
            },
          ],
        });
      } else {
        Alert.alert('Not Verified', 'Email is still not verified.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    try {
      setLoading(true);
      await auth().currentUser?.sendEmailVerification();
      Alert.alert('Sent', 'Verification email resent.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await auth().signOut();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user?.emailVerified) {
        if (user?.uid) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                params: {
                  screen: 'UserProfile',
                  params: {
                    userId: user.uid,
                  },
                },
              },
            ],
          });
        }
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.text}>Please check your email and verify your address to continue.</Text>

      <LoadingButton
        title="Check Verification"
        onPress={checkVerification}
        loading={loading}
        style={styles.primaryBtn}
        textStyle={styles.primaryText}
      />

      <LoadingButton
        title="Resend Email"
        onPress={resendEmail}
        loading={loading}
        style={styles.secondaryBtn}
        textStyle={styles.secondaryText}
      />

      <TouchableOpacity onPress={handleSignOut} style={{ marginTop: 20 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmailVerificationScreen;