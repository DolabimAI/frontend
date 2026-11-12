import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Button, Dropdown, DropdownOption } from '@/components/ui';

const CITIES: DropdownOption[] = [
  { id: 6, value: 'ankara', displayName: 'Ankara' },
  { id: 34, value: 'istanbul', displayName: 'İstanbul' },
  { id: 35, value: 'izmir', displayName: 'İzmir' },
];

const DISTRICTS_BY_CITY: Record<string, DropdownOption[]> = {
  ankara: [
    { id: 1, value: 'cankaya', displayName: 'Çankaya' },
    { id: 2, value: 'yenimahalle', displayName: 'Yenimahalle' },
  ],
  istanbul: [
    { id: 3, value: 'kadikoy', displayName: 'Kadıköy' },
    { id: 4, value: 'atasehir', displayName: 'Ataşehir' },
  ],
  izmir: [
    { id: 5, value: 'bornova', displayName: 'Bornova' },
    { id: 6, value: 'odemis', displayName: 'Ödemiş' },
  ],
};

const TIMES_OF_DAY = [
  { value: 'sabah', label: 'Sabah', endHour: 10 },
  { value: 'ogle', label: 'Öğle', endHour: 16 },
  { value: 'aksam', label: 'Akşam', endHour: 20 },
  { value: 'gece', label: 'Gece', endHour: 23 },
];

const EVENTS = [
  { value: 'gunluk', label: 'Günlük' },
  { value: 'is', label: 'İş' },
  { value: 'spor', label: 'Spor' },
  { value: 'davet', label: 'Davet' },
];

// Bugün ve sonraki 6 günü oluşturur
function getNextSevenDays() {
  const days = [];
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const label =
      i === 0
        ? 'Bugün'
        : i === 1
        ? 'Yarın'
        : `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const shortSummary = `${d.getDate()} ${monthNames[d.getMonth()]} (${dayNames[d.getDay()]})`;
    days.push({
      index: i,
      dateStr: d.toISOString().split('T')[0],
      label,
      shortSummary,
    });
  }
  return days;
}

// Güncel saate göre varsayılan vakti bulur
function getDefaultTimeOfDay(currentHour: number) {
  if (currentHour < 11) return 'sabah';
  if (currentHour < 17) return 'ogle';
  if (currentHour < 21) return 'aksam';
  return 'gece';
}

export default function KombinFormScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const currentHour = new Date().getHours();
  const daysList = getNextSevenDays();

  // Yer ve gün her açılışta varsayılana döner
  const [selectedCity, setSelectedCity] = useState<string | null>('ankara');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('cankaya');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>(getDefaultTimeOfDay(currentHour));

  // Etkinlik ve aksesuar telefonda hatırlanır
  const [selectedEvent, setSelectedEvent] = useState<string>('gunluk');
  const [includeAccessory, setIncludeAccessory] = useState<boolean>(true);

  useEffect(() => {
    async function loadSavedPreferences() {
      try {
        const savedEvent = await AsyncStorage.getItem('pref_event');
        const savedAcc = await AsyncStorage.getItem('pref_accessory');
        if (savedEvent) setSelectedEvent(savedEvent);
        if (savedAcc !== null) setIncludeAccessory(savedAcc === 'true');
      } catch {
        // Hata olursa varsayılanlar kalır
      }
    }
    loadSavedPreferences();
  }, []);

  const handleEventChange = async (val: string) => {
    setSelectedEvent(val);
    await AsyncStorage.setItem('pref_event', val);
  };

  const handleAccessoryChange = async (val: boolean) => {
    setIncludeAccessory(val);
    await AsyncStorage.setItem('pref_accessory', String(val));
  };

  const isTimeDisabled = (endHour: number) => {
    if (selectedDayIndex !== 0) return false; // Bugün değilse hiçbir vakit pasif değil
    return currentHour > endHour;
  };

  const handleDayChange = (index: number) => {
    setSelectedDayIndex(index);
    if (index === 0) {
      const selectedObj = TIMES_OF_DAY.find((t) => t.value === selectedTime);
      if (selectedObj && currentHour > selectedObj.endHour) {
        setSelectedTime(getDefaultTimeOfDay(currentHour));
      }
    }
  };

  const cityObj = CITIES.find((c) => c.value === selectedCity);
  const districtList = selectedCity ? DISTRICTS_BY_CITY[selectedCity] || [] : [];
  const districtObj = districtList.find((d) => d.value === selectedDistrict);
  const timeObj = TIMES_OF_DAY.find((t) => t.value === selectedTime);

  // Mock hava özeti (Zehra C4 bitince gerçek API'den gelecek)
  const mockTemp = selectedTime === 'gece' ? 4 : selectedTime === 'sabah' ? 7 : 12;
  const mockWeatherDesc = selectedCity === 'izmir' ? 'Güneşli' : 'Kapalı';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Üst Geri Butonu ve Başlık */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Geri</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text }]}>Nasıl bir kombin?</Text>

        {/* 1. Nerede? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Nerede?</Text>
        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Dropdown
              label="İl"
              placeholder="İl seç"
              options={CITIES}
              selectedValue={selectedCity}
              onSelect={(opt) => {
                setSelectedCity(opt.value);
                setSelectedDistrict(null);
              }}
              searchable
            />
          </View>
          <View style={styles.halfCol}>
            <Dropdown
              label="İlçe (isteğe bağlı)"
              placeholder="İlçe seç"
              options={districtList}
              selectedValue={selectedDistrict}
              onSelect={(opt) => setSelectedDistrict(opt.value)}
              disabled={!selectedCity}
              searchable
            />
          </View>
        </View>

        {/* 2. Ne zaman? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Ne zaman?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {daysList.map((day) => {
            const active = selectedDayIndex === day.index;
            return (
              <TouchableOpacity
                key={day.index}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.tint : theme.card,
                    borderColor: active ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => handleDayChange(day.index)}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : theme.text }]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. Günün hangi vakti? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Günün hangi vakti?</Text>
        <View style={styles.chipRow}>
          {TIMES_OF_DAY.map((t) => {
            const active = selectedTime === t.value;
            const disabled = isTimeDisabled(t.endHour);
            return (
              <TouchableOpacity
                key={t.value}
                disabled={disabled}
                style={[
                  styles.chipEqual,
                  {
                    backgroundColor: disabled
                      ? theme.border + '60'
                      : active
                      ? theme.tint
                      : theme.card,
                    borderColor: active && !disabled ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => setSelectedTime(t.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: disabled
                        ? theme.textSecondary
                        : active
                        ? '#FFF'
                        : theme.text,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Nereye? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Nereye?</Text>
        <View style={styles.chipRow}>
          {EVENTS.map((ev) => {
            const active = selectedEvent === ev.value;
            return (
              <TouchableOpacity
                key={ev.value}
                style={[
                  styles.chipEqual,
                  {
                    backgroundColor: active ? theme.tint : theme.card,
                    borderColor: active ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => handleEventChange(ev.value)}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : theme.text }]}>
                  {ev.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 5. Aksesuar olsun mu? */}
        <View
          style={[
            styles.accessoryRow,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.accessoryText, { color: theme.text }]}>
            Aksesuar olsun mu?
          </Text>
          <Switch
            value={includeAccessory}
            onValueChange={handleAccessoryChange}
            trackColor={{ false: theme.border, true: theme.tint }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Hava Özeti Kutusu */}
        {selectedCity ? (
          <View style={styles.weatherSummaryBox}>
            <Ionicons name="cloud-outline" size={22} color={theme.tint} />
            <View style={styles.weatherSummaryTexts}>
              <Text style={[styles.weatherSummaryTop, { color: theme.textSecondary }]}>
                {cityObj?.displayName}
                {districtObj ? ` · ${districtObj.displayName}` : ''} ·{' '}
                {daysList[selectedDayIndex].shortSummary} · {timeObj?.label.toLowerCase()}
              </Text>
              <Text style={[styles.weatherSummaryBottom, { color: theme.text }]}>
                Hissedilen {mockTemp}° · {mockWeatherDesc}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Gönder Butonu (İl seçilmeden pasif) */}
        <Button
          title="Kombin öner"
          disabled={!selectedCity}
          onPress={() => router.push('/karsilastirma-mock')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 18, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backText: { fontSize: 15, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 14 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCol: { flex: 0.485 },
  chipScroll: { flexDirection: 'row', marginBottom: 4 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipEqual: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  accessoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 12,
  },
  accessoryText: { fontSize: 15, fontWeight: '500' },
  weatherSummaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EFEA',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  weatherSummaryTexts: { marginLeft: 10, flex: 1 },
  weatherSummaryTop: { fontSize: 12 },
  weatherSummaryBottom: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});