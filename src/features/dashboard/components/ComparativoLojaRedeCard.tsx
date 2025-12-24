/**
 * ComparativoLojaRedeCard - Card que compara métricas da loja com a média da rede
 * M2-K-004
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";

interface ComparativoMetrica {
  label: string;
  valorLoja: number;
  valorRede: number;
  formatador?: (valor: number) => string;
}

interface ComparativoLojaRedeCardProps {
  nomeLoja: string;
  metricas: ComparativoMetrica[];
  isLoading?: boolean;
}

function formatCurrency(valor: number): string {
  return `R$ ${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatNumber(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

function formatPercent(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export function ComparativoLojaRedeCard({
  nomeLoja,
  metricas,
  isLoading = false,
}: ComparativoLojaRedeCardProps) {
  const { colors, tokens } = useTheme();

  if (isLoading) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
        ]}
      >
        <View style={styles.loadingPlaceholder}>
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando comparativo...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="scale-balance"
            size={20}
            color={colors.accent}
          />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Comparativo
          </Text>
        </View>
        <Text style={[styles.lojaName, { color: colors.mutedText }]}>
          {nomeLoja}
        </Text>
      </View>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.accent }]}
          />
          <Text style={[styles.legendText, { color: colors.mutedText }]}>
            Sua Loja
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#8E8E93" }]} />
          <Text style={[styles.legendText, { color: colors.mutedText }]}>
            Média da Rede
          </Text>
        </View>
      </View>

      {/* Métricas */}
      {metricas.map((metrica, index) => {
        const formatador = metrica.formatador || formatNumber;
        const diferenca = metrica.valorLoja - metrica.valorRede;
        const percentDif =
          metrica.valorRede > 0
            ? ((diferenca / metrica.valorRede) * 100).toFixed(1)
            : "0";
        const isPositive = diferenca >= 0;

        // Calcula a barra de progresso relativa
        const maxVal = Math.max(metrica.valorLoja, metrica.valorRede);
        const lojaPercent = maxVal > 0 ? (metrica.valorLoja / maxVal) * 100 : 0;
        const redePercent = maxVal > 0 ? (metrica.valorRede / maxVal) * 100 : 0;

        return (
          <View key={index} style={styles.metricaRow}>
            <View style={styles.metricaHeader}>
              <Text
                style={[styles.metricaLabel, { color: colors.textPrimary }]}
              >
                {metrica.label}
              </Text>
              <View
                style={[
                  styles.diffBadge,
                  {
                    backgroundColor: isPositive
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={isPositive ? "arrow-up" : "arrow-down"}
                  size={12}
                  color={isPositive ? "#10B981" : "#EF4444"}
                />
                <Text
                  style={[
                    styles.diffText,
                    { color: isPositive ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {Math.abs(Number(percentDif))}%
                </Text>
              </View>
            </View>

            {/* Barras comparativas */}
            <View style={styles.barsContainer}>
              {/* Barra da Loja */}
              <View style={styles.barRow}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${lojaPercent}%`,
                        backgroundColor: colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barValue, { color: colors.textPrimary }]}>
                  {formatador(metrica.valorLoja)}
                </Text>
              </View>

              {/* Barra da Rede */}
              <View style={styles.barRow}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${redePercent}%`,
                        backgroundColor: "#8E8E93",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barValue, { color: colors.mutedText }]}>
                  {formatador(metrica.valorRede)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Formatadores exportados para uso externo
export const formatadores = {
  currency: formatCurrency,
  number: formatNumber,
  percent: formatPercent,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  lojaName: {
    fontSize: 13,
    fontWeight: "500",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  metricaRow: {
    marginBottom: 16,
  },
  metricaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  metricaLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "600",
  },
  barsContainer: {
    gap: 6,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
});
