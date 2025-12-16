/**
 * Main Tabs - Bottom Tabs com as 4 telas principais do Dashboard
 * KPIs | Gráficos | Mapas | Ranking
 */

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MainTabsParamList } from "./types";
import { useTheme } from "@/shared/theme/ThemeProvider";

// Telas do Dashboard
import { KPIsScreen } from "@/features/dashboard/screens/KPIsScreen";
import { ChartsScreen } from "@/features/dashboard/screens/ChartsScreen";
import { HeatmapScreen } from "@/features/dashboard/screens/HeatmapScreen";
import { RankingScreen } from "@/features/dashboard/screens/RankingScreen";

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { tokens } = useTheme();

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
        component={ChartsScreen}
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
        component={HeatmapScreen}
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
        component={RankingScreen}
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
