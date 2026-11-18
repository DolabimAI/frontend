import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TabBarHeight } from '@/constants/theme';

/**
 * Kripto template'indeki oyuklu alt bar şekli (Figma: "Alt bar / Zemin", 390×102).
 * Alt köşeler düzleştirildi: bar ekranın altına yapışık durur, altındaki güvenli
 * alan (iPhone ev çubuğu) aynı renkte düz bir şeritle kapatılır.
 */
const NOTCH_PATH =
  'M0 15.2968C0 7.56477 6.24405 1.3023 13.9759 1.34546C35.3506 1.46479 77.5728 1.87648 114.5 3.29675' +
  'C159 8.79688 158.985 47.108 195 47.2967C231.357 47.4873 236.5 10.2969 276.5 2.29675' +
  'C305.641 -1.02303 353.559 0.011212 376.688 0.782019C384.159 1.03099 390 7.17541 390 14.6503' +
  'V102.297H0V15.2968Z';

export default function TabBarBackground({ color, bottomInset }: { color: string; bottomInset: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height={TabBarHeight} viewBox="0 0 390 102" preserveAspectRatio="none">
        <Path d={NOTCH_PATH} fill={color} />
      </Svg>
      {bottomInset > 0 ? <View style={{ height: bottomInset, backgroundColor: color }} /> : null}
    </View>
  );
}
