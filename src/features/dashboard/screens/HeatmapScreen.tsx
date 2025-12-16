/**
 * Heatmap Screen - Tela de mapas de calor
 * Exibe distribuição temporal das métricas por dia/hora
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { mockHeatmapData } from "../data/mock-data";
import {
  useMapaTemporal,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import { DadosHeatmapTemporal } from "../api/dashboard.service";
import { HeatmapData } from "@/models/dashboard.models";

const screenWidth = Dimensions.get("window").width;

// Transforma dados da API para formato local
function transformHeatmapFromAPI(data: DadosHeatmapTemporal): HeatmapData {
  // Validar dados antes de processar
  if (!data || !data.valores || !Array.isArray(data.valores)) {
    console.log("[HeatmapScreen] Invalid data, returning mock", data);
    return mockHeatmapData;
  }

  // Normaliza valores para escala 0-1
  const maxVal = data.maxValor || 1;
  const normalizedValues = data.valores.map((row) =>
    Array.isArray(row) ? row.map((val) => val / maxVal) : []
  );

  return {
    id: "mapa-temporal",
    title: data.titulo || "Mapa de Calor Temporal",
    xLabels: data.diasSemana || [
      "Seg",
      "Ter",
      "Qua",
      "Qui",
      "Sex",
      "Sáb",
      "Dom",
    ],
    yLabels: data.horas || ["08h", "10h", "12h", "14h", "16h", "18h", "20h"],
    values: normalizedValues,
    minValue: 0,
    maxValue: 1,
    colorScale: ["#EFF6FF", "#3B82F6", "#1E3A8A"],
  };
}

// Função para interpolar cores do heatmap
function getHeatColor(value: number, colors: string[]): string {
  // Escala de 0 a 1
  const intensity = Math.min(Math.max(value, 0), 1);

  if (intensity < 0.3) {
    return "#EFF6FF"; // Muito baixo
  } else if (intensity < 0.5) {
    return "#BFDBFE"; // Baixo
  } else if (intensity < 0.7) {
    return "#60A5FA"; // Médio
  } else if (intensity < 0.85) {
    return "#3B82F6"; // Alto
  } else {
    return "#1D4ED8"; // Muito alto
  }
}

export function HeatmapScreen() {
  const { colors, tokens } = useTheme();
  const { invalidateMapaTemporal } = useInvalidateDashboard();

  // Query para mapa temporal
  const {
    data: mapaTemporalAPI,
    isLoading,
    isFetching,
    refetch,
  } = useMapaTemporal();

  // Transforma dados da API ou usa mock como fallback
  const heatmapData = useMemo(() => {
    if (mapaTemporalAPI && mapaTemporalAPI.valores) {
      return transformHeatmapFromAPI(mapaTemporalAPI);
    }
    return mockHeatmapData;
  }, [mapaTemporalAPI]);

  const onRefresh = React.useCallback(async () => {
    await invalidateMapaTemporal();
    refetch();
  }, [invalidateMapaTemporal, refetch]);

  const cellSize = (screenWidth - 80) / (heatmapData.xLabels?.length || 7);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando mapa de calor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Heatmap de Movimento */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="grid"
              size={24}
              color={colors.accent}
            />
            <View>
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.textPrimary, fontSize: tokens.typography.h3 },
                ]}
              >
                {heatmapData.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.mutedText }]}>
                Intensidade de movimento por período
              </Text>
            </View>
          </View>

          {/* Grid do Heatmap */}
          <View style={styles.heatmapContainer}>
            {/* Header com dias */}
            <View style={styles.heatmapRow}>
              <View style={[styles.labelCell, { width: 40 }]} />
              {heatmapData.xLabels.map((day, idx) => (
                <View
                  key={idx}
                  style={[styles.headerCell, { width: cellSize }]}
                >
                  <Text
                    style={[styles.headerText, { color: colors.mutedText }]}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rows com horas */}
            {heatmapData.yLabels.map((hour, rowIdx) => (
              <View key={rowIdx} style={styles.heatmapRow}>
                <View style={[styles.labelCell, { width: 40 }]}>
                  <Text style={[styles.labelText, { color: colors.mutedText }]}>
                    {hour}
                  </Text>
                </View>
                {heatmapData.values[rowIdx]?.map((value, colIdx) => (
                  <View
                    key={colIdx}
                    style={[
                      styles.heatCell,
                      {
                        width: cellSize,
                        height: cellSize * 0.8,
                        backgroundColor: getHeatColor(
                          value,
                          heatmapData.colorScale
                        ),
                      },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Legenda */}
          <View style={styles.legendContainer}>
            <Text style={[styles.legendLabel, { color: colors.mutedText }]}>
              Baixo
            </Text>
            <View style={styles.legendGradient}>
              {["#EFF6FF", "#BFDBFE", "#60A5FA", "#3B82F6", "#1D4ED8"].map(
                (color, idx) => (
                  <View
                    key={idx}
                    style={[styles.legendColor, { backgroundColor: color }]}
                  />
                )
              )}
            </View>
            <Text style={[styles.legendLabel, { color: colors.mutedText }]}>
              Alto
            </Text>
          </View>
        </View>

        {/* Insights do Heatmap */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={20}
              color="#F59E0B"
            />
            <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
              Análise de Padrões
            </Text>
          </View>

          <View style={styles.insightItem}>
            <MaterialCommunityIcons
              name="clock-time-four"
              size={18}
              color={colors.accent}
            />
            <View style={styles.insightContent}>
              <Text
                style={[styles.insightLabel, { color: colors.textPrimary }]}
              >
                Horário de Pico
              </Text>
              <Text style={[styles.insightValue, { color: colors.mutedText }]}>
                18h às 20h (sexta e sábado)
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <MaterialCommunityIcons
              name="calendar-star"
              size={18}
              color="#10B981"
            />
            <View style={styles.insightContent}>
              <Text
                style={[styles.insightLabel, { color: colors.textPrimary }]}
              >
                Melhor Dia
              </Text>
              <Text style={[styles.insightValue, { color: colors.mutedText }]}>
                Sábado - 95% de ocupação às 16h
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <MaterialCommunityIcons
              name="calendar-remove"
              size={18}
              color="#EF4444"
            />
            <View style={styles.insightContent}>
              <Text
                style={[styles.insightLabel, { color: colors.textPrimary }]}
              >
                Menor Movimento
              </Text>
              <Text style={[styles.insightValue, { color: colors.mutedText }]}>
                Domingo manhã - 10% de ocupação
              </Text>
            </View>
          </View>
        </View>

        {/* Recomendações */}
        <View
          style={[
            styles.card,
            { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
          ]}
        >
          <View style={styles.recommendHeader}>
            <MaterialCommunityIcons name="star" size={20} color="#D97706" />
            <Text style={[styles.recommendTitle, { color: "#92400E" }]}>
              Recomendações
            </Text>
          </View>
          <Text style={[styles.recommendText, { color: "#78350F" }]}>
            • Reforçar equipe às sextas 16h-20h
          </Text>
          <Text style={[styles.recommendText, { color: "#78350F" }]}>
            • Considerar promoções nas manhãs de domingo
          </Text>
          <Text style={[styles.recommendText, { color: "#78350F" }]}>
            • Otimizar escala para horários de baixo movimento
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  heatmapContainer: {
    marginBottom: 16,
  },
  heatmapRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelCell: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "500",
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 6,
  },
  headerText: {
    fontSize: 10,
    fontWeight: "500",
  },
  heatCell: {
    margin: 1,
    borderRadius: 4,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  legendLabel: {
    fontSize: 11,
  },
  legendGradient: {
    flexDirection: "row",
  },
  legendColor: {
    width: 24,
    height: 12,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  insightValue: {
    fontSize: 12,
    marginTop: 2,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  recommendText: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
});
