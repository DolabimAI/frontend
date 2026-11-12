import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiCall, setAuthToken } from '../services/api';

export default function RegisterScreen({ navigation, onRegisterSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState(''); // Örn: YYYY-MM-DD
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [loading, setLoading] = useState(false);

  // 18 Yaş Kontrolü
  const handleBirthDateChange = (text) => {
    setBirthDate(text);
    setAgeError('');

    // Basit bir YYYY-MM-DD format kontrolü ve yaş hesaplama
    if (text.length === 10) {
      const birthYear = parseInt(text.split('-')[0], 10);
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      if (age < 18) {
        setAgeError('18 yaşından küçükler kayıt olamaz (under_18).');
      }
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !birthDate || !password) {
      Alert.alert('Eksik Alan', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (ageError) {
      Alert.alert('Yaş Sınırı', '18 yaşından küçükler kayıt olamaz.');
      return;
    }

    if (!consentGiven) {
      Alert.alert('Onam Gereklidir', 'Devam etmek için onam metnini kabul etmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('/api/account/register', 'POST', {
        firstName,
        lastName,
        email,
        birthDate,
        password,
        consentGiven
      });

      if (response && response.token) {
        await setAuthToken(response.token);
        // Kayıt sonrası doğrudan Bilgilendirme ekranına yönlendirilir
        if (onRegisterSuccess) onRegisterSuccess();
      }
    } catch (error) {
      if (error.code === 409) {
        Alert.alert('Kayıt Hatası', 'Bu e-posta adresiyle zaten bir hesap var.');
      } else {
        Alert.alert('Hata', error.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Hesap Oluştur</Text>

      <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="#888" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Soyad" placeholderTextColor="#888" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="E-posta" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
      
      <TextInput 
        style={styles.input} 
        placeholder="Doğum Tarihi (YYYY-MM-DD)" 
        placeholderTextColor="#888" 
        value={birthDate} 
        onChangeText={handleBirthDateChange} 
      />
      {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}

      <TextInput style={styles.input} placeholder="Şifre" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />

      {/* Onam Alanı */}
      <TouchableOpacity style={styles.consentRow} onPress={() => setConsentGiven(!consentGiven)}>
        <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]} />
        <Text style={styles.consentText}>Onam metnini okudum, kabul ediyorum.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, (!consentGiven || ageError) && styles.buttonDisabled, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={!consentGiven || !!ageError || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Zaten hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, marginBottom: 12, fontSize: 16 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10, marginLeft: 5 },
  consentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 5 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#007AFF', borderRadius: 4, marginRight: 10 },
  checkboxChecked: { backgroundColor: '#007AFF' },
  consentText: { fontSize: 14, color: '#333', flex: 1 },
  button: { height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonDisabled: { backgroundColor: '#A0C4FF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 14 }
});