import React from 'react';
import { Image, StyleSheet, Text, View, useColorScheme } from 'react-native';

import CategoryBadge, { type CategoryCode } from '@/components/CategoryBadge';
import { Colors, Radius, Type } from '@/constants/theme';

const KNOWN_CODES: CategoryCode[] = ['ust', 'alt', 'tek_parca', 'dis', 'ayakkabi', 'aksesuar'];

interface OutfitTileProps {
  imageUrl: string;
  /** Kategori kodu (lookups categories value), ör. "ust" */
  categoryCode: string;
  /** Kategori adı, ör. "Üst" (görsel yokken yer tutucuda yazılır) */
  categoryLabel: string;
  size?: 'normal' | 'small';
}

/**
 * Kombindeki bir parça: görsel varsa görsel, yoksa (mock) kategori simgeli yer tutucu.
 * Karşılaştırma kartlarında ve Seçilen kombin ekranında kullanılır.
 */
export default function OutfitTile({ imageUrl, categoryCode, categoryLabel, size = 'normal' }: OutfitTileProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = Colors[scheme];
  const height = size === 'small' ? 64 : 92;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.tile, { height, backgroundColor: theme.backgroundSelected }]}
        resizeMode="cover"
        accessibilityLabel={categoryLabel}
      />
    );
  }

  const code = (KNOWN_CODES as string[]).includes(categoryCode) ? (categoryCode as CategoryCode) : 'ust';
  return (
    <View style={[styles.tile, styles.placeholder, { height, backgroundColor: theme.backgroundSelected }]}>
      <CategoryBadge code={code} size={size === 'small' ? 32 : 40} />
      {size === 'normal' ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{categoryLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontFamily: Type.regular, fontSize: 12 },
});
