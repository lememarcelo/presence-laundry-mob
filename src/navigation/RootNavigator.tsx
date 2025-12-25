/**
 * Root Navigator - Navegador raiz da aplicação
 * Decide entre AuthStack (não autenticado) e MainTabs (autenticado)
 * M6-U-004: Prefetch de dados críticos após autenticação
 */

import React, { useEffect, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { usePrefetchDashboard } from "@/features/dashboard/hooks/useDashboardQueries";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, loadStoredCredentials, isLoading } =
    useSessionStore();
  const { tokens, colors } = useTheme();
  const { prefetchCriticalData } = usePrefetchDashboard();

  // Carrega credenciais ao iniciar o app
  useEffect(() => {
    loadStoredCredentials();
  }, [loadStoredCredentials]);

  // M6-U-004: Prefetch dados críticos quando autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Prefetch em background após pequeno delay para não bloquear UI
      const timer = setTimeout(() => {
        prefetchCriticalData();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, prefetchCriticalData]);

  // Mostra loading enquanto verifica credenciais
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: tokens.palette.background,
        }}
      >
        <ActivityIndicator size="large" color={tokens.palette.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: tokens.mode === "dark",
        colors: {
          primary: tokens.palette.accent,
          background: tokens.palette.background,
          card: tokens.palette.surface,
          text: tokens.palette.textPrimary,
          border: tokens.palette.cardBorder,
          notification: tokens.palette.accent,
        },
        fonts: {
          regular: {
            fontFamily: "System",
            fontWeight: "400" as const,
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500" as const,
          },
          bold: {
            fontFamily: "System",
            fontWeight: "700" as const,
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "900" as const,
          },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
