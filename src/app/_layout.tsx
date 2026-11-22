import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import {
  useFonts,
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
} from '@expo-google-fonts/lato';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';
import AuthGate, { useAuth } from '@/components/AuthGate';
import { useDevTokenReady } from '@/dev/use-dev-token';

SplashScreen.preventAutoHideAsync();

/**
 * Kök düzen: en dışta ekran yığını (Stack). Alt barlı ekranlar (tabs) grubunda;
 * Karşılaştırma ve Seçilen kombin gibi akış ekranları alt barın üstüne açılır.
 * B2'deki Giriş/Kayıt ve B5'teki İşleniyor/Etiket onayı da bu yığına eklenir.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });
  // GEÇİCİ (B2 gelene kadar): .env.local'daki test anahtarı kaydedilene kadar bekle.
  const devTokenReady = useDevTokenReady();

  // Fontlar gelene kadar açılış ekranı açık kalır (AnimatedSplashOverlay onu sonra kapatır).
  // Font yüklenemezse sistem fontuyla devam edilir; uygulama takılı kalmaz.
  if ((!fontsLoaded && !fontError) || !devTokenReady) return null;

  const isDark = colorScheme === 'dark';
  const base = isDark ? DarkTheme : DefaultTheme;
  const palette = Colors[isDark ? 'dark' : 'light'];
  // Alt barın oyuğundan ekran zemini görünsün diye gezgin zemini temayla aynı.
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: palette.background, card: palette.background, primary: palette.tint },
  };

  return (
    <ThemeProvider value={navTheme}>
      <AnimatedSplashOverlay />
      {/* Oturum kontrolü (B2, AuthGate). Listeler (lookups) AuthGate içinde, oturum açıkken alınır. */}
      <AuthGate>
        <RootStack background={palette.background} />
      </AuthGate>
    </ThemeProvider>
  );
}

/**
 * Ekran yığını. Hangi ekranların açılabileceğini oturum durumu belirler (B2, AuthGate):
 * oturum yoksa Giriş, Kayıt ve Onam metni, Bilgilendirme onaylanmadıysa yalnızca Bilgilendirme, açıksa uygulamanın geri kalanı.
 */
function RootStack({ background }: { background: string }) {
  const { session } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}>
      <Stack.Protected guard={session === 'guest'}>
        <Stack.Screen name="giris" />
        <Stack.Screen name="kayit" />
        <Stack.Screen name="onam" />
      </Stack.Protected>
      <Stack.Protected guard={session === 'onboarding'}>
        <Stack.Screen name="bilgilendirme" />
      </Stack.Protected>
      <Stack.Protected guard={session === 'ready'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="karsilastirma" />
        <Stack.Screen name="secilen-kombin" />
        {/* Parça ekleme akışı (B5): kaydırarak geri dönülmez; İşleniyor'da istek sürerken, Etiket onayı'nda taslak silinmeden çıkılmasın */}
        <Stack.Screen name="isleniyor" options={{ gestureEnabled: false }} />
        <Stack.Screen name="etiket-onayi" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}
