import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiCall, setAuthToken } from '../services/api';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    setLoading(true);
    try {
      // C# API ucu çağrısı (Mock veya gerçek)
      const response = await apiCall('/api/account/signin', 'POST', { email, password });
      
      if (response && response.token) {
        await setAuthToken(response.token);
        // Giriş başarılı, ana uygulama akışına geçiş tetiklenir
        if (onLoginSuccess) onLoginSuccess(response.is_onboarding_accepted);
      }
    } catch (error) {
      // İş kuralı: Yanlış şifre, olmayan hesap ve silinmiş hesap için tek mesaj. Alanlar temizlenmez!
      Alert.alert('Giriş Hatası', error.message || 'E-posta ya da şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DolabımAI Giriş</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-posta adresi"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#333' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16 },
  button: { height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  buttonDisabled: { backgroundColor: '#A0C4FF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 14 }
});