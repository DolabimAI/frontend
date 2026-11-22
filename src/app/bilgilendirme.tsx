import { useAuth } from '@/components/AuthGate';
import OnboardingScreen from '@/screens/OnboardingScreen';

/** Bilgilendirme (B3a). Ekran kodu src/screens/OnboardingScreen.js'te; onaydan sonra AuthGate Ana sayfayı açar (plan C.3). */
export default function BilgilendirmeRoute() {
  const { completeOnboarding } = useAuth();

  return <OnboardingScreen onOnboardingComplete={completeOnboarding} />;
}
