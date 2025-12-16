/**
 * Card - Componente base para containers com elevação
 */

import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@shared/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
}

export function Card({ children, variant = 'default', style, ...props }: CardProps) {
  const { colors, tokens } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderRadius: tokens.borderRadius.lg,
    },
    variant === 'default' && tokens.shadow.md,
    variant === 'outlined' && {
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});
