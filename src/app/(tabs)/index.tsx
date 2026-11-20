import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import CategoryBadge from '@/components/CategoryBadge';
import { Button, ErrorBox, GradientBackground, Loading } from '@/components/ui';
import { useHomeData, type WeatherState } from '@/hooks/use-home-data';
import { Colors, Gradients, OnGradient, Radius, Type } from '@/constants/theme';

/**
 * Ana sayfa — görünüm Figma "DolabımAI / Ana sayfa" ekranından (18 Kasım).
 * Veriler gerçek uçlardan (B3b, plan C.4): me, wardrobe/status, locations/nearest ve weather.
 * Veri çekme src/hooks/use-home-data.ts'te; bu dosya yalnızca görünüm.
 */
export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const gradients = Gradients[scheme];
  const onGradient = OnGradient[scheme];

  const home = useHomeData();
  const ready = home.wardrobe?.isReady ?? false;
  const statBg = scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)';

  // Yükleniyor: me ve dolap durumu gelene kadar. Hata: ErrorBox ve "Tekrar dene" (plan C.4 Durumlar).
  if (home.isLoading || home.errorMessage) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, styles.centered, { backgroundColor: theme.background }]}>
        {home.errorMessage ? (
          <View style={styles.errorWrap}>
            <ErrorBox message={home.errorMessage} />
            <Button title="Tekrar dene" onPress={home.retry} />
          </View>
        ) : (
          <Loading />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Karşılama (template'teki "What are you / Looking for?") */}
        <View style={styles.header}>
          <Text style={[styles.hello, { color: theme.text }]}>Merhaba,</Text>
          <Text style={[styles.name, { color: theme.text }]}>{home.firstName}</Text>
        </View>

        {/* Hava (kendi satırında ayrı yüklenir; hata ekranın geri kalanını durdurmaz) */}
        <WeatherPill weather={home.weather} />

        {/* Dolap şartı eksikse uyarı kartı */}
        {!ready && (
          <View style={styles.missingCard}>
            <GradientBackground colors={gradients.warning} radius={Radius.xl} />
            <View style={styles.missingHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={onGradient.title} />
              <Text style={[styles.missingTitle, { color: onGradient.title }]}>{home.missingText}</Text>
            </View>

            {home.showOnePieceNote && (
              <Text style={[styles.onePieceNote, { color: onGradient.body }]}>
                Ya da 5 tek parça ekleyerek de başlayabilirsin.
              </Text>
            )}

            <View style={styles.categoryGrid}>
              {home.requirements.map((cat) => {
                const done = cat.have >= cat.need;
                return (
                  <View key={cat.category} style={[styles.categoryBox, { backgroundColor: statBg }]}>
                    <CategoryBadge code={cat.category} />
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
            subtitle={`${home.wardrobe?.totalCount ?? 0} parça`}
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

      </ScrollView>
    </SafeAreaView>
  );
}

/** Hava satırı: yükleniyor, gerçek hava, yer yok uyarısı ya da hata (plan C.4). */
function WeatherPill({ weather }: { weather: WeatherState }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const icon = weather.status === 'no_place' ? 'location-outline' : 'partly-sunny-outline';

  let content: React.ReactNode;
  if (weather.status === 'ok') {
    const place = weather.place.district
      ? `${weather.place.city.name} · ${weather.place.district.name}`
      : weather.place.city.name;
    content = (
      <View style={styles.flex}>
        <Text style={[styles.weatherPlace, { color: theme.text }]}>{place}</Text>
        <Text style={[styles.weatherDetail, { color: theme.textSecondary }]}>
          Hissedilen {weather.feelsLike}° · {weather.condition}
        </Text>
        <Text style={[styles.attribution, { color: theme.textSecondary }]}>Hava verisi: Open-Meteo.com</Text>
      </View>
    );
  } else {
    const message =
      weather.status === 'loading'
        ? 'Hava alınıyor…'
        : weather.status === 'no_place'
          ? "Havayı görmek için konum izni ver ya da Profil'den Şehrim'ini seç"
          : 'Hava durumu alınamadı, biraz sonra tekrar dene.';
    content = <Text style={[styles.weatherDetail, styles.flex, { color: theme.textSecondary }]}>{message}</Text>;
  }

  return (
    <View style={[styles.weatherPill, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <View style={styles.weatherBadge}>
        <Ionicons name={icon} size={22} color="#325EF1" />
      </View>
      {content}
    </View>
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
  centered: { justifyContent: 'center' },
  errorWrap: { padding: 20, gap: 12 },
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

});
