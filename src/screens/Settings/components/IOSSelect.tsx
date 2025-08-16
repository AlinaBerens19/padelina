// path: src/screens/SettingsScreen/components/IOSSelect.tsx
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ActionSheetIOS, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../../../styles/SettingsScreen.styles';

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
  loading?: boolean;
};

export const IOSSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder,
  loading,
}) => {
  const label = value || (loading ? 'Loading...' : placeholder);

  const openSheet = () => {
    const cancelIndex = options.length;
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options, 'Cancel'],
        cancelButtonIndex: cancelIndex,
        title: placeholder,
      },
      (buttonIndex) => {
        if (buttonIndex === cancelIndex) return;
        const picked = String(options[buttonIndex]);
        onChange(picked);
      }
    );
  };

  return (
    <TouchableOpacity
      onPress={openSheet}
      activeOpacity={0.8}
      style={styles.inputButton}
    >
      <Text style={value ? styles.inputButtonText : styles.inputButtonPlaceholder}>
        {label}
      </Text>
      <MaterialCommunityIcons name="chevron-down" size={22} />
    </TouchableOpacity>
  );
};
