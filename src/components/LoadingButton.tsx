import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  title: string;
  loading?: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const LoadingButton: React.FC<Props> = ({ title, loading, onPress, disabled, style, textStyle }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading || disabled}
    style={[style, disabled ? { opacity: 0.6 } : null]}
  >
    {loading ? <ActivityIndicator /> : <Text style={textStyle}>{title}</Text>}
  </TouchableOpacity>
);

export default LoadingButton;
