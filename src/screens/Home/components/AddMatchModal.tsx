// path: src/screens/Welcome/components/AddMatchModal.tsx
// Полный компонент модалки (сохранение готовых данных; режим Singles/Doubles; SafeArea в поиске клуба)

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateMatchInput } from 'services/firebase/matches';
import { styles } from '../WelcomeScreen.styles';

// Dummy список клубов (заменишь на данные из БД)
const CLUBS = [
  { id: 'hadera-padel', name: 'Hadera Padel Club', sport: 'Padel' },
  { id: 'herzliya-padel', name: 'Herzliya Padel Club', sport: 'Padel' },
  { id: 'netanya-tennis', name: 'Netanya Tennis Center', sport: 'Tennis' },
  { id: 'raanana-tennis', name: 'Raanana Tennis Club', sport: 'Tennis' },
  { id: 'telaviv-padel', name: 'Tel Aviv Padel Arena', sport: 'Padel' },
  { id: 'jerusalem-tennis', name: 'Jerusalem Tennis Club', sport: 'Tennis' },
  { id: 'beer-sheva-padel', name: 'Beer Sheva Padel Courts', sport: 'Padel' },
  { id: 'haifa-tennis', name: 'Haifa Tennis Club', sport: 'Tennis' },
  { id: 'modiin-padel', name: 'Modiin Padel Center', sport: 'Padel' },
  { id: 'eilat-tennis', name: 'Eilat Tennis Center', sport: 'Tennis' },
];

// создаём список дат на 31 день
function buildDateOptions(): { label: string; value: string }[] {
  const opts: { label: string; value: string }[] = [];
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();
  for (let i = 0; i <= 30; i++) {
    const d = new Date(today);
    d.setHours(0,0,0,0);
    d.setDate(today.getDate() + i);
    const label =
      `${weekday[d.getDay()]} · ${d.getDate()} ${month[d.getMonth()]}` +
      (i===0 ? ' (Today)' : i===1 ? ' (Tomorrow)' : '');
    opts.push({ label, value: d.toISOString() });
  }
  return opts;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMatchInput) => void; // сохраняем через сервис
};

export default function AddMatchModal({ visible, onClose, onSubmit }: Props) {
  // базовые поля
  const [clubId, setClubId] = useState<string>(CLUBS[0].id);
  const [price, setPrice] = useState<string>(''); // может быть пустым
  const [mode, setMode] = useState<'Singles' | 'Doubles'>('Doubles');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [booked, setBooked] = useState<boolean>(false);

  // модалка выбора клуба
  const [clubPickerVisible, setClubPickerVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedClub = useMemo(
    () => CLUBS.find(c => c.id === clubId) ?? CLUBS[0],
    [clubId]
  );

  // фильтр клубов по поиску
  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CLUBS;
    return CLUBS.filter(c =>
      c.name.toLowerCase().includes(q) || c.sport.toLowerCase().includes(q)
    );
  }, [search]);

  // дата/время
  const dateOptions = useMemo(() => buildDateOptions(), []);
  const [dateIndex, setDateIndex] = useState<number>(0);
  const [hour, setHour] = useState<number>(19);
  const [minute, setMinute] = useState<number>(0);

  // итоговая дата
  const computedDate = useMemo(() => {
    const baseISO = dateOptions[dateIndex]?.value;
    const base = baseISO ? new Date(baseISO) : new Date();
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  }, [dateOptions, dateIndex, hour, minute]);

  // ✅ Парсим цену: пустая строка = 0, поддержка запятой
  const priceNumber = useMemo(() => {
    if (price.trim() === '') return 0;
    const norm = price.replace(',', '.').replace(/[^\d.]/g, '');
    const n = Number.parseFloat(norm);
    return Number.isFinite(n) ? n : 0;
  }, [price]);

  // ✅ Делаем кнопку активной (все поля имеют дефолты)
  const isValid = true;

  // выбор режима игры
  const onPickMode = (m: 'Singles' | 'Doubles') => {
    setMode(m);
    setMaxPlayers(m === 'Singles' ? 2 : 4);
  };

  // отправка наверх
  const handleSubmit = () => {
    const club = selectedClub;
    onSubmit({
      location: club.name,
      sport: club.sport as CreateMatchInput['sport'],
      price: priceNumber,            // всегда число
      time: computedDate,
      duration,
      booked,
      imageUrl: imageUrl?.trim() || null,
      maxPlayers,
      singles: mode === 'Singles',
      // поля, которых нет в UI
      address: null,
      level: null,
      phone: null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
          style={styles.kav}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Add Match</Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
              {/* Club */}
              <Text style={styles.label}>Club</Text>
              <TouchableOpacity
                style={styles.clubField}
                onPress={() => setClubPickerVisible(true)}
              >
                <Text style={styles.clubFieldText}>{selectedClub.name}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* When */}
              <Text style={styles.label}>When</Text>

              <View style={[styles.row, { marginBottom: 6 }]}>
                <View style={styles.rowLeft}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#325df6" />
                  <Text style={styles.dateSummary}>{dateOptions[dateIndex]?.label}</Text>
                </View>
              </View>

              {/* Date */}
              <View style={[styles.pickerBox, styles.pickerTall]}>
                <Picker
                  selectedValue={dateIndex}
                  onValueChange={(v) => setDateIndex(Number(v))}
                  itemStyle={styles.pickerItem}
                >
                  {dateOptions.map((opt, idx) => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={idx}
                      color="#111827"
                    />
                  ))}
                </Picker>
              </View>

              {/* Time */}
              <View style={styles.row}>
                <View style={[styles.pickerBox, styles.pickerTall, styles.rowItem]}>
                  <Picker
                    selectedValue={hour}
                    onValueChange={(v) => setHour(Number(v))}
                    itemStyle={styles.pickerItem}
                  >
                    {Array.from({ length: 24 }, (_, h) => (
                      <Picker.Item
                        key={h}
                        label={`${h.toString().padStart(2, '0')}`}
                        value={h}
                        color="#111827"
                      />
                    ))}
                  </Picker>
                </View>

                <View style={[styles.pickerBox, styles.pickerTall, styles.rowItem]}>
                  <Picker
                    selectedValue={minute}
                    onValueChange={(v) => setMinute(Number(v))}
                    itemStyle={styles.pickerItem}
                  >
                    {[0, 30].map((m) => (
                      <Picker.Item
                        key={m}
                        label={m.toString().padStart(2, '0')}
                        value={m}
                        color="#111827"
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Duration */}
              <Text style={styles.label}>Duration</Text>
              <View style={styles.checkboxRow}>
                {[60, 90, 120].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDuration(d)}
                    style={[
                      styles.checkboxOption,
                      duration === d && styles.checkboxOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkboxText,
                        duration === d && styles.checkboxTextActive,
                      ]}
                    >
                      {d} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Booked court */}
              <View style={styles.row}>
                <Text style={styles.labelInline}>Court already booked?</Text>
                <Switch value={booked} onValueChange={setBooked} />
              </View>

              {/* Price */}
              <Text style={styles.label}>Price</Text>
              <TextInput
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'} // удобнее вводить , и .
                style={styles.input}
              />

              {/* Game Mode: Singles / Doubles */}
              <Text style={styles.label}>Game Mode</Text>
              <View style={styles.checkboxRow}>
                {(['Singles', 'Doubles'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => onPickMode(m)}
                    style={[
                      styles.checkboxOption,
                      (mode === m) && styles.checkboxOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkboxText,
                        (mode === m) && styles.checkboxTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]}>
                <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isValid} // сейчас всегда true
                style={[styles.btn, styles.btnPrimary, !isValid && styles.btnDisabled]}
              >
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Club picker modal */}
      <Modal
        visible={clubPickerVisible}
        animationType="slide"
        onRequestClose={() => setClubPickerVisible(false)}
      >
        <SafeAreaView style={styles.fullModalContainer} edges={['top', 'left', 'right']}>
          <View style={styles.fullModalHeader}>
            <Text style={styles.fullModalTitle}>Choose Club</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or sport…"
              style={styles.searchBox}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredClubs}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => {
                  setClubId(item.id);
                  setClubPickerVisible(false);
                }}
              >
                <Text style={styles.listItemText}>
                  {item.name} · {item.sport}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={() => setClubPickerVisible(false)}
              style={[styles.btn, styles.btnGhost]}
            >
              <Text style={[styles.btnText, styles.btnGhostText]}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}
