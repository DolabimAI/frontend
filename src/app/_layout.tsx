import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
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
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { LookupsProvider } from '@/context/LookupsContext';
import { useDevTokenReady } from '@/dev/use-dev-token';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
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
      {/* Listeler (lookups) bir kez alınır, bütün ekranlar useLookups ile kullanır (C.0 adım 8).
          B2'de AuthGate gelince bu sarmalayıcı AuthGate'in içine, oturum açıkken çalışacak yere taşınır. */}
      <LookupsProvider>
        <AppTabs />
      </LookupsProvider>
    </ThemeProvider>
  );
}
