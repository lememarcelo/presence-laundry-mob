/**
 * Heatmap Screen - Tela de mapas de calor
 * Exibe distribuição temporal das métricas por dia/hora e distribuição geográfica por UF
 */

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { mockHeatmapData } from "../data/mock-data";
import {
  useMapaTemporal,
  useMapaGeografico,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import {
  DadosHeatmapTemporal,
  DadosMapaGeografico,
} from "../api/dashboard.service";
import { HeatmapData } from "@/models/dashboard.models";
import { FilterBar } from "../components/FilterBarNew";
import { BrasilMapSVG, UFData } from "../components/BrasilMapSVG";

const screenWidth = Dimensions.get("window").width;

type MapaType = "temporal" | "geografico";

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
  const { invalidateMapaTemporal, invalidateAll } = useInvalidateDashboard();
  const [activeMap, setActiveMap] = useState<MapaType>("temporal");
  const [selectedUF, setSelectedUF] = useState<string | undefined>(undefined);

  // State para tooltip da célula selecionada
  const [tooltipCell, setTooltipCell] = useState<{
    rowIdx: number;
    colIdx: number;
    value: number;
    day: string;
    hour: string;
  } | null>(null);

  // Query para mapa temporal
  const {
    data: mapaTemporalAPI,
    isLoading: temporalLoading,
    isFetching: temporalFetching,
    refetch: refetchTemporal,
  } = useMapaTemporal();

  // Query para mapa geográfico
  const {
    data: mapaGeograficoAPI,
    isLoading: geoLoading,
    isFetching: geoFetching,
    refetch: refetchGeo,
  } = useMapaGeografico();

  const isLoading = activeMap === "temporal" ? temporalLoading : geoLoading;
  const isFetching = activeMap === "temporal" ? temporalFetching : geoFetching;

  // Transforma dados da API ou usa mock como fallback
  const heatmapData = useMemo(() => {
    if (mapaTemporalAPI && mapaTemporalAPI.valores) {
      return transformHeatmapFromAPI(mapaTemporalAPI);
    }
    return mockHeatmapData;
  }, [mapaTemporalAPI]);

  // Dados geográficos ordenados por faturamento
  const regioesSorted = useMemo(() => {
    if (mapaGeograficoAPI?.regioes) {
      return [...mapaGeograficoAPI.regioes].sort(
        (a, b) => b.faturamento - a.faturamento
      );
    }
    // Mock data
    return [
      { uf: "SP", lojas: 12, faturamento: 450000, percentual: 45 },
      { uf: "RJ", lojas: 5, faturamento: 180000, percentual: 18 },
      { uf: "MG", lojas: 4, faturamento: 120000, percentual: 12 },
      { uf: "PR", lojas: 3, faturamento: 90000, percentual: 9 },
      { uf: "RS", lojas: 3, faturamento: 80000, percentual: 8 },
      { uf: "SC", lojas: 2, faturamento: 50000, percentual: 5 },
      { uf: "BA", lojas: 1, faturamento: 30000, percentual: 3 },
    ];
  }, [mapaGeograficoAPI]);

  // Dados para o mapa SVG do Brasil
  const mapUFData = useMemo((): UFData[] => {
    const maxFat = Math.max(...regioesSorted.map((r) => r.faturamento));
    return regioesSorted.map((r) => ({
      uf: r.uf,
      valor: r.faturamento,
      percentual: maxFat > 0 ? (r.faturamento / maxFat) * 100 : 0,
    }));
  }, [regioesSorted]);

  const totalFaturamento =
    mapaGeograficoAPI?.totalFaturamento ||
    regioesSorted.reduce((sum, r) => sum + r.faturamento, 0);

  const onRefresh = React.useCallback(async () => {
    if (activeMap === "temporal") {
      await invalidateMapaTemporal();
      refetchTemporal();
    } else {
      await invalidateAll();
      refetchGeo();
    }
  }, [
    activeMap,
    invalidateMapaTemporal,
    refetchTemporal,
    invalidateAll,
    refetchGeo,
  ]);

  const cellSize = (screenWidth - 80) / (heatmapData.xLabels?.length || 7);

  const mapTabs = [
    { key: "temporal" as MapaType, label: "Temporal", icon: "calendar-clock" },
    {
      key: "geografico" as MapaType,
      label: "Por UF",
      icon: "map-marker-radius",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando mapa de calor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filtros Globais */}
      <FilterBar />

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
        {/* Tabs de seleção de mapa */}
        <View
          style={[styles.mapTabsContainer, { borderColor: colors.cardBorder }]}
        >
          {mapTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.mapTab,
                activeMap === tab.key && { backgroundColor: colors.accent },
              ]}
              onPress={() => setActiveMap(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeMap === tab.key }}
              accessibilityLabel={tab.label}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={18}
                color={activeMap === tab.key ? "#FFF" : colors.mutedText}
              />
              <Text
                style={[
                  styles.mapTabText,
                  { color: activeMap === tab.key ? "#FFF" : colors.mutedText },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mapa Geográfico por UF */}
        {activeMap === "geografico" && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={24}
                color={colors.accent}
              />
              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.textPrimary,
                      fontSize: tokens.typography.h3,
                    },
                  ]}
                >
                  Distribuição por UF
                </Text>
                <Text
                  style={[styles.cardSubtitle, { color: colors.mutedText }]}
                >
                  Faturamento e presença por estado
                </Text>
              </View>
            </View>

            {/* Mapa SVG do Brasil */}
            <View style={styles.mapContainer}>
              <BrasilMapSVG
                data={mapUFData}
                width={screenWidth - 64}
                height={200}
                onPressUF={(uf, _data) =>
                  setSelectedUF(uf === selectedUF ? undefined : uf)
                }
                selectedUF={selectedUF}
                minColor={colors.surface}
                maxColor={colors.success}
              />
            </View>

            {/* Lista de UFs */}
            {geoLoading ? (
              <View style={styles.geoLoadingContainer}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : (
              <View style={styles.ufListContainer}>
                {regioesSorted.map((regiao, idx) => {
                  const percent = (regiao.faturamento / totalFaturamento) * 100;
                  return (
                    <View key={regiao.uf} style={styles.ufRow}>
                      <View style={styles.ufRank}>
                        <Text
                          style={[
                            styles.ufRankText,
                            { color: colors.mutedText },
                          ]}
                        >
                          {idx + 1}º
                        </Text>
                      </View>
                      <View style={styles.ufInfo}>
                        <View style={styles.ufHeader}>
                          <Text
                            style={[
                              styles.ufName,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {regiao.uf}
                          </Text>
                          <Text
                            style={[
                              styles.ufLojas,
                              { color: colors.mutedText },
                            ]}
                          >
                            {regiao.lojas}{" "}
                            {regiao.lojas === 1 ? "loja" : "lojas"}
                          </Text>
                        </View>
                        <View style={styles.ufBarContainer}>
                          <View
                            style={[
                              styles.ufBar,
                              {
                                width: `${percent}%`,
                                backgroundColor: colors.accent,
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.ufFooter}>
                          <Text
                            style={[
                              styles.ufValue,
                              { color: colors.textPrimary },
                            ]}
                          >
                            R$ {(regiao.faturamento / 1000).toFixed(0)}k
                          </Text>
                          <Text
                            style={[styles.ufPercent, { color: colors.accent }]}
                          >
                            {percent.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Total */}
            <View
              style={[
                styles.geoTotalContainer,
                { borderTopColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.geoTotalLabel, { color: colors.mutedText }]}>
                Total Geral
              </Text>
              <Text
                style={[styles.geoTotalValue, { color: colors.textPrimary }]}
              >
                R$ {(totalFaturamento / 1000).toFixed(0)}k
              </Text>
            </View>
          </View>
        )}

        {/* Heatmap de Movimento - visível apenas na tab temporal */}
        {activeMap === "temporal" && (
          <>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                },
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
                      {
                        color: colors.textPrimary,
                        fontSize: tokens.typography.h3,
                      },
                    ]}
                  >
                    {heatmapData.title}
                  </Text>
                  <Text
                    style={[styles.cardSubtitle, { color: colors.mutedText }]}
                  >
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
                      <Text
                        style={[styles.labelText, { color: colors.mutedText }]}
                      >
                        {hour}
                      </Text>
                    </View>
                    {heatmapData.values[rowIdx]?.map((value, colIdx) => {
                      const isSelected =
                        tooltipCell?.rowIdx === rowIdx &&
                        tooltipCell?.colIdx === colIdx;
                      return (
                        <TouchableOpacity
                          key={colIdx}
                          onPress={() => {
                            if (isSelected) {
                              setTooltipCell(null);
                            } else {
                              setTooltipCell({
                                rowIdx,
                                colIdx,
                                value,
                                day: heatmapData.xLabels[colIdx],
                                hour,
                              });
                            }
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`${heatmapData.xLabels[colIdx]} ${hour}: ${value} atendimentos`}
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
                            isSelected && styles.heatCellSelected,
                          ]}
                        />
                      );
                    })}
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

              {/* Tooltip da célula selecionada */}
              {tooltipCell && (
                <View
                  style={[
                    styles.tooltipContainer,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <View style={styles.tooltipContent}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.tooltipText}>
                      {tooltipCell.day} às {tooltipCell.hour}
                    </Text>
                  </View>
                  <View style={styles.tooltipValueRow}>
                    <Text style={styles.tooltipValue}>{tooltipCell.value}</Text>
                    <Text style={styles.tooltipLabel}>atendimentos</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setTooltipCell(null)}
                    style={styles.tooltipClose}
                    accessibilityLabel="Fechar tooltip"
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={14}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Insights do Heatmap */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.insightHeader}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={20}
                  color="#F59E0B"
                />
                <Text
                  style={[styles.insightTitle, { color: colors.textPrimary }]}
                >
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
                  <Text
                    style={[styles.insightValue, { color: colors.mutedText }]}
                  >
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
                  <Text
                    style={[styles.insightValue, { color: colors.mutedText }]}
                  >
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
                  <Text
                    style={[styles.insightValue, { color: colors.mutedText }]}
                  >
                    Domingo manhã - 10% de ocupação
                  </Text>
                </View>
              </View>
            </View>

            {/* Recomendações - visível apenas na tab temporal */}
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
          </>
        )}
      </ScrollView>
    </View>
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
  // Estilos para tabs de mapa
  mapTabsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  mapTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  mapTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Estilo para o mapa SVG do Brasil
  mapContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  // Estilos para lista de UFs
  geoLoadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  ufListContainer: {
    gap: 12,
  },
  ufRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ufRank: {
    width: 32,
    alignItems: "center",
  },
  ufRankText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ufInfo: {
    flex: 1,
  },
  ufHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ufName: {
    fontSize: 16,
    fontWeight: "600",
  },
  ufLojas: {
    fontSize: 12,
  },
  ufBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  ufBar: {
    height: "100%",
    borderRadius: 4,
  },
  ufFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ufValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  ufPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  geoTotalContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  geoTotalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  geoTotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  // Estilos para tooltip do heatmap
  heatCellSelected: {
    borderWidth: 2,
    borderColor: "#1F2937",
    transform: [{ scale: 1.1 }],
    zIndex: 10,
  },
  tooltipContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tooltipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tooltipText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "500",
  },
  tooltipValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 16,
    gap: 4,
  },
  tooltipValue: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  tooltipLabel: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.8,
  },
  tooltipClose: {
    marginLeft: "auto",
    padding: 4,
  },
});
