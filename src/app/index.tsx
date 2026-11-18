import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import CategoryBadge, { type CategoryCode } from '@/components/CategoryBadge';
import { GradientBackground } from '@/components/ui';
import { Colors, Gradients, OnGradient, Radius, Type } from '@/constants/theme';

/**
 * Ana sayfa — görünüm Figma "DolabımAI / Ana sayfa" ekranından (18 Kasım).
 * Veriler hâlâ mock: B3b'de (C.4) me, wardrobe/status, nearest ve weather uçlarına bağlanacak.
 */
export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const gradients = Gradients[scheme];
  const onGradient = OnGradient[scheme];

  // Mock veriler (Zehra C4 uçlarını bitirince gerçek API'den gelecek)
  const [userName] = useState('Ayşe');
  const [hasLocationOrCity] = useState(true); // false yaparsan konum yok uyarısını görürsün
  const [weatherInfo] = useState({
    city: 'İstanbul',
    district: 'Kadıköy',
    feelsLike: 14,
    condition: 'Parçalı bulutlu',
  });

  // Dolap durumu mock verisi. code alanı C#'taki kategori kodlarıyla aynı (C.4).
  const [wardrobeStatus, setWardrobeStatus] = useState({
    isReady: false,
    totalItems: 13,
    missingText: 'Kombin için eksik: 2 üst, 1 ayakkabı',
    showOnePieceNote: true,
    categories: [
      { code: 'ust' as CategoryCode, label: 'Üst', have: 4, need: 6 },
      { code: 'alt' as CategoryCode, label: 'Alt', have: 5, need: 5 },
      { code: 'ayakkabi' as CategoryCode, label: 'Ayakkabı', have: 2, need: 3 },
      { code: 'dis' as CategoryCode, label: 'Dış giyim', have: 2, need: 2 },
    ],
  });

  const ready = wardrobeStatus.isReady;
  const statBg = scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Karşılama (template'teki "What are you / Looking for?") */}
        <View style={styles.header}>
          <Text style={[styles.hello, { color: theme.text }]}>Merhaba,</Text>
          <Text style={[styles.name, { color: theme.text }]}>{userName}</Text>
        </View>

        {/* Hava */}
        <View style={[styles.weatherPill, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
          <View style={styles.weatherBadge}>
            <Ionicons
              name={hasLocationOrCity ? 'partly-sunny-outline' : 'location-outline'}
              size={22}
              color="#325EF1"
            />
          </View>
          {hasLocationOrCity ? (
            <View style={styles.flex}>
              <Text style={[styles.weatherPlace, { color: theme.text }]}>
                {weatherInfo.city} · {weatherInfo.district}
              </Text>
              <Text style={[styles.weatherDetail, { color: theme.textSecondary }]}>
                Hissedilen {weatherInfo.feelsLike}° · {weatherInfo.condition}
              </Text>
              <Text style={[styles.attribution, { color: theme.textSecondary }]}>Hava verisi: Open-Meteo.com</Text>
            </View>
          ) : (
            <Text style={[styles.weatherDetail, styles.flex, { color: theme.textSecondary }]}>
              Havayı görmek için konum izni ver ya da Profil&apos;den Şehrim&apos;ini seç
            </Text>
          )}
        </View>

        {/* Dolap şartı eksikse uyarı kartı */}
        {!ready && (
          <View style={styles.missingCard}>
            <GradientBackground colors={gradients.warning} radius={Radius.xl} />
            <View style={styles.missingHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={onGradient.title} />
              <Text style={[styles.missingTitle, { color: onGradient.title }]}>{wardrobeStatus.missingText}</Text>
            </View>

            {wardrobeStatus.showOnePieceNote && (
              <Text style={[styles.onePieceNote, { color: onGradient.body }]}>
                Ya da 5 tek parça ekleyerek de başlayabilirsin.
              </Text>
            )}

            <View style={styles.categoryGrid}>
              {wardrobeStatus.categories.map((cat) => {
                const done = cat.have >= cat.need;
                return (
                  <View key={cat.code} style={[styles.categoryBox, { backgroundColor: statBg }]}>
                    <CategoryBadge code={cat.code} />
                    <Text style={[styles.categoryCount, { color: onGradient.title }]}>
                      {cat.have}/{cat.need}
                      {done ? ' ✓' : ''}
                    </Text>
                    <Text style={[styles.categoryLabel, { color: onGradient.body }]}>{cat.label}</Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.primary }, pressed && styles.pressed]}
              onPress={() => router.push('/ekle')}>
              <Ionicons name="camera-outline" size={20} color={theme.onPrimary} />
              <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Parça ekle</Text>
            </Pressable>
          </View>
        )}

        {/* Bugün ne giysem? (template'teki mor karşılama kartı) */}
        <View style={[styles.heroShadow, { shadowColor: theme.shadow }]}>
          <View style={styles.heroCard}>
            <GradientBackground colors={gradients.hero} direction="diagonal" radius={Radius.xxl} />
            <Text style={styles.heroTitle}>Bugün ne giysem?</Text>
            <Text style={styles.heroSubtitle}>
              {ready
                ? 'Nereye gideceğini seç, sana iki öneri getirelim.'
                : 'Kombin önerebilmemiz için önce dolabını tamamla.'}
            </Text>
            <Pressable
              disabled={!ready}
              accessibilityState={{ disabled: !ready }}
              style={({ pressed }) => [styles.whiteButton, !ready && styles.disabled, pressed && styles.pressed]}
              onPress={() => router.push('/kombin-form')}>
              <Ionicons name="sparkles-outline" size={20} color="#05293C" />
              <Text style={styles.whiteButtonText}>Kombin öner</Text>
            </Pressable>
          </View>
        </View>

        {/* Bölüm başlığı (template'teki "Trending Properties  See All ›") */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dolabın</Text>
          <Pressable style={styles.seeAll} onPress={() => router.push('/dolabim')} hitSlop={8}>
            <Text style={[styles.seeAllText, { color: theme.link }]}>Tümünü gör</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.link} />
          </Pressable>
        </View>

        {/* Kısayollar (template'teki mülk kartları) */}
        <View style={styles.shortcutRow}>
          <ShortcutCard
            colors={gradients.pink}
            icon="shirt-outline"
            iconColor="#E05F78"
            title="Dolabım"
            subtitle={`${wardrobeStatus.totalItems} parça`}
            titleColor={onGradient.title}
            onPress={() => router.push('/dolabim')}
          />
          <ShortcutCard
            colors={gradients.blue}
            icon="camera-outline"
            iconColor="#325EF1"
            title="Parça ekle"
            subtitle="Fotoğraf çek ya da seç"
            titleColor={onGradient.title}
            onPress={() => router.push('/ekle')}
          />
        </View>

        {/* Test amaçlı durum değiştirme butonu (B3b'de gerçek API bağlanınca silinecek) */}
        <Pressable
          style={styles.mockToggle}
          onPress={() => setWardrobeStatus((prev) => ({ ...prev, isReady: !prev.isReady }))}>
          <Text style={[styles.mockToggleText, { color: theme.textSecondary }]}>
            [Test] Dolap durumunu değiştir ({ready ? 'Hazır' : 'Eksik'})
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ShortcutCardProps {
  colors: readonly string[];
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  title: string;
  subtitle: string;
  titleColor: string;
  onPress: () => void;
}

function ShortcutCard({ colors, icon, iconColor, title, subtitle, titleColor, onPress }: ShortcutCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.shortcutCard, pressed && styles.pressed]} onPress={onPress}>
      <GradientBackground colors={colors} radius={22} />
      <View style={styles.shortcutIcon}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.shortcutTitle, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.shortcutSub, { color: titleColor }]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48, gap: 20 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },

  header: { marginTop: 8 },
  hello: { fontFamily: Type.light, fontSize: 32, lineHeight: 38 },
  name: { fontFamily: Type.black, fontSize: 34, lineHeight: 40 },

  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 16,
    borderRadius: Radius.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  weatherBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E1E7FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherPlace: { fontFamily: Type.bold, fontSize: 15 },
  weatherDetail: { fontFamily: Type.regular, fontSize: 13, marginTop: 1 },
  attribution: { fontFamily: Type.regular, fontSize: 10, marginTop: 2, opacity: 0.7 },

  missingCard: { borderRadius: Radius.xl, overflow: 'hidden', padding: 16, paddingVertical: 18, gap: 14 },
  missingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missingTitle: { fontFamily: Type.bold, fontSize: 16, flexShrink: 1 },
  onePieceNote: { fontFamily: Type.regular, fontSize: 13, marginTop: -6 },
  categoryGrid: { flexDirection: 'row', gap: 8 },
  categoryBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 6,
  },
  categoryCount: { fontFamily: Type.black, fontSize: 16 },
  categoryLabel: { fontFamily: Type.regular, fontSize: 12 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: Radius.lg,
  },
  primaryButtonText: { fontFamily: Type.bold, fontSize: 16 },

  heroShadow: {
    borderRadius: Radius.xxl,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 6,
  },
  heroCard: { borderRadius: Radius.xxl, overflow: 'hidden', padding: 20, paddingTop: 22 },
  heroTitle: { fontFamily: Type.bold, fontSize: 26, color: '#FFFFFF' },
  heroSubtitle: { fontFamily: Type.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  whiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  whiteButtonText: { fontFamily: Type.bold, fontSize: 16, color: '#05293C' },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: Type.bold, fontSize: 22 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontFamily: Type.bold, fontSize: 15 },

  shortcutRow: { flexDirection: 'row', gap: 15 },
  shortcutCard: { flex: 1, borderRadius: 22, overflow: 'hidden', padding: 16 },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  shortcutTitle: { fontFamily: Type.bold, fontSize: 18 },
  shortcutSub: { fontFamily: Type.light, fontSize: 13, marginTop: 4 },

  mockToggle: { alignItems: 'center', padding: 8 },
  mockToggleText: { fontFamily: Type.regular, fontSize: 12, textDecorationLine: 'underline' },
});
