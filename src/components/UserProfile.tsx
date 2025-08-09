import React from 'react';
import Card from './ui/Card';
import InfoRow from './ui/InfoRow';

type Props = {
  level?: number | null;
  favouriteSport?: string | null;
  location?: string | null;
  phone?: string | null;
  address?: string | null;
  updatedAt?: any;
  onPhonePress?: (phone: string) => void;
};

const safeText = (v?: string | null) => (v && v.trim() ? v.trim() : '—');
const toUpdated = (v: any) =>
  v?.toDate?.() ? v.toDate().toLocaleString() : typeof v === 'string' ? v : '—';

export default function UserProfile({
  level,
  favouriteSport,
  location,
  phone,
  address,
  updatedAt,
  onPhonePress,
}: Props) {
  const phoneText = safeText(phone);
  const handlePhonePress = () => {
    if (phone && onPhonePress) onPhonePress(phone);
  };

  return (
    <Card title="Profile Information">
      <InfoRow
        label="Level"
        value={String(typeof level === 'number' ? level : 0)}
        iconName="trophy-outline"          // ← иконка для уровня
      />
      <InfoRow
        label="Favourite Sport"
        value={safeText(favouriteSport)}
        iconName="tennisball-outline"      // ← иконка для вида спорта
        // maxChars={8} // опционально, если нужно обрезать
      />
      <InfoRow label="Location" value={safeText(location)} iconName="location-outline" />
      <InfoRow
        label="Phone"
        value={phoneText}
        onPress={phone ? handlePhonePress : undefined}
        iconName="call-outline"
      />
      <InfoRow label="Address" value={safeText(address)} iconName="home-outline" />
      <InfoRow label="Updated" value={toUpdated(updatedAt)} iconName="time-outline" />
    </Card>
  );
}
