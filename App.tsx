/**
 * App.tsx - Ponto de entrada principal do Presence Laundry Mobile
 * Integra ThemeProvider, QueryClientProvider e RootNavigator
 * M7-A-001: Configuração do callback de logout para erro 401
 */

import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeProvider } from "./src/shared/theme/ThemeProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { setOnUnauthorizedCallback } from "./src/shared/api/axiosClient";
import { useSessionStore } from "./src/features/auth/stores/session.store";

// Configuração do QueryClient para TanStack Query
// gcTime alto para manter dados em cache quando offline
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos - dados "frescos"
      gcTime: 1000 * 60 * 60 * 24, // 24 horas - mantém em cache para offline
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch quando reconectar
      networkMode: "offlineFirst", // Usa cache primeiro se offline
    },
    mutations: {
      retry: 1,
    },
  },
});

// Componente interno que configura o callback de 401
function AppWithAuth() {
  const clearCredentials = useSessionStore((state) => state.clearCredentials);

  // M7-A-001: Registra callback para logout em erro 401
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      console.warn("[App] Erro 401 detectado - realizando logout automático");
      clearCredentials();
      // Limpa cache do React Query para evitar dados stale
      queryClient.clear();
    });
  }, [clearCredentials]);

  return <RootNavigator />;
}

export default function App() {
  // Carregar fontes dos ícones
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  // Mostrar loading enquanto fontes carregam
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppWithAuth />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
