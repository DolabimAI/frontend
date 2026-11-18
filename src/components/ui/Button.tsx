import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { Colors, Radius, Type } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled = false, loading = false }: ButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Buton arka plan rengini belirler
  const getBgColor = () => {
    if (disabled) return theme.border;
    if (variant === 'outline') return 'transparent';
    if (variant === 'danger') return theme.error;
    return theme.primary; // Template'teki lacivert "Continue" düğmesi
  };

  // Metin rengini belirler
  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    if (variant === 'outline') return theme.primary;
    return theme.onPrimary;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderColor: variant === 'outline' ? theme.primary : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: Type.bold,
  },
});