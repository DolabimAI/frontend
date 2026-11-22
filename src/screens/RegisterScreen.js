import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ErrorBox } from '../components/ui';
import { apiCall } from '../services/api';

// Kayıt ve onam (B2, plan C.2). Rota dosyası src/app/kayit.tsx; anahtarı saklama ve yönlendirme onRegisterSuccess'te (AuthGate).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "YYYY-MM-DD" gerçek bir tarihse yerel takvimde Date döner, değilse null (ör. 2006-02-30 geçersiz).
const parseBirthDate = (text) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
};

// C# ile aynı kural: doğum tarihi bugünden 18 yıl öncesi ya da daha eski olmalı (RegisterValidator.cs).
const isAtLeast18 = (birthDate) => {
  const today = new Date();
  const limit = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return birthDate <= limit;
};

export default function RegisterScreen({ navigation, onRegisterSuccess, onOpenConsent }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState(''); // YYYY-MM-DD
  const [password, setPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', birthDate: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);

  const setFieldError = (field, message) => setFieldErrors((prev) => ({ ...prev, [field]: message }));

  // E-posta biçimi yazarken kontrol edilir.
  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailTaken(false);
    setFieldError('email', text && !EMAIL_PATTERN.test(text) ? 'Geçerli bir e-posta adresi gir.' : '');
  };

  // Tarih biçimi, geçerliliği ve 18 yaş kuralı tam tarihle kontrol edilir.
  const handleBirthDateChange = (text) => {
    setBirthDate(text);
    if (text.length < 10) {
      setFieldError('birthDate', '');
      return;
    }
    const date = parseBirthDate(text);
    if (!date) {
      setFieldError('birthDate', 'Doğum tarihini YYYY-AA-GG biçiminde gir (ör. 2001-04-23).');
    } else if (!isAtLeast18(date)) {
      setFieldError('birthDate', '18 yaşından küçükler kayıt olamaz.');
    } else {
      setFieldError('birthDate', '');
    }
  };

  const hasFieldError = !!(fieldErrors.email || fieldErrors.birthDate);

  const handleRegister = async () => {
    setErrorMessage('');
    setEmailTaken(false);
    if (!firstName || !lastName || !email || !birthDate || !password) {
      setErrorMessage('Lütfen bütün alanları doldur.');
      return;
    }

    setLoading(true);
    try {
      // 201: { accessToken, expiresAt, firstName, isOnboardingAccepted: false }
      const response = await apiCall('/api/account/register', 'POST', {
        firstName,
        lastName,
        email,
        birthDate,
        password,
        consentAccepted,
      });
      await onRegisterSuccess(response);
    } catch (error) {
      // Karar C#'ın koduna göre verilir; ekranda C#'ın mesajı gösterilir (plan C.9).
      const message = error?.message || 'Kayıt sırasında bir hata oluştu.';
      if (error?.code === 'under_18') setFieldError('birthDate', message);
      else if (error?.code === 'invalid_email') setFieldError('email', message);
      else if (error?.code === 'weak_password') setFieldError('password', message);
      else if (error?.code === 'email_taken') {
        setEmailTaken(true);
        setErrorMessage(message);
      } else setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !consentAccepted || hasFieldError || loading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Hesap Oluştur</Text>

      <TextInput style={styles.input} placeholder="Ad" placeholderTextColor="#888" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Soyad" placeholderTextColor="#888" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="E-posta" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={handleEmailChange} />
      {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Doğum Tarihi (YYYY-AA-GG)"
        placeholderTextColor="#888"
        value={birthDate}
        onChangeText={handleBirthDateChange}
      />
      {fieldErrors.birthDate ? <Text style={styles.errorText}>{fieldErrors.birthDate}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setFieldError('password', '');
        }}
      />
      {fieldErrors.password ? <Text style={styles.errorText}>{fieldErrors.password}</Text> : null}

      {/* Onam Alanı: kutu işaretlenmeden Kayıt ol pasif; "onam metni" bağlantısı metni açar */}
      <View style={styles.consentRow}>
        <TouchableOpacity onPress={() => setConsentAccepted(!consentAccepted)}>
          <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]} />
        </TouchableOpacity>
        <Text style={styles.consentText}>
          <Text style={styles.consentLink} onPress={onOpenConsent}>Onam metnini</Text>
          {' okudum, kabul ediyorum.'}
        </Text>
      </View>

      {errorMessage ? <ErrorBox message={errorMessage} /> : null}
      {emailTaken ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>{"Giriş'e geç"}</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isDisabled}
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
  consentLink: { color: '#007AFF', textDecorationLine: 'underline' },
  button: { height: 50, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonDisabled: { backgroundColor: '#A0C4FF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 14 }
});
