/**
 * App.tsx - Ponto de entrada principal do Presence Laundry Mobile
 * Integra ThemeProvider, QueryClientProvider e RootNavigator
 */

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeProvider } from "./src/shared/theme/ThemeProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";

// Configuração do QueryClient para TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

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
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
