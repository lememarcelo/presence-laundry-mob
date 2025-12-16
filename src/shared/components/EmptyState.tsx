/**
 * EmptyState - Componente de estado vazio
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  fullScreen?: boolean;
}

export function EmptyState({
  title = 'Nenhum dado encontrado',
  message = 'Não há informações para exibir no momento.',
  icon = 'folder-open-outline',
  fullScreen = false,
}: EmptyStateProps) {
  const { colors, tokens } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${colors.mutedText}20` },
        ]}
      >
        <Ionicons name={icon} size={48} color={colors.mutedText} />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            fontSize: tokens.typography.h4,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: colors.textSecondary,
            fontSize: tokens.typography.body,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
