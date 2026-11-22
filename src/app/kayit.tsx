import { router } from 'expo-router';

import { useAuth } from '@/components/AuthGate';
import RegisterScreen from '@/screens/RegisterScreen';

/** Kayıt ve onam (B2). Ekran kodu src/screens/RegisterScreen.js'te; burada yalnızca yönlendirme bağlanır (plan C.2 adım 1). */
export default function KayitRoute() {
  const { signIn } = useAuth();

  // Yığında Giriş varsa ona döner; yoksa (ör. uygulama bu sayfada yeniden açıldıysa) Giriş açılır.
  const goToLogin = () => router.dismissTo('/giris');

  return (
    <RegisterScreen
      navigation={{ goBack: goToLogin }}
      onRegisterSuccess={signIn}
      onOpenConsent={() => router.push('/onam')}
    />
  );
}
