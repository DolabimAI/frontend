import React from 'react';
import { View, StyleSheet, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

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
          shadowColor: scheme === 'dark' ? '#000' : '#888'
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
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    // iOS gölge ayarları
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Android gölge ayarı
    elevation: 3,
  },
});