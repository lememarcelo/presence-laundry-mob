/**
 * OfflineIndicator - Componente que mostra status de conexão
 * M6-U-003: Modo offline com cache local
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useIsOnline } from "../hooks/useOfflineStatus";

interface OfflineIndicatorProps {
  cacheAge?: string;
  onRefresh?: () => void;
}

export function OfflineIndicator({
  cacheAge,
  onRefresh,
}: OfflineIndicatorProps) {
  const { colors } = useTheme();
  const isOnline = useIsOnline();

  // Não mostrar nada se estiver online
  if (isOnline) return null;

  return (
    <View style={[styles.container, { backgroundColor: "#FEF3C7" }]}>
      <MaterialCommunityIcons name="wifi-off" size={16} color="#D97706" />
      <Text style={styles.text}>
        Modo offline
        {cacheAge ? ` • Dados de ${cacheAge}` : ""}
      </Text>
      {onRefresh && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          accessibilityRole="button"
          accessibilityLabel="Tentar reconectar"
        >
          <MaterialCommunityIcons name="refresh" size={16} color="#D97706" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Banner compacto para uso em headers
 */
export function OfflineBanner() {
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="cloud-off-outline" size={14} color="#FFF" />
      <Text style={styles.bannerText}>Offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#92400E",
  },
  refreshButton: {
    padding: 4,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F59E0B",
    paddingVertical: 4,
    gap: 6,
  },
  bannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
});
