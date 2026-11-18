import { Platform } from 'react-native';

/**
 * DolabımAI teması (18 Kasım, ekip onayı).
 * Kaynak: Figma "Real estate Mobile App" kopyası → DolabımAI sayfası.
 *  - Genel görünüm: emlak template'i (mor #A873EB, lacivert #05293C, açık zemin #F5F6FF)
 *  - Alt bar: kripto template'i (#261863, ortada degrade Ekle düğmesi)
 *
 * Eski anahtarlar (text, tint, card, border ...) korunuyor; ui/ bileşenleri
 * ve mevcut ekranlar değişmeden yeni renkleri alıyor.
 */

const purple = '#A873EB';
const navy = '#05293C';

export const Colors = {
  light: {
    text: '#05293C',
    textSecondary: '#5B6B7C',
    background: '#F5F6FF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EFE6FC',
    card: '#FFFFFF',
    tint: purple, // vurgu: seçili çip, bağlantı, yükleniyor göstergesi
    primary: navy, // ana düğme (template'teki "Continue")
    onPrimary: '#FFFFFF',
    link: '#375FE3',
    icon: '#5B6B7C',
    tabIconDefault: 'rgba(255,255,255,0.6)',
    tabIconSelected: '#E2A8FF',
    tabBar: '#261863',
    border: '#E3E6F3',
    error: '#D32F2F',
    shadow: '#604AA4',
  },
  dark: {
    text: '#EEF0FF',
    textSecondary: '#A3A9C9',
    background: '#0E1024',
    backgroundElement: '#1A1D3A',
    backgroundSelected: '#2A2350',
    card: '#1A1D3A',
    tint: '#B98BF2',
    primary: purple,
    onPrimary: '#FFFFFF',
    link: '#8FA8FF',
    icon: '#A3A9C9',
    tabIconDefault: 'rgba(255,255,255,0.6)',
    tabIconSelected: '#E2A8FF',
    tabBar: '#1B1147',
    border: '#2E3258',
    error: '#F44336',
    shadow: '#000000',
  },
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Kart degradeleri (üstten alta). Figma'daki pembe/mavi mülk kartları ve mor karşılama kartı. */
export const Gradients = {
  light: {
    hero: ['#A873EB', '#7E5BDF'],
    warning: ['#FFB3BF', '#FFE8EB'],
    pink: ['#FF8899', '#FFE8EB'],
    blue: ['#A7D3FD', '#EAF5FF'],
    addButton: ['#8462E1', '#55389B', '#351B6F'],
  },
  dark: {
    hero: ['#7E5BDF', '#4B2FA0'],
    warning: ['#5A2A3A', '#3A1E2A'],
    pink: ['#6B2E44', '#2E1A2A'],
    blue: ['#1F4A75', '#16263F'],
    addButton: ['#8462E1', '#55389B', '#351B6F'],
  },
} as const;

/** Degrade kart üstündeki yazı renkleri (açık degradede lacivert, koyuda beyaz). */
export const OnGradient = {
  light: { title: '#05293C', body: 'rgba(5,41,60,0.75)' },
  dark: { title: '#FFFFFF', body: 'rgba(255,255,255,0.75)' },
};

/**
 * Lato (Gill Sans'ın yerine; Gill Sans ücretli ve Figma'da yok).
 * _layout.tsx'te @expo-google-fonts/lato ile yüklenir.
 * Android'de özel fontla fontWeight kullanılmaz; kalınlık aile adından gelir.
 */
export const Type = {
  light: 'Lato_300Light',
  regular: 'Lato_400Regular',
  bold: 'Lato_700Bold',
  black: 'Lato_900Black',
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Alt barın güvenli alan hariç yüksekliği (Figma: 375 genişlikte 98; telefonda biraz daha basık). */
export const TabBarHeight = 84;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
