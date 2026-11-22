import { router } from 'expo-router';

import { useAuth } from '@/components/AuthGate';
import RegisterScreen from '@/screens/RegisterScreen';

/** Kayıt ve onam (B2). Ekran kodu src/screens/RegisterScreen.js'te; burada yalnızca yönlendirme bağlanır (plan C.2 adım 1). */
export default function KayitRoute() {
  const { signIn } = useAuth();

  const goToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/giris');
  };

  return (
    <RegisterScreen
      navigation={{ goBack: goToLogin }}
      onRegisterSuccess={signIn}
      onOpenConsent={() => router.push('/onam')}
    />
  );
}
