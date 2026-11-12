import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Button, Card } from '@/components/ui';

export default function KarsilastirmaMockScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Card>
          <Text style={[styles.title, { color: theme.text }]}>Karşılaştırma Ekranı (Mock)</Text>
          <Text style={[styles.desc, { color: theme.textSecondary }]}>
            Kombin formu başarıyla gönderildi. Gerçek öneri kartları 26 Kasım (B8) aşamasında bu ekrana bağlanacak.
          </Text>
          <Button title="Ana Sayfaya Dön" onPress={() => router.replace('/')} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
});