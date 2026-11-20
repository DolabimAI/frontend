import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import OutfitTile from '@/components/OutfitTile';
import { Button, Card, ErrorBox, Loading } from '@/components/ui';
import { Colors, Radius, Type } from '@/constants/theme';
import { useLookups } from '@/context/LookupsContext';
import { useComparison } from '@/hooks/use-comparison';
import type { MockVariant } from '@/mocks/comparison';
import { USE_MOCK } from '@/services/comparisons';
import type { OutfitItem, SelectResponse, SessionRequest } from '@/types/api';
import { formatShortDate } from '@/utils/date';

type FormParams = {
  cityId?: string;
  districtId?: string;
  date?: string;
  timeOfDayId?: string;
  eventStyleId?: string;
  eventStyle?: string;
  includeAccessories?: string;
  placeName?: string;
};

const MOCK_VARIANTS: { value: MockVariant; label: string }[] = [
  { value: 'iki_kart', label: 'İki kart' },
  { value: 'tek_kart', label: 'Tek kart' },
  { value: 'aday_yok', label: 'Aday yok' },
];

/**
 * Karşılaştırma (B8, plan C.8) — şimdilik mock'la (C5/C6 25–26 Kasım).
 * Üstte formdan gelen bağlam ve hava, altta iki kart yan yana; kartlarda yöntem adı ya da açıklama yok,
 * tepki yalnızca düğmeyle ("Bunu seç", "İkisi de olmaz").
 */
export default function KarsilastirmaScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const lookups = useLookups();
  const params = useLocalSearchParams<FormParams>();
  const [variant, setVariant] = useState<MockVariant>('iki_kart');

  // Formun değerlerinden oturum isteği (eksikse istek atılmaz). Hook isteği içeriğine göre karşılaştırır.
  const request: SessionRequest | null =
    params.cityId && params.date && params.timeOfDayId && params.eventStyleId
      ? {
          cityId: Number(params.cityId),
          districtId: params.districtId ? Number(params.districtId) : null,
          date: params.date,
          timeOfDayId: Number(params.timeOfDayId),
          eventStyleId: Number(params.eventStyleId),
          wantsAccessories: params.includeAccessories !== 'false',
        }
      : null;

  const openSelected = (selected: SelectResponse) => {
    // replace: seçimden sonra geri dönülünce aynı karşılaştırma tekrar cevaplanmasın (forma dönülür)
    router.replace({
      pathname: '/secilen-kombin',
      params: { outfit: JSON.stringify(selected.outfit), accessories: JSON.stringify(selected.accessories) },
    });
  };

  const { view, busy, choose, rejectAll, restart } = useComparison(request, variant, openSelected);

  // Kategori sırası ve adları lookups'tan (kartlarda parçalar bu sırayla dizilir)
  const categoryIndex = (id: number) => lookups.categories.findIndex((c) => c.id === id);
  const categoryOf = (id: number) => lookups.categories.find((c) => c.id === id);
  const sortByCategory = (items: OutfitItem[]) =>
    [...items].sort((a, b) => categoryIndex(a.categoryId) - categoryIndex(b.categoryId));

  const timeName = lookups.timesOfDay.find((t) => String(t.id) === params.timeOfDayId)?.displayName ?? '';
  const eventName = lookups.styles.find((s) => String(s.id) === params.eventStyleId)?.displayName ?? '';
  const contextLine = [
    params.placeName,
    params.date ? formatShortDate(params.date) : null,
    timeName.toLocaleLowerCase('tr-TR'),
    eventName,
  ]
    .filter(Boolean)
    .join(' · ');

  // Karşılaştırma formun üstüne açıldığı için Değiştir geri gider; doğrudan açıldıysa forma geçer
  const goToForm = () => (router.canGoBack() ? router.back() : router.replace('/kombin-form'));

  // Formdan değer gelmeden açıldıysa (ör. doğrudan bu adrese gelindi)
  if (!request) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, styles.centered, { backgroundColor: theme.background }]}>
        <View style={styles.padded}>
          <Text style={[styles.message, { color: theme.text }]}>Önce nasıl bir kombin istediğini seç.</Text>
          <Button title="Forma git" onPress={goToForm} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Bağlam özeti ve Değiştir */}
        <View style={[styles.contextBox, { backgroundColor: theme.backgroundSelected }]}>
          <View style={styles.flex}>
            <Text style={[styles.contextTop, { color: theme.textSecondary }]}>{contextLine}</Text>
            {view.status === 'ready' ? (
              <Text style={[styles.contextWeather, { color: theme.text }]}>
                Hissedilen {Math.round(view.weather.feelsLikeTemp)}° · {view.weather.condition.displayName}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={goToForm} hitSlop={8} style={styles.changeButton}>
            <Text style={[styles.changeText, { color: theme.link }]}>Değiştir</Text>
          </Pressable>
        </View>

        {view.status === 'loading' ? <Loading text="Kombinler hazırlanıyor…" /> : null}

        {view.status === 'error' ? (
          <View style={styles.gap}>
            <ErrorBox message={view.message} />
            <Button title="Tekrar dene" onPress={restart} />
          </View>
        ) : null}

        {view.status === 'empty' ? (
          <View style={styles.gap}>
            <Text style={[styles.message, { color: theme.text }]}>{view.message}</Text>
            <Button title="Koşulları değiştir" variant="outline" onPress={goToForm} />
          </View>
        ) : null}

        {view.status === 'ready' && !view.comparison.isSingleCard ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Hangisini giyerdin?</Text>

            <View style={styles.cardsRow}>
              {(['left', 'right'] as const).map((side) => (
                <Card key={`${view.comparison.id}-${side}`} style={styles.card}>
                  <View style={styles.items}>
                    {sortByCategory(view.comparison[side]).map((item) => {
                      const category = categoryOf(item.categoryId);
                      return (
                        <OutfitTile
                          key={item.id}
                          imageUrl={item.imageUrl}
                          categoryCode={category?.value ?? ''}
                          categoryLabel={category?.displayName ?? ''}
                        />
                      );
                    })}
                  </View>
                  <Button title="Bunu seç" onPress={() => choose(side)} disabled={busy} />
                </Card>
              ))}
            </View>

            {view.comparison.accessories.length > 0 ? (
              <View style={[styles.accessories, { borderColor: theme.border }]}>
                <Text style={[styles.accessoryTitle, { color: theme.textSecondary }]}>İki kombinde de aksesuar</Text>
                <View style={styles.accessoryRow}>
                  {view.comparison.accessories.map((a) => (
                    <View key={a.id} style={styles.accessoryTile}>
                      <OutfitTile imageUrl={a.imageUrl} categoryCode="aksesuar" categoryLabel="Aksesuar" size="small" />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <Button title="İkisi de olmaz" variant="outline" onPress={rejectAll} disabled={busy} loading={busy} />
          </>
        ) : null}

        {/* Yalnızca geliştirmede ve mock açıkken: üç mock varyantını telefonda görmek için (plan C.8 testi) */}
        {__DEV__ && USE_MOCK ? (
          <View style={[styles.mockBar, { borderColor: theme.border }]}>
            <Ionicons name="construct-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.mockLabel, { color: theme.textSecondary }]}>Mock:</Text>
            {MOCK_VARIANTS.map((v) => (
              <Pressable
                key={v.value}
                onPress={() => setVariant(v.value)}
                style={[
                  styles.mockChip,
                  { borderColor: theme.border, backgroundColor: variant === v.value ? theme.backgroundSelected : 'transparent' },
                ]}>
                <Text style={[styles.mockChipText, { color: theme.text }]}>{v.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center' },
  padded: { padding: 20, gap: 16 },
  container: { padding: 18, paddingBottom: 48, gap: 16 },
  flex: { flex: 1 },
  gap: { gap: 12 },

  contextBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: Radius.md, gap: 10 },
  contextTop: { fontFamily: Type.regular, fontSize: 12 },
  contextWeather: { fontFamily: Type.bold, fontSize: 15, marginTop: 2 },
  changeButton: { paddingVertical: 4 },
  changeText: { fontFamily: Type.bold, fontSize: 14 },

  title: { fontFamily: Type.bold, fontSize: 22 },
  message: { fontFamily: Type.regular, fontSize: 16, textAlign: 'center', lineHeight: 22 },

  cardsRow: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, padding: 10, gap: 10, justifyContent: 'space-between' },
  items: { gap: 8 },

  accessories: { borderWidth: 1, borderRadius: Radius.md, padding: 12, gap: 8 },
  accessoryTitle: { fontFamily: Type.regular, fontSize: 12 },
  accessoryRow: { flexDirection: 'row', gap: 8 },
  accessoryTile: { width: 64 },

  mockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  mockLabel: { fontFamily: Type.regular, fontSize: 12 },
  mockChip: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  mockChipText: { fontFamily: Type.regular, fontSize: 12 },
});
