import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label: string;
  value: string | number | null | undefined;
  onPress?: () => void;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  maxChars?: number; // по умолчанию 8
};

const truncate = (v: string, max = 8) =>
  v.length > max ? v.slice(0, max) + '...' : v;

export default function InfoRow({
  label,
  value,
  onPress,
  iconName,
  maxChars = 18,
}: Props) {
  const raw = value == null ? '—' : String(value);
  const display = truncate(raw.trim() || '—', maxChars);

  const Content = (
    <View style={s.valueWrap}>
      {iconName ? <Ionicons name={iconName} size={18} color="#6b7280" /> : null}
      <Text
        style={s.value}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {display}
      </Text>
    </View>
  );

  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {Content}
        </TouchableOpacity>
      ) : (
        Content
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'column',       // метка сверху, значение снизу
    alignItems: 'flex-start',      // всё влево
    paddingVertical: 8,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'left',
  },
});
