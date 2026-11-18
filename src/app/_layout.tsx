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

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });

  // Fontlar gelene kadar açılış ekranı açık kalır (AnimatedSplashOverlay onu sonra kapatır).
  // Font yüklenemezse sistem fontuyla devam edilir; uygulama takılı kalmaz.
  if (!fontsLoaded && !fontError) return null;

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
      <AppTabs />
    </ThemeProvider>
  );
}
