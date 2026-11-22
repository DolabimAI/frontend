import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { File } from 'expo-file-system';

import { Button, ErrorBox, Loading } from '@/components/ui';
import { Colors, Radius, Type } from '@/constants/theme';
import { apiCall } from '@/services/api';
import type { ApiError, ClothingDraft } from '@/types/api';

// Bu hatalarda fotoğrafın kendisi kullanılamıyor; yeni fotoğraf gerekir (Yeniden çek). Taslak açılmamıştır.
const RETAKE_CODES = ['image_unreadable', 'unsupported_file', 'file_too_large'];

/**
 * İşleniyor (B5, plan C.7): Parça ekle'den (B4) gelen fotoğraf POST /api/clothes/analyze'a gönderilir.
 * Cevap gelince Etiket onayı açılır. İstek sürerken geri dönülemez (alt bar da görünmez), böylece
 * aynı anda ikinci bir yükleme başlamaz. 10 saniyeyi aşarsa "Biraz uzun sürüyor" yazısı çıkar.
 */
export default function ProcessingScreen() {
  const theme = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { uri } = useLocalSearchParams<{ uri: string }>();

  const [error, setError] = useState<ApiError | null>(null);
  const [isSlow, setIsSlow] = useState(false);
  // "Tekrar dene"ye her basışta artar; effect isteği yeniden gönderir
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // ekrandan çıkıldıysa geç gelen cevap yok sayılır
    const slowTimer = setTimeout(() => setIsSlow(true), 10000);

    // Fotoğraf "image" alanında (17 Kasım kararı); api.js FormData'da Content-Type eklemez (C.0 adım 7).
    // Expo SDK 56'dan beri fetch, expo/fetch; planda (C.9) örneği verilen { uri, name, type } nesnesini göndermiyor
    // (istek C#'a hiç ulaşmıyor). Dosya bu yüzden expo-file-system'in File'ıyla eklenir; adı ve türü dosyanın kendisinden gelir.
    const form = new FormData();
    form.append('image', new File(uri));

    apiCall('/api/clothes/analyze', 'POST', form)
      .then((draft: ClothingDraft) => {
        if (ignore) return;
        // replace: Etiket onayı'ndan geri gelince İşleniyor yeniden açılıp ikinci taslak oluşturmasın
        router.replace({ pathname: '/etiket-onayi', params: { draft: JSON.stringify(draft) } });
      })
      .catch((e: ApiError) => {
        if (!ignore) setError(e);
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      ignore = true;
      clearTimeout(slowTimer);
    };
  }, [attempt, uri]);

  // Android geri tuşu: istek sürerken kapalı, hata çıktıysa Parça ekle'ye döner
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => error === null);
    return () => subscription.remove();
  }, [error]);

  const retry = () => {
    setError(null);
    setIsSlow(false);
    setAttempt((n) => n + 1);
  };

  const needsRetake = error !== null && RETAKE_CODES.includes(error.code);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Image source={{ uri }} style={[styles.photo, { backgroundColor: theme.card }]} contentFit="cover" />

        {error === null ? (
          <>
            <Loading text="Fotoğrafın işleniyor…" />
            {isSlow && (
              <Text style={[styles.slowText, { color: theme.textSecondary }]}>Biraz uzun sürüyor, az kaldı.</Text>
            )}
          </>
        ) : (
          <View style={styles.errorArea}>
            {/* Hata kuralı (C.9): karar error.code'a göre, ekranda C#'ın mesajı */}
            <ErrorBox message={error.message} />
            {needsRetake ? (
              <Button title="Yeniden çek" onPress={() => router.back()} />
            ) : (
              <>
                <Button title="Tekrar dene" onPress={retry} />
                <View style={styles.gap} />
                <Button title="Vazgeç" variant="outline" onPress={() => router.back()} />
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: Radius.xl, marginBottom: 8 },
  slowText: { fontFamily: Type.regular, fontSize: 14, textAlign: 'center' },
  errorArea: { marginTop: 8 },
  gap: { height: 12 },
});
