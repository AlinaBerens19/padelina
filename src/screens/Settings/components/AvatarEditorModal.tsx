// path: src/screens/SettingsScreen/components/AvatarEditorModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../SettingsScreen.styles';

function isValidHttpUrl(str: string) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

type Props = {
  visible: boolean;
  initialUrl: string;
  onClose: () => void;
  onConfirm: (url: string) => void;
  onClear: () => void;
};

export const AvatarEditorModal: React.FC<Props> = ({
  visible,
  initialUrl,
  onClose,
  onConfirm,
  onClear,
}) => {
  const [draft, setDraft] = useState(initialUrl || '');

  useEffect(() => {
    setDraft(initialUrl || '');
  }, [initialUrl, visible]);

  const confirm = () => {
    const url = draft.trim();
    if (!url) {
      onConfirm('');
      return;
    }
    if (!isValidHttpUrl(url)) {
      Alert.alert('Invalid URL', 'Введите корректную ссылку (http/https).');
      return;
    }
    onConfirm(url);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalCenter}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Change photo</Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://example.com/photo.jpg"
            inputMode="url"
          />

          {isValidHttpUrl(draft.trim()) ? (
            <Image source={{ uri: draft.trim() }} style={styles.modalPreview} />
          ) : null}

          <View style={styles.modalRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalBtn, styles.modalBtnSecondary]}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={confirm} style={styles.modalBtn} activeOpacity={0.8}>
              <Text style={styles.modalBtnText}>Use URL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClear}
              style={[styles.modalBtn, styles.modalBtnDanger]}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
