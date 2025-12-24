/**
 * SkeletonCard - Componente de loading skeleton para KPI cards
 *
 * Exibe um placeholder animado enquanto os dados estão carregando,
 * melhorando a percepção de performance e evitando layout shift.
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/shared/theme/ThemeProvider";

interface SkeletonCardProps {
  /** Largura do card (default: 100%) */
  width?: number | string;
  /** Altura do card (default: 120) */
  height?: number;
  /** Variante do skeleton */
  variant?: "kpi" | "chart" | "list-item";
}

/**
 * Componente de loading skeleton com animação de pulse
 */
export function SkeletonCard({
  width = "100%",
  height = 120,
  variant = "kpi",
}: SkeletonCardProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const renderKpiSkeleton = () => (
    <>
      <View style={styles.kpiHeader}>
        <Animated.View
          style={[
            styles.iconSkeleton,
            { backgroundColor: colors.cardBorder, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.badgeSkeleton,
            { backgroundColor: colors.cardBorder, opacity: pulseAnim },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.valueSkeleton,
          { backgroundColor: colors.cardBorder, opacity: pulseAnim },
        ]}
      />
      <Animated.View
        style={[
          styles.labelSkeleton,
          { backgroundColor: colors.cardBorder, opacity: pulseAnim },
        ]}
      />
    </>
  );

  const renderChartSkeleton = () => (
    <>
      <Animated.View
        style={[
          styles.chartTitleSkeleton,
          { backgroundColor: colors.cardBorder, opacity: pulseAnim },
        ]}
      />
      <Animated.View
        style={[
          styles.chartAreaSkeleton,
          {
            backgroundColor: colors.cardBorder,
            opacity: pulseAnim,
            height: height - 60,
          },
        ]}
      />
    </>
  );

  const renderListItemSkeleton = () => (
    <View style={styles.listItemRow}>
      <Animated.View
        style={[
          styles.listAvatarSkeleton,
          { backgroundColor: colors.cardBorder, opacity: pulseAnim },
        ]}
      />
      <View style={styles.listContent}>
        <Animated.View
          style={[
            styles.listTitleSkeleton,
            { backgroundColor: colors.cardBorder, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.listSubtitleSkeleton,
            { backgroundColor: colors.cardBorder, opacity: pulseAnim },
          ]}
        />
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: typeof width === "number" ? width : undefined,
          height,
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
        typeof width === "string" && width === "100%" && { flex: 1 },
      ]}
      accessibilityLabel="Carregando..."
      accessibilityRole="progressbar"
    >
      {variant === "kpi" && renderKpiSkeleton()}
      {variant === "chart" && renderChartSkeleton()}
      {variant === "list-item" && renderListItemSkeleton()}
    </View>
  );
}

/**
 * Grid de skeletons para a tela de KPIs
 */
export function KPISkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant="kpi" />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
  },
  // KPI variant
  kpiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  badgeSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
  valueSkeleton: {
    width: "70%",
    height: 28,
    borderRadius: 6,
    marginBottom: 8,
  },
  labelSkeleton: {
    width: "50%",
    height: 14,
    borderRadius: 4,
  },
  // Chart variant
  chartTitleSkeleton: {
    width: "60%",
    height: 20,
    borderRadius: 4,
    marginBottom: 16,
  },
  chartAreaSkeleton: {
    width: "100%",
    borderRadius: 8,
  },
  // List item variant
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listAvatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  listContent: {
    flex: 1,
    gap: 8,
  },
  listTitleSkeleton: {
    width: "80%",
    height: 16,
    borderRadius: 4,
  },
  listSubtitleSkeleton: {
    width: "50%",
    height: 12,
    borderRadius: 4,
  },
});
