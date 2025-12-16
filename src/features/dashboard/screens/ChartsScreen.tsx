/**
 * Charts Screen - Tela de gráficos e evolução
 * Usa react-native-gifted-charts para visual moderno
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme/ThemeProvider";
import {
  mockFaturamentoDiario,
  mockFaturamentoMensal,
  mockPecasPorDia,
  mockComparativoMensal,
} from "../data/mock-data";

const screenWidth = Dimensions.get("window").width;

type ChartType = "faturamento" | "pecas" | "comparativo";

export function ChartsScreen() {
  const { colors, tokens } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartType>("faturamento");

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const chartTabs: { key: ChartType; label: string; icon: string }[] = [
    { key: "faturamento", label: "Faturamento", icon: "chart-line" },
    { key: "pecas", label: "Peças", icon: "chart-bar" },
    {
      key: "comparativo",
      label: "Comparativo",
      icon: "chart-timeline-variant",
    },
  ];

  // Dados para gráfico de faturamento diário (LineChart)
  const faturamentoLineData = mockFaturamentoDiario.data.map((d, i) => ({
    value: d.y / 1000,
    label: i % 3 === 0 ? d.x : "",
    dataPointText: "",
  }));

  // Dados para gráfico de faturamento mensal (BarChart)
  const faturamentoMensalData = mockFaturamentoMensal.data.map((d) => ({
    value: d.y / 1000,
    label: d.x,
    frontColor: "#8B5CF6",
  }));

  // Total anual
  const totalAnual = mockFaturamentoMensal.data.reduce((s, d) => s + d.y, 0);
  const mediaAnual = totalAnual / 12;

  // Dados para gráfico de peças (BarChart)
  const pecasBarData = mockPecasPorDia.data.map((d) => ({
    value: d.y,
    label: d.x,
    frontColor: "#34C759",
    topLabelComponent: () => (
      <Text style={{ fontSize: 10, color: colors.mutedText, marginBottom: 4 }}>
        {d.y}
      </Text>
    ),
  }));

  // Dados para comparativo (grouped bars)
  // mockComparativoMensal[0] = mês atual, mockComparativoMensal[1] = mês anterior
  const mesAtual = mockComparativoMensal[0];
  const mesAnterior = mockComparativoMensal[1];

  const comparativoBarData = mesAtual.data.flatMap((d, i) => [
    {
      value: d.y / 1000,
      label: d.x.replace("Semana ", "S"),
      frontColor: "#007AFF",
      spacing: 2,
    },
    {
      value: mesAnterior.data[i]?.y / 1000 || 0,
      frontColor: "#8E8E93",
      spacing: 20,
    },
  ]);

  // Calcular totais
  const totalFaturamento = mockFaturamentoDiario.data.reduce(
    (s, d) => s + d.y,
    0
  );
  const totalPecas = mockPecasPorDia.data.reduce((s, d) => s + d.y, 0);
  const mediaFaturamento = totalFaturamento / mockFaturamentoDiario.data.length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        {chartTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeChart === tab.key && {
                borderBottomColor: colors.accent,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveChart(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={20}
              color={activeChart === tab.key ? colors.accent : colors.mutedText}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeChart === tab.key ? colors.accent : colors.mutedText,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Gráfico de Faturamento */}
        {activeChart === "faturamento" && (
          <>
            <View
              style={[styles.chartCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Faturamento Diário
              </Text>
              <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
                Últimos 15 dias (R$ mil)
              </Text>

              <View style={styles.chartWrapper}>
                <LineChart
                  data={faturamentoLineData}
                  width={screenWidth - 80}
                  height={200}
                  color="#007AFF"
                  thickness={3}
                  hideDataPoints={false}
                  dataPointsColor="#007AFF"
                  dataPointsRadius={4}
                  curved
                  areaChart
                  startFillColor="rgba(0, 122, 255, 0.3)"
                  endFillColor="rgba(0, 122, 255, 0.05)"
                  startOpacity={0.9}
                  endOpacity={0.2}
                  xAxisColor={colors.cardBorder}
                  yAxisColor={colors.cardBorder}
                  xAxisLabelTextStyle={{
                    color: colors.mutedText,
                    fontSize: 10,
                  }}
                  yAxisTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                  rulesColor={colors.cardBorder}
                  rulesType="dashed"
                  showVerticalLines={false}
                  noOfSections={4}
                  yAxisLabelPrefix="R$"
                  yAxisLabelSuffix="k"
                  animateOnDataChange
                  animationDuration={500}
                />
              </View>

              {/* Resumo */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.accent }]}>
                    R$ {(totalFaturamento / 1000).toFixed(1)}k
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.mutedText }]}
                  >
                    Total período
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[styles.summaryValue, { color: colors.success }]}
                  >
                    R$ {(mediaFaturamento / 1000).toFixed(1)}k
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.mutedText }]}
                  >
                    Média diária
                  </Text>
                </View>
              </View>
            </View>

            {/* Gráfico de Faturamento Mensal */}
            <View
              style={[styles.chartCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Faturamento Mensal
              </Text>
              <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
                Acumulado 2025 (R$ mil)
              </Text>

              <View style={styles.chartWrapper}>
                <BarChart
                  data={faturamentoMensalData}
                  width={screenWidth - 80}
                  height={200}
                  barWidth={20}
                  barBorderRadius={4}
                  xAxisColor={colors.cardBorder}
                  yAxisColor={colors.cardBorder}
                  xAxisLabelTextStyle={{ color: colors.mutedText, fontSize: 9 }}
                  yAxisTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                  rulesColor={colors.cardBorder}
                  rulesType="dashed"
                  noOfSections={4}
                  isAnimated
                />
              </View>

              {/* Resumo Anual */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: "#8B5CF6" }]}>
                    R$ {(totalAnual / 1000).toFixed(0)}k
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.mutedText }]}
                  >
                    Total anual
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text
                    style={[styles.summaryValue, { color: colors.success }]}
                  >
                    R$ {(mediaAnual / 1000).toFixed(1)}k
                  </Text>
                  <Text
                    style={[styles.summaryLabel, { color: colors.mutedText }]}
                  >
                    Média mensal
                  </Text>
                </View>
              </View>

              {/* Insight */}
              <View
                style={[
                  styles.insightBox,
                  { backgroundColor: colors.background },
                ]}
              >
                <MaterialCommunityIcons
                  name="trending-up"
                  size={20}
                  color={colors.success}
                />
                <Text
                  style={[styles.insightText, { color: colors.textPrimary }]}
                >
                  <Text style={{ fontWeight: "bold" }}>Novembro</Text> foi o mês
                  com maior faturamento do ano
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Gráfico de Peças */}
        {activeChart === "pecas" && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Peças Processadas
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
              Por dia da semana
            </Text>

            <View style={styles.chartWrapper}>
              <BarChart
                data={pecasBarData}
                width={screenWidth - 80}
                height={200}
                barWidth={32}
                barBorderRadius={6}
                xAxisColor={colors.cardBorder}
                yAxisColor={colors.cardBorder}
                xAxisLabelTextStyle={{ color: colors.mutedText, fontSize: 11 }}
                yAxisTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                rulesColor={colors.cardBorder}
                rulesType="dashed"
                noOfSections={4}
                isAnimated
              />
            </View>

            {/* Resumo */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {totalPecas.toLocaleString()}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.mutedText }]}
                >
                  Total semana
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.accent }]}>
                  {Math.round(totalPecas / 7)}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: colors.mutedText }]}
                >
                  Média diária
                </Text>
              </View>
            </View>

            {/* Insight */}
            <View
              style={[
                styles.insightBox,
                { backgroundColor: colors.background },
              ]}
            >
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={colors.warning}
              />
              <Text style={[styles.insightText, { color: colors.textPrimary }]}>
                <Text style={{ fontWeight: "bold" }}>Segunda-feira</Text> é o
                dia com maior volume de peças processadas
              </Text>
            </View>
          </View>
        )}

        {/* Gráfico Comparativo */}
        {activeChart === "comparativo" && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Comparativo Mensal
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
              Mês atual vs anterior (R$ mil)
            </Text>

            <View style={styles.chartWrapper}>
              <BarChart
                data={comparativoBarData}
                width={screenWidth - 80}
                height={200}
                barWidth={20}
                barBorderRadius={4}
                xAxisColor={colors.cardBorder}
                yAxisColor={colors.cardBorder}
                xAxisLabelTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                yAxisTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                rulesColor={colors.cardBorder}
                rulesType="dashed"
                noOfSections={4}
                isAnimated
              />
            </View>

            {/* Legenda */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#007AFF" }]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textPrimary }]}
                >
                  Mês Atual
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#8E8E93" }]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textPrimary }]}
                >
                  Mês Anterior
                </Text>
              </View>
            </View>

            {/* Insight */}
            <View
              style={[
                styles.insightBox,
                { backgroundColor: colors.background },
              ]}
            >
              <MaterialCommunityIcons
                name="trending-up"
                size={20}
                color={colors.success}
              />
              <Text style={[styles.insightText, { color: colors.textPrimary }]}>
                Crescimento médio de{" "}
                <Text style={{ fontWeight: "bold", color: colors.success }}>
                  8.5%
                </Text>{" "}
                em relação ao mês anterior
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  chartWrapper: {
    alignItems: "center",
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  insightBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
});
