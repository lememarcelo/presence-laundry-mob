/**
 * KPIDetailModal - Modal com detalhes do KPI
 * M2-K-003: Tooltip/detail ao tocar em KPI card
 * Exibe breakdown do cálculo, valores comparativos e tendência
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { KPICard } from "@/models/dashboard.models";

const { width: screenWidth } = Dimensions.get("window");

export interface KPIBreakdown {
  label: string;
  value: string;
  subValue?: string;
  icon?: string;
}

export interface KPIDetailData extends KPICard {
  /** Breakdown detalhado do cálculo */
  breakdown?: KPIBreakdown[];
  /** Descrição textual do KPI */
  description?: string;
  /** Período de referência */
  periodo?: string;
  /** Meta, se aplicável */
  meta?: string;
  /** Percentual atingido da meta */
  metaAtingida?: number;
}

interface KPIDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: KPIDetailData | null;
}

export function KPIDetailModal({
  visible,
  onClose,
  data,
}: KPIDetailModalProps) {
  const { colors, tokens } = useTheme();

  if (!data) return null;

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

  const trendLabel =
    data.trend === "up"
      ? "Crescimento"
      : data.trend === "down"
      ? "Queda"
      : "Estável";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar modal"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: data.color + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={data.icon as any}
                  size={28}
                  color={data.color}
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.textPrimary,
                      fontSize: tokens.typography.h3,
                    },
                  ]}
                >
                  {data.title}
                </Text>
                {data.periodo && (
                  <Text style={[styles.periodo, { color: colors.mutedText }]}>
                    {data.periodo}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.mutedText}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Valor Principal */}
            <View style={styles.mainValueSection}>
              <Text
                style={[
                  styles.mainValue,
                  { color: colors.textPrimary, fontSize: tokens.typography.h1 },
                ]}
              >
                {data.formattedValue}
              </Text>

              {/* Badge de Variação */}
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: trendColor + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={trendIcon}
                  size={18}
                  color={trendColor}
                />
                <Text style={[styles.trendText, { color: trendColor }]}>
                  {Math.abs(data.percentChange ?? 0).toFixed(1)}% {trendLabel}
                </Text>
              </View>
            </View>

            {/* Descrição */}
            {data.description && (
              <View style={styles.descriptionSection}>
                <Text
                  style={[styles.descriptionText, { color: colors.mutedText }]}
                >
                  {data.description}
                </Text>
              </View>
            )}

            {/* Comparativo com Período Anterior */}
            {data.previousValue !== undefined && (
              <View
                style={[
                  styles.compareSection,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Comparativo
                </Text>
                <View style={styles.compareRow}>
                  <View style={styles.compareItem}>
                    <Text
                      style={[styles.compareLabel, { color: colors.mutedText }]}
                    >
                      Período Atual
                    </Text>
                    <Text
                      style={[
                        styles.compareValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {data.formattedValue}
                    </Text>
                  </View>
                  <View style={styles.compareDivider}>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color={colors.mutedText}
                    />
                  </View>
                  <View style={styles.compareItem}>
                    <Text
                      style={[styles.compareLabel, { color: colors.mutedText }]}
                    >
                      Período Anterior
                    </Text>
                    <Text
                      style={[styles.compareValue, { color: colors.mutedText }]}
                    >
                      {typeof data.previousValue === "number"
                        ? data.formattedValue?.startsWith("R$")
                          ? `R$ ${data.previousValue.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : data.previousValue.toLocaleString("pt-BR")
                        : data.previousValue}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Meta */}
            {data.meta && (
              <View
                style={[
                  styles.metaSection,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.metaHeader}>
                  <MaterialCommunityIcons
                    name="flag-checkered"
                    size={20}
                    color={colors.accent}
                  />
                  <Text
                    style={[styles.sectionTitle, { color: colors.textPrimary }]}
                  >
                    Meta
                  </Text>
                </View>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                  {data.meta}
                </Text>
                {data.metaAtingida !== undefined && (
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: colors.cardBorder },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(data.metaAtingida, 100)}%`,
                            backgroundColor:
                              data.metaAtingida >= 100
                                ? "#10B981"
                                : colors.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.progressText, { color: colors.mutedText }]}
                    >
                      {data.metaAtingida.toFixed(0)}% atingido
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Breakdown Detalhado */}
            {data.breakdown && data.breakdown.length > 0 && (
              <View style={styles.breakdownSection}>
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Detalhamento
                </Text>
                {data.breakdown.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.breakdownItem,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {item.icon && (
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={data.color}
                        style={styles.breakdownIcon}
                      />
                    )}
                    <View style={styles.breakdownContent}>
                      <Text
                        style={[
                          styles.breakdownLabel,
                          { color: colors.mutedText },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.breakdownValue,
                          { color: colors.textPrimary },
                        ]}
                      >
                        {item.value}
                      </Text>
                      {item.subValue && (
                        <Text
                          style={[
                            styles.breakdownSubValue,
                            { color: colors.mutedText },
                          ]}
                        >
                          {item.subValue}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: screenWidth - 40,
    maxHeight: "80%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
  },
  periodo: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    padding: 16,
  },
  mainValueSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainValue: {
    fontWeight: "700",
    marginBottom: 8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "600",
  },
  descriptionSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  compareSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compareItem: {
    flex: 1,
    alignItems: "center",
  },
  compareDivider: {
    paddingHorizontal: 8,
  },
  compareLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  compareValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  metaSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  breakdownIcon: {
    marginRight: 12,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  breakdownSubValue: {
    fontSize: 11,
    marginTop: 2,
  },
});
