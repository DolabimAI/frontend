import React from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Button, Dropdown, ErrorBox } from '@/components/ui';
import { useKombinForm } from '@/hooks/use-kombin-form';

/**
 * Kombin formu — görünüm önceki sürümle aynı; veriler gerçek uçlardan (B7, plan C.5).
 * Veri ve kurallar src/hooks/use-kombin-form.ts'te.
 */
export default function KombinFormScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const form = useKombinForm();

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
        {form.citiesError ? (
          <View>
            <ErrorBox message={form.citiesError} />
            <Button title="Tekrar dene" onPress={form.retryCities} />
          </View>
        ) : (
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Dropdown
                label="İl"
                placeholder={form.cities ? 'İl seç' : 'Yükleniyor…'}
                options={form.cities ?? []}
                selectedValue={form.cityId}
                onSelect={form.selectCity}
                disabled={!form.cities}
                searchable
              />
            </View>
            <View style={styles.halfCol}>
              <Dropdown
                label="İlçe (isteğe bağlı)"
                placeholder={form.districtsLoading ? 'Yükleniyor…' : 'İlçe seç'}
                options={form.districts}
                selectedValue={form.districtId}
                onSelect={form.selectDistrict}
                disabled={!form.cityId || form.districtsLoading}
                searchable
              />
            </View>
          </View>
        )}

        {/* 2. Ne zaman? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Ne zaman?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {form.days.map((day) => {
            const active = form.dayIndex === day.index;
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
                onPress={() => form.selectDay(day.index)}
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
          {form.timesOfDay.map((t) => {
            const active = form.timeOfDayId === t.id;
            const disabled = form.isTimeDisabled(t.endHour);
            return (
              <TouchableOpacity
                key={t.id}
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
                onPress={() => form.selectTimeOfDay(t.id)}
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
                  {t.displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Nereye? */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Nereye?</Text>
        <View style={styles.chipRow}>
          {form.eventStyles.map((ev) => {
            const active = form.eventCode === ev.value;
            return (
              <TouchableOpacity
                key={ev.id}
                style={[
                  styles.chipEqual,
                  {
                    backgroundColor: active ? theme.tint : theme.card,
                    borderColor: active ? theme.tint : theme.border,
                  },
                ]}
                onPress={() => form.selectEvent(ev.value)}
              >
                <Text style={[styles.chipText, { color: active ? '#FFF' : theme.text }]}>
                  {ev.displayName}
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
            value={form.includeAccessory}
            onValueChange={form.changeAccessory}
            trackColor={{ false: theme.border, true: theme.tint }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Hava Özeti Kutusu (il seçilince) */}
        {form.city && form.weather ? (
          <View style={[styles.weatherSummaryBox, { backgroundColor: theme.backgroundSelected }]}>
            <Ionicons name="cloud-outline" size={22} color={theme.tint} />
            <View style={styles.weatherSummaryTexts}>
              <Text style={[styles.weatherSummaryTop, { color: theme.textSecondary }]}>
                {form.city.displayName}
                {form.district ? ` · ${form.district.displayName}` : ''} ·{' '}
                {form.days[form.dayIndex].shortSummary}
                {form.timeOfDay ? ` · ${form.timeOfDay.displayName.toLocaleLowerCase('tr-TR')}` : ''}
              </Text>
              <Text style={[styles.weatherSummaryBottom, { color: theme.text }]}>
                {form.weather.status === 'ok'
                  ? `Hissedilen ${form.weather.feelsLike}° · ${form.weather.condition}`
                  : form.weather.status === 'loading'
                    ? 'Hava alınıyor…'
                    : 'Hava durumu alınamadı, biraz sonra tekrar dene.'}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Gönder Butonu (il seçilmeden ya da dolap eksikken pasif) */}
        <Button
          title="Kombin öner"
          disabled={!form.canSubmit}
          onPress={() => router.push({ pathname: '/karsilastirma-mock', params: form.submitParams })}
        />
        {form.wardrobeReady === false ? (
          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            Kombin önerebilmemiz için önce dolabını tamamla.
          </Text>
        ) : null}
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
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  weatherSummaryTexts: { marginLeft: 10, flex: 1 },
  weatherSummaryTop: { fontSize: 12 },
  weatherSummaryBottom: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 10 },
});