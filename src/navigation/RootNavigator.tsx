/**
 * Root Navigator - Navegador raiz da aplicação
 * Decide entre AuthStack (não autenticado) e MainTabs (autenticado)
 */

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { useSessionStore } from "@/features/auth/stores/useSessionStore";
import { useTheme } from "@/shared/theme/ThemeProvider";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, loadCredentials } = useSessionStore();
  const { tokens } = useTheme();

  // Carrega credenciais ao iniciar o app
  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

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
