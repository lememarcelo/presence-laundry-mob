/**
 * LoadingState - Componente de estado de carregamento
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingState({
  message = 'Carregando...',
  size = 'large',
  fullScreen = false,
}: LoadingStateProps) {
  const { colors, tokens } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: fullScreen ? colors.background : 'transparent' },
      ]}
    >
      <ActivityIndicator size={size} color={colors.accent} />
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: tokens.typography.bodySmall,
            },
          ]}
        >
          {message}
        </Text>
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
  message: {
    marginTop: 12,
  },
});
