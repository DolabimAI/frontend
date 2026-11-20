import React from 'react';
import { ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import OutfitTile from '@/components/OutfitTile';
import { Button, Card } from '@/components/ui';
import { Colors, Type } from '@/constants/theme';
import { useLookups } from '@/context/LookupsContext';
import type { AccessoryItem, OutfitItem } from '@/types/api';

const parse = <T,>(value: string | undefined): T[] => {
  try {
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
};

/**
 * GEÇİCİ yer tutucu: Seçilen kombin ekranı B9'da (2 Aralık) yazılacak.
 * Şimdilik Karşılaştırma'dan (seçim ya da tek kart) gelen parçaları gösterir.
 */
export default function SecilenKombinScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const lookups = useLookups();
  const params = useLocalSearchParams<{ outfit?: string; accessories?: string }>();

  const outfit = parse<OutfitItem>(params.outfit);
  const accessories = parse<AccessoryItem>(params.accessories);
  const categoryIndex = (id: number) => lookups.categories.findIndex((c) => c.id === id);
  const sorted = [...outfit].sort((a, b) => categoryIndex(a.categoryId) - categoryIndex(b.categoryId));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Bugünkü kombinin</Text>
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Bu ekran B9&apos;da (2 Aralık) tamamlanacak; şimdilik seçtiğin parçalar görünüyor.
        </Text>
        <Card style={styles.card}>
          {sorted.map((item) => {
            const category = lookups.categories.find((c) => c.id === item.categoryId);
            return (
              <OutfitTile
                key={item.id}
                imageUrl={item.imageUrl}
                categoryCode={category?.value ?? ''}
                categoryLabel={category?.displayName ?? ''}
              />
            );
          })}
          {accessories.length > 0 ? (
            <View style={styles.accessoryRow}>
              {accessories.map((a) => (
                <View key={a.id} style={styles.accessoryTile}>
                  <OutfitTile imageUrl={a.imageUrl} categoryCode="aksesuar" categoryLabel="Aksesuar" size="small" />
                </View>
              ))}
            </View>
          ) : null}
        </Card>
        <Button title="Ana sayfaya dön" onPress={() => router.dismissTo('/')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 18, paddingBottom: 48, gap: 16 },
  title: { fontFamily: Type.bold, fontSize: 24 },
  note: { fontFamily: Type.regular, fontSize: 13 },
  card: { gap: 8 },
  accessoryRow: { flexDirection: 'row', gap: 8 },
  accessoryTile: { width: 64 },
});
