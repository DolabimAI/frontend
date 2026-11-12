import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = 'Yükleniyor...' }: LoadingProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.tint} />
      {text ? <Text style={[styles.text, { color: theme.textSecondary }]}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});