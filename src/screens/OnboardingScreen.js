import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ErrorBox } from '../components/ui';
import { apiCall } from '../services/api';

// Bilgilendirme (B3a, plan C.3). Rota dosyası src/app/bilgilendirme.tsx; yönlendirme onOnboardingComplete'te (AuthGate).
export default function OnboardingScreen({ onOnboardingComplete }) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAccept = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      // POST /api/me/onboarding: gövde yok, başarıda 204 (boş cevap). Başarı isteğin hatasız bitmesidir.
      await apiCall('/api/me/onboarding', 'POST');
      onOnboardingComplete();
    } catch (error) {
      // Onay kaydedilmeden çıkılırsa sonraki açılışta Bilgilendirme yeniden açılır (AuthGate).
      setErrorMessage(error?.message || 'Onay kaydedilemedi, tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !accepted || loading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{"DolabımAI'ya Hoş Geldin!"}</Text>

      <ScrollView style={styles.card}>
        <Text style={styles.cardTitle}>Başlamadan önce</Text>
        <Text style={styles.paragraph}>
          Önerilerin düzgün çalışması için dolabına şunları ekle: 6 üst ve 5 alt ya da 5 tek parça; 3 ayakkabı; 2 dış giyim. Kıyafeti gün ışığında, düz bir zemine serip üstten çek.
        </Text>
        <Text style={styles.paragraph}>
          Aksesuarı beğenmezsen kombini reddetmeden önce değiştir ya da kaldır.
        </Text>
      </ScrollView>

      {/* "Okudum ve anladım" işaretlenmeden Devam et pasif */}
      <TouchableOpacity style={styles.consentRow} onPress={() => setAccepted(!accepted)}>
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]} />
        <Text style={styles.consentText}>Okudum ve anladım</Text>
      </TouchableOpacity>

      {errorMessage ? <ErrorBox message={errorMessage} /> : null}

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleAccept}
        disabled={isDisabled}
      >
        <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : errorMessage ? 'Tekrar dene' : 'Devam et'}</Text>
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
  consentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#007AFF', borderRadius: 4, marginRight: 10 },
  checkboxChecked: { backgroundColor: '#007AFF' },
  consentText: { fontSize: 15, color: '#333' },
  button: { height: 52, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  buttonDisabled: { backgroundColor: '#A0C4FF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
