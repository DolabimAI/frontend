import { router } from 'expo-router';

import { useAuth } from '@/components/AuthGate';
import LoginScreen from '@/screens/LoginScreen';

/** Giriş (B2). Ekran kodu src/screens/LoginScreen.js'te; burada yalnızca yönlendirme bağlanır (plan C.2 adım 1). */
export default function GirisRoute() {
  const { signIn } = useAuth();

  return <LoginScreen navigation={{ navigate: () => router.push('/kayit') }} onLoginSuccess={signIn} />;
}
