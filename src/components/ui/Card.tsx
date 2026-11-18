import React from 'react';
import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export default function Card({ children, style, ...props }: CardProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.card,
          shadowColor: theme.shadow
        }, 
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: 16,
    marginVertical: 8,
    // iOS gölge ayarları
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    // Android gölge ayarı
    elevation: 3,
  },
});