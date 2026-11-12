import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiCall } from '../services/api';

export default function OnboardingScreen({ onOnboardingComplete }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Bilgilendirme onayını API'ye bildiriyoruz
      const response = await apiCall('/api/me/onboarding', 'POST', { accepted: true });
      
      if (response && response.success) {
        if (onOnboardingComplete) onOnboardingComplete();
      }
    } catch (error) {
      Alert.alert('Hata', error.message || 'Onay işlemi sırasında bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DolabımAI'ya Hoş Geldin!</Text>
      
      <ScrollView style={styles.card}>
        <Text style={styles.cardTitle}>Nasıl Çalışır?</Text>
        <Text style={styles.paragraph}>
          1. Kıyafetlerinin fotoğrafını çek veya galeriden seçerek dijital dolabına ekle.
        </Text>
        <Text style={styles.paragraph}>
          2. Kategori, alt tür ve renk bilgilerini düzenleyerek dolabını kategorize et.
        </Text>
        <Text style={styles.paragraph}>
          3. Yapay zeka asistanın sana hava durumuna ve tarzına uygun kombinler önersin.
        </Text>
        <Text style={styles.note}>
          Not: Yüklediğin fotoğraflar yalnızca senin dijital dolabını oluşturmak ve sana özel öneriler sunmak amacıyla işlenir.
        </Text>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleAccept}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Anladım, Başlayalım'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 20, paddingTop: 60, paddingBottom: 40, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E9ECEF' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 15 },
  paragraph: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 14 },
  note: { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 10, lineHeight: 18 },
  button: { height: 52, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  buttonDisabled: { backgroundColor: '#A0C4FF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});