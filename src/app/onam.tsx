import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Onam metni (B2, plan C.2 adım 6). Kayıt ekranındaki "Onam metnini" bağlantısı bu sayfayı açar.
 * Metin ekipçe onaylanan onam metnidir; değişirse yalnızca ONAM_METNI güncellenir.
 */
const ONAM_METNI = `ONAM_METNI_BURAYA`;

export default function OnamRoute() {
  // Yığında Kayıt varsa ona döner (yazılanlar kaybolmaz); yoksa (ör. uygulama bu sayfada yeniden açıldıysa) Kayıt açılır.
  const goBackToRegister = () => router.dismissTo('/kayit');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onam Metni</Text>
      <ScrollView style={styles.card}>
        <Text style={styles.paragraph}>{ONAM_METNI}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={goBackToRegister}>
        <Text style={styles.buttonText}>Kayda dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, paddingBottom: 40, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E9ECEF' },
  paragraph: { fontSize: 15, color: '#444', lineHeight: 22 },
  button: { height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
