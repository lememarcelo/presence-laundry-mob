/**
 * KPICard Component - Card individual de KPI
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { KPICard as KPICardType } from "@/models/dashboard.models";

interface KPICardProps {
  data: KPICardType;
}

export function KPICardComponent({ data }: KPICardProps) {
  const { colors, tokens } = useTheme();

  const trendColor =
    data.trend === "up"
      ? "#10B981"
      : data.trend === "down"
      ? "#EF4444"
      : colors.mutedText;

  const trendIcon =
    data.trend === "up"
      ? "trending-up"
      : data.trend === "down"
      ? "trending-down"
      : "minus";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Header com ícone */}
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: data.color + "20" }]}
        >
          <MaterialCommunityIcons
            name={data.icon as any}
            size={24}
            color={data.color}
          />
        </View>
        <View
          style={[styles.trendBadge, { backgroundColor: trendColor + "20" }]}
        >
          <MaterialCommunityIcons
            name={trendIcon}
            size={14}
            color={trendColor}
          />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {Math.abs(data.percentChange ?? 0).toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Valor principal */}
      <Text
        style={[
          styles.value,
          { color: colors.textPrimary, fontSize: tokens.typography.h2 },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {data.formattedValue}
      </Text>

      {/* Título */}
      <Text
        style={[
          styles.title,
          { color: colors.mutedText, fontSize: tokens.typography.caption },
        ]}
      >
        {data.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontWeight: "700",
    marginBottom: 4,
  },
  title: {
    fontWeight: "500",
  },
});
