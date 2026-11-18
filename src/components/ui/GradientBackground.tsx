import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface GradientBackgroundProps {
  colors: readonly string[];
  /** 'vertical' üstten alta, 'diagonal' sol üstten sağ alta */
  direction?: 'vertical' | 'diagonal';
  radius?: number;
}

/**
 * Kartın arkasına degrade çizer. Ebeveyn View'da overflow: 'hidden' ve aynı
 * borderRadius olmalı. expo-linear-gradient yerine react-native-svg kullanıldı;
 * alt bar zaten svg'ye ihtiyaç duyduğu için ek paket gerekmiyor.
 */
export default function GradientBackground({
  colors,
  direction = 'vertical',
  radius = 0,
}: GradientBackgroundProps) {
  // useId ":r0:" gibi değer döner; svg url(#...) içinde güvenli olsun diye temizlenir.
  const id = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const end = direction === 'vertical' ? { x2: '0', y2: '1' } : { x2: '1', y2: '1' };
  const last = Math.max(colors.length - 1, 1);

  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" {...end}>
          {colors.map((c, i) => (
            <Stop key={c + i} offset={i / last} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" rx={radius} ry={radius} fill={`url(#${id})`} />
    </Svg>
  );
}
