/**
 * ErrorState - Componente de estado de erro
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shared/theme';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Ocorreu um erro',
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
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
          { backgroundColor: `${colors.danger}20` },
        ]}
      >
        <Ionicons name="alert-circle" size={48} color={colors.danger} />
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

      {onRetry && (
        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor: colors.accent,
              borderRadius: tokens.borderRadius.md,
            },
          ]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={colors.accentText} />
          <Text
            style={[
              styles.retryText,
              {
                color: colors.accentText,
                fontSize: tokens.typography.body,
              },
            ]}
          >
            Tentar novamente
          </Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  retryText: {
    fontWeight: '600',
  },
});
