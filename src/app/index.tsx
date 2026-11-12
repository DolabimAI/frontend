import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Button, Card } from '@/components/ui';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Mock veriler (Zehra C4 uçlarını bitirince gerçek API'den gelecek)
  const [userName] = useState('Ayşe');
  const [hasLocationOrCity] = useState(true); // false yaparsan konum yok uyarısını görürsün
  const [weatherInfo] = useState({
    city: 'İstanbul',
    district: 'Kadıköy',
    feelsLike: 14,
    condition: 'Parçalı bulutlu',
  });

  // Dolap durumu mock verisi (Test etmek için isReady değerini true/false değiştirebilirsin)
  const [wardrobeStatus, setWardrobeStatus] = useState({
    isReady: false,
    totalItems: 13,
    missingText: 'Kombin için eksik: 2 üst, 1 ayakkabı',
    showOnePieceNote: true,
    categories: [
      { label: 'Üst', have: 4, need: 6, done: false },
      { label: 'Alt', have: 5, need: 5, done: true },
      { label: 'Ayakkabı', have: 2, need: 3, done: false },
      { label: 'Dış giyim', have: 2, need: 2, done: true },
    ],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Üst Karşılama ve Hava Durumu */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.text }]}>Merhaba, {userName}</Text>

          {hasLocationOrCity ? (
            <View>
              <View style={styles.weatherRow}>
                <Ionicons name="partly-sunny-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.weatherText, { color: theme.textSecondary }]}>
                  {' '}
                  {weatherInfo.city} · {weatherInfo.district} · Hissedilen {weatherInfo.feelsLike}° ·{' '}
                  {weatherInfo.condition}
                </Text>
              </View>
              <Text style={[styles.attribution, { color: theme.textSecondary }]}>
                Hava verisi: Open-Meteo.com
              </Text>
            </View>
          ) : (
            <Text style={[styles.noLocationText, { color: theme.textSecondary }]}>
              Havayı görmek için konum izni ver ya da Profil&apos;den Şehrim&apos;ini seç
            </Text>
          )}
        </View>

        {/* Dolap Şartı Eksikse Uyarı Kartı */}
        {!wardrobeStatus.isReady && (
          <Card style={styles.missingCard}>
            <View style={styles.missingHeader}>
              <Ionicons name="alert-circle-outline" size={20} color="#6B4414" />
              <Text style={styles.missingTitle}>{wardrobeStatus.missingText}</Text>
            </View>

            {wardrobeStatus.showOnePieceNote && (
              <Text style={styles.onePieceNote}>
                Ya da 5 tek parça ekleyerek de başlayabilirsin.
              </Text>
            )}

            <View style={styles.categoryGrid}>
              {wardrobeStatus.categories.map((cat, index) => (
                <View key={index} style={styles.categoryBox}>
                  <Text style={styles.categoryCount}>
                    {cat.have}/{cat.need} {cat.done ? '✓' : ''}
                  </Text>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.darkBrownButton}
              onPress={() => router.push('/ekle')}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-outline" size={18} color="#FFF" />
              <Text style={styles.darkBrownButtonText}>Parça ekle</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Bugün Ne Giysem? Ana Eylem Kartı */}
        <Card
          style={[
            styles.heroCard,
            wardrobeStatus.isReady && { backgroundColor: theme.tint },
          ]}
        >
          <Text
            style={[
              styles.heroTitle,
              { color: wardrobeStatus.isReady ? '#FFFFFF' : theme.text },
            ]}
          >
            Bugün ne giysem?
          </Text>
          <Text
            style={[
              styles.heroSubtitle,
              { color: wardrobeStatus.isReady ? '#E8EFEA' : theme.textSecondary },
            ]}
          >
            {wardrobeStatus.isReady
              ? 'Nereye gideceğini seç, sana iki öneri getirelim.'
              : 'Kombin önerebilmemiz için önce dolabını tamamla.'}
          </Text>

          {wardrobeStatus.isReady ? (
            <TouchableOpacity
              style={styles.whiteActionButton}
              onPress={() => router.push('/kombin-form')}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles-outline" size={18} color={theme.tint} />
              <Text style={[styles.whiteActionButtonText, { color: theme.tint }]}>
                Kombin öner
              </Text>
            </TouchableOpacity>
          ) : (
            <Button title="Kombin öner" disabled onPress={() => {}} />
          )}
        </Card>

        {/* Alt Kısayol Kartları (Dolabım & Parça Ekle) */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutWrapper}
            onPress={() => router.push('/dolabim')}
            activeOpacity={0.8}
          >
            <Card style={styles.shortcutCard}>
              <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
                <Ionicons name="shirt-outline" size={20} color={theme.tint} />
              </View>
              <Text style={[styles.shortcutTitle, { color: theme.text }]}>Dolabım</Text>
              <Text style={[styles.shortcutSub, { color: theme.textSecondary }]}>
                {wardrobeStatus.totalItems} parça
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutWrapper}
            onPress={() => router.push('/ekle')}
            activeOpacity={0.8}
          >
            <Card style={styles.shortcutCard}>
              <View style={[styles.iconBadge, { backgroundColor: theme.backgroundSelected }]}>
                <Ionicons name="camera-outline" size={20} color={theme.tint} />
              </View>
              <Text style={[styles.shortcutTitle, { color: theme.text }]}>Parça ekle</Text>
              <Text style={[styles.shortcutSub, { color: theme.textSecondary }]}>
                Fotoğraf çek ya da seç
              </Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Test Amaçlı Durum Değiştirme Butonu (Gerçek API bağlanınca silinecek) */}
        <TouchableOpacity
          style={styles.mockToggle}
          onPress={() =>
            setWardrobeStatus((prev) => ({ ...prev, isReady: !prev.isReady }))
          }
        >
          <Text style={[styles.mockToggleText, { color: theme.textSecondary }]}>
            [Test] Dolap durumunu değiştir ({wardrobeStatus.isReady ? 'Hazır' : 'Eksik'})
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 18, paddingBottom: 32 },
  header: { marginBottom: 12 },
  greeting: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  weatherRow: { flexDirection: 'row', alignItems: 'center' },
  weatherText: { fontSize: 13 },
  attribution: { fontSize: 11, marginTop: 2 },
  noLocationText: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  missingCard: {
    backgroundColor: '#F6E8D5',
    borderWidth: 1,
    borderColor: '#E5CFAF',
  },
  missingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  missingTitle: { fontSize: 15, fontWeight: '700', color: '#4A2E0B', marginLeft: 6 },
  onePieceNote: { fontSize: 12, color: '#6B4414', marginBottom: 12 },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBox: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    borderRadius: 10,
    paddingVertical: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  categoryCount: { fontSize: 13, fontWeight: '700', color: '#4A2E0B' },
  categoryLabel: { fontSize: 11, color: '#6B4414', marginTop: 2 },
  darkBrownButton: {
    backgroundColor: '#4A2E0B',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkBrownButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14, marginLeft: 6 },
  heroCard: { padding: 18 },
  heroTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  heroSubtitle: { fontSize: 13, marginBottom: 12 },
  whiteActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteActionButtonText: { fontWeight: '700', fontSize: 15, marginLeft: 6 },
  shortcutRow: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcutWrapper: { flex: 0.485 },
  shortcutCard: { padding: 14 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  shortcutTitle: { fontSize: 15, fontWeight: '700' },
  shortcutSub: { fontSize: 12, marginTop: 2 },
  mockToggle: { marginTop: 16, alignItems: 'center', padding: 8 },
  mockToggleText: { fontSize: 12, textDecorationLine: 'underline' },
});