/**
 * Main Tabs - Bottom Tabs com as 4 telas principais do Dashboard
 * KPIs | Gráficos | Mapas | Ranking
 *
 * M6-U-004: Lazy loading das telas secundárias para otimizar carregamento inicial
 */

import React, { lazy, Suspense, ComponentType } from "react";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { MainTabsParamList } from "./types";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useSessionStore } from "@/features/auth/stores/session.store";

// Tela principal - carregada imediatamente
import { KPIsScreen } from "@/features/dashboard/screens/KPIsScreen";

// M6-U-004: Lazy load das telas secundárias (usando named exports)
const ChartsScreen = lazy(() =>
  import("@/features/dashboard/screens/ChartsScreen").then((module) => ({
    default: module.ChartsScreen,
  }))
);
const HeatmapScreen = lazy(() =>
  import("@/features/dashboard/screens/HeatmapScreen").then((module) => ({
    default: module.HeatmapScreen,
  }))
);
const RankingScreen = lazy(() =>
  import("@/features/dashboard/screens/RankingScreen").then((module) => ({
    default: module.RankingScreen,
  }))
);

// Componente de fallback para lazy loading
function LazyFallback() {
  const { tokens } = useTheme();
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

// HOC para envolver componentes lazy com Suspense
function withLazyLoading<P extends object>(
  LazyComponent: ComponentType<P>
): React.FC<P> {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Componentes com lazy loading
const LazyChartsScreen = withLazyLoading(ChartsScreen);
const LazyHeatmapScreen = withLazyLoading(HeatmapScreen);
const LazyRankingScreen = withLazyLoading(RankingScreen);

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { tokens } = useTheme();
  const clearCredentials = useSessionStore((state) => state.clearCredentials);
  const queryClient = useQueryClient();

  const handleLogout = React.useCallback(() => {
    queryClient.clear();
    clearCredentials();
  }, [queryClient, clearCredentials]);

  const LogoutButton = React.useCallback(
    () => (
      <TouchableOpacity
        onPress={handleLogout}
        style={{ marginRight: 16, padding: 4 }}
        accessibilityLabel="Sair do aplicativo"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="logout"
          size={24}
          color={tokens.palette.accentText}
        />
      </TouchableOpacity>
    ),
    [handleLogout, tokens.palette.accentText]
  );

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: tokens.palette.accent,
        tabBarInactiveTintColor: tokens.palette.mutedText,
        tabBarStyle: {
          backgroundColor: tokens.palette.surface,
          borderTopColor: tokens.palette.cardBorder,
        },
        headerStyle: {
          backgroundColor: tokens.palette.accent,
        },
        headerTintColor: tokens.palette.accentText,
        headerRight: LogoutButton,
      }}
    >
      <Tab.Screen
        name="KPIs"
        component={KPIsScreen}
        options={{
          title: "Indicadores",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-box"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Charts"
        component={LazyChartsScreen}
        options={{
          title: "Gráficos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Heatmap"
        component={LazyHeatmapScreen}
        options={{
          title: "Mapas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Ranking"
        component={LazyRankingScreen}
        options={{
          title: "Ranking",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
