// src/screens/Auth/EmailVerificationScreen.tsx
import { getAuth
  , sendEmailVerification, signOut } from '@react-native-firebase/auth';
import { CommonActions, } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoadingButton from 'components/LoadingButton';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles/EmailVerificationScreen.styles';

type EmailVerificationScreenProps = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const checkVerification = async () => {
    try {
      setLoading(true);
      const authInstance = getAuth();

      if (!user) {
        Alert.alert('Error', 'User not found. Please sign in again.');
        return;
      }

      await user.reload();
      const updatedUser = authInstance.currentUser;
      const verified = updatedUser?.emailVerified ?? false;

      if (
        verified 
        && 
        updatedUser?.uid
      ) {
        // ✅ Правильный reset с вложенным state для Main (nested navigator)
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: 'Main',
                state: {
                  index: 0,
                  routes: [
                    {
                      name: 'UserProfile',
                      params: { userId: updatedUser.uid },
                    },
                  ],
                },
              },
            ],
          })
        );
        return;
      }

      Alert.alert('Not Verified', 'Email is still not verified.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    try {
      setLoading(true);
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        Alert.alert('Sent', 'Verification email resent.');
      } else {
        Alert.alert('Error', 'User not found. Please sign in again.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const authInstance = getAuth();
      await signOut(authInstance);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to sign out.');
    } finally {
      setLoading(false);
    }
  };

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
