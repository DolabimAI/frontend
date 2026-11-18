import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

/** C# wardrobe/status cevabındaki kategori kodları (C.4). */
export type CategoryCode = 'ust' | 'alt' | 'tek_parca' | 'dis' | 'ayakkabi';

// Figma "Rozet/..." bileşenleriyle aynı yollar ve renkler (template'teki House/Condo/Villa rozetleri).
const BADGES: Record<CategoryCode, { bg: string; fg: string; d: string[] }> = {
  ust: {
    bg: '#E1E7FE',
    fg: '#325EF1',
    d: [
      'M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z',
    ],
  },
  alt: {
    bg: '#F6E6F6',
    fg: '#E05FA8',
    d: ['M6 2h12l1 20h-5l-2-12-2 12H5z', 'M6 6h12'],
  },
  tek_parca: {
    bg: '#FFE3D3',
    fg: '#E07B39',
    d: ['M9 2h6l-1 5 4 14H6l4-14z', 'M10 7h4'],
  },
  ayakkabi: {
    bg: '#F4E7FF',
    fg: '#B558FE',
    d: ['M2 17v-6l4-1 3 3 6 1c3 .5 5 2 7 4v1H2z', 'M2 20h20'],
  },
  dis: {
    bg: '#CDEDF1',
    fg: '#0E9AA7',
    d: ['M8 3 4 6v15h5V9M16 3l4 3v15h-5V9M8 3l4 4 4-4M12 7v14'],
  },
};

export default function CategoryBadge({ code, size = 44 }: { code: CategoryCode; size?: number }) {
  const b = BADGES[code];
  const icon = Math.round(size * 0.5);
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: b.bg }]}>
      <Svg width={icon} height={icon} viewBox="0 0 24 24" fill="none">
        <G stroke={b.fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {b.d.map((d) => (
            <Path key={d} d={d} />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
