import React, { useState } from 'react';
import { Linking, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Button, Card, ErrorBox } from '@/components/ui';
import { Colors, Radius, Type } from '@/constants/theme';

/**
 * Parça ekle (B4, plan C.6): fotoğraf kameradan çekilir ya da galeriden seçilir ve İşleniyor ekranına (B5) geçer.
 * Kamera izni reddedilirse açıklama ve "Ayarlara git" düğmesi görünür (Linking.openSettings()).
 * Galeri izin istemez: telefonun fotoğraf seçicisi uygulamaya yalnızca seçilen fotoğrafı verir.
 */
export default function AddClothScreen() {
  const theme = Colors[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const [cameraDenied, setCameraDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // seçici açıkken düğmelere ikinci kez basılmasın

  // Seçilen fotoğrafın adresi, adı ve türü İşleniyor ekranına parametre olarak geçer (C.6 adım 4)
  const openProcessing = (asset: ImagePicker.ImagePickerAsset) => {
    // HEIC kontrolü (C.7, 17 Kasım kararı): telefonun gönderdiği tür terminalde görünür, Zehra'ya bildirilir
    console.log('[B4] Fotoğraf türü:', asset.mimeType, '| adı:', asset.fileName);
    router.push({
      pathname: '/isleniyor',
      params: { uri: asset.uri, fileName: asset.fileName ?? '', mimeType: asset.mimeType ?? '' },
    });
  };

  const takePhoto = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setCameraDenied(true);
        return;
      }
      setCameraDenied(false);
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled) openProcessing(result.assets[0]);
    } catch {
      setErrorMessage('Kamera açılamadı. Galeriden seçmeyi deneyebilirsin.');
    } finally {
      setBusy(false);
    }
  };

  const pickFromGallery = async () => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled) openProcessing(result.assets[0]);
    } catch {
      setErrorMessage('Galeri açılamadı. Lütfen tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Parça ekle</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Parçanın fotoğrafını çek ya da galeriden seç; türünü ve rengini biz tahmin edelim.
        </Text>

        {/* Çekim ipucu (C.6 adım 2) */}
        <Card style={styles.hintCard}>
          <View style={[styles.hintIcon, { backgroundColor: theme.backgroundSelected }]}>
            <Ionicons name="sunny-outline" size={22} color={theme.tint} />
          </View>
          <Text style={[styles.hintText, { color: theme.text }]}>Gün ışığında, düz zemine serip üstten çek.</Text>
        </Card>

        {/* Kamera izni kapalı (C.6 adım 3) */}
        {cameraDenied && (
          <Card>
            <Text style={[styles.deniedTitle, { color: theme.text }]}>Kamera izni kapalı</Text>
            <Text style={[styles.deniedText, { color: theme.textSecondary }]}>
              Fotoğraf çekebilmek için ayarlardan kamera iznini açman gerekiyor. İstersen galeriden de seçebilirsin.
            </Text>
            <Button title="Ayarlara git" variant="outline" onPress={() => Linking.openSettings()} />
          </Card>
        )}

        {errorMessage && <ErrorBox message={errorMessage} />}

        <View style={styles.actions}>
          <Button title="Fotoğraf çek" onPress={takePhoto} disabled={busy} />
          <View style={styles.gap} />
          <Button title="Galeriden seç" variant="outline" onPress={pickFromGallery} disabled={busy} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  title: { fontFamily: Type.bold, fontSize: 26, marginBottom: 6 },
  subtitle: { fontFamily: Type.regular, fontSize: 15, lineHeight: 21, marginBottom: 12 },
  hintCard: { flexDirection: 'row', alignItems: 'center' },
  hintIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hintText: { flex: 1, fontFamily: Type.bold, fontSize: 15, lineHeight: 21 },
  deniedTitle: { fontFamily: Type.bold, fontSize: 16, marginBottom: 4 },
  deniedText: { fontFamily: Type.regular, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  actions: { marginTop: 'auto', marginBottom: 24 },
  gap: { height: 12 },
});
