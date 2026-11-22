import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ErrorBox } from '../components/ui';
import { apiCall } from '../services/api';

// Giriş (B2, plan C.2). Rota dosyası src/app/giris.tsx; anahtarı saklama ve yönlendirme onLoginSuccess'te (AuthGate).
export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('E-posta ve şifreni gir.');
      return;
    }

    setLoading(true);
    try {
      // 200: { accessToken, expiresAt, firstName, isOnboardingAccepted }
      const response = await apiCall('/api/account/signin', 'POST', { email, password });
      await onLoginSuccess(response);
    } catch (error) {
      // C#'ın mesajı gösterilir (yanlış şifre, olmayan ve silinmiş hesap için tek mesaj); alanlar temizlenmez.
      setErrorMessage(error?.message || 'E-posta ya da şifre hatalı.');
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

      {errorMessage ? <ErrorBox message={errorMessage} /> : null}

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
