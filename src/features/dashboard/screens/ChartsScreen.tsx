/**
 * Charts Screen - Tela de gráficos e evolução
 * Usa react-native-gifted-charts para visual moderno
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme/ThemeProvider";
import {
  mockFaturamentoDiario,
  mockFaturamentoMensal,
  mockPecasPorDia,
  mockComparativoMensal,
} from "../data/mock-data";
import {
  useDistribuicaoServicos,
  useEvolucaoPagamentos,
  usePendenciaProducao,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import { FilterBar } from "../components/FilterBarNew";
import {
  InteractiveLegend,
  useSeriesVisibility,
  LegendItem,
} from "../components/InteractiveLegend";
import { ZoomableChartWrapper } from "../components/ZoomableChartWrapper";

const screenWidth = Dimensions.get("window").width;
// Largura do gráfico = screenWidth - padding (32) - margins do card (16*2) - espaço do eixo Y (50)
const chartWidth = screenWidth - 32 - 32 - 50;
// Largura expandida para scroll horizontal
const expandedChartWidth = screenWidth * 1.55;

type ChartType =
  | "faturamento"
  | "pecas"
  | "servicos"
  | "pagamentos"
  | "producao";

export function ChartsScreen() {
  const { colors, tokens } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<ChartType>("faturamento");
  const { invalidateAll } = useInvalidateDashboard();

  // Hook para distribuição de serviços
  const {
    data: distribuicaoData,
    isLoading: distribuicaoLoading,
    refetch: refetchDistribuicao,
  } = useDistribuicaoServicos();

  // Hook para evolução de pagamentos
  const {
    data: pagamentosData,
    isLoading: pagamentosLoading,
    refetch: refetchPagamentos,
  } = useEvolucaoPagamentos();

  // Hook para pendência de produção
  const {
    data: pendenciaData,
    isLoading: pendenciaLoading,
    refetch: refetchPendencia,
  } = usePendenciaProducao();

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await invalidateAll();
    if (activeChart === "servicos") {
      await refetchDistribuicao();
    }
    if (activeChart === "pagamentos") {
      await refetchPagamentos();
    }
    if (activeChart === "producao") {
      await refetchPendencia();
    }
    setTimeout(() => setRefreshing(false), 500);
  }, [
    invalidateAll,
    activeChart,
    refetchDistribuicao,
    refetchPagamentos,
    refetchPendencia,
  ]);

  const chartTabs: { key: ChartType; label: string; icon: string }[] = [
    { key: "faturamento", label: "Faturamento", icon: "chart-line" },
    { key: "pecas", label: "Peças", icon: "chart-bar" },
    { key: "servicos", label: "Serviços", icon: "chart-pie" },
    { key: "pagamentos", label: "Pagamentos", icon: "chart-donut" },
    { key: "producao", label: "Produção", icon: "clock-alert-outline" },
  ];

  // Dados do gráfico de pizza de serviços
  const pieChartData = useMemo(() => {
    if (distribuicaoData?.segmentos) {
      return distribuicaoData.segmentos.map((seg) => ({
        value: seg.valor,
        color:
          seg.cor || "#" + Math.floor(Math.random() * 16777215).toString(16),
        text: `${seg.percentual.toFixed(0)}%`,
        textColor: "#fff",
        textSize: 12,
        label: seg.grupo,
      }));
    }
    // Mock data fallback
    return [
      { value: 35, color: "#8B5CF6", text: "35%", label: "Lavagem Simples" },
      { value: 25, color: "#10B981", text: "25%", label: "Lavagem a Seco" },
      { value: 20, color: "#3B82F6", text: "20%", label: "Passadoria" },
      { value: 12, color: "#F59E0B", text: "12%", label: "Tinturaria" },
      { value: 8, color: "#EC4899", text: "8%", label: "Outros" },
    ];
  }, [distribuicaoData]);

  // Dados do gráfico donut de pagamentos
  const pagamentosChartData = useMemo(() => {
    // Pega o primeiro período (mais recente) ou usa mock
    const periodo = pagamentosData?.[0];
    if (periodo?.pagamentos) {
      return periodo.pagamentos.map((pag) => ({
        value: pag.valor,
        color:
          pag.cor || "#" + Math.floor(Math.random() * 16777215).toString(16),
        text: `${pag.percentual.toFixed(0)}%`,
        label: pag.modalidade,
      }));
    }
    // Mock data fallback
    return [
      { value: 45, color: "#10B981", text: "45%", label: "Dinheiro" },
      { value: 30, color: "#3B82F6", text: "30%", label: "Cartão Crédito" },
      { value: 15, color: "#8B5CF6", text: "15%", label: "Cartão Débito" },
      { value: 7, color: "#F59E0B", text: "7%", label: "PIX" },
      { value: 3, color: "#EC4899", text: "3%", label: "Outros" },
    ];
  }, [pagamentosData]);

  // Legendas para a legenda interativa de serviços
  const servicosLegendItems: LegendItem[] = useMemo(() => {
    return pieChartData.map((item) => ({
      key: item.label,
      label: item.label,
      color: item.color,
      formattedValue: item.text,
    }));
  }, [pieChartData]);

  // Hook de visibilidade para gráfico de serviços
  const servicosVisibility = useSeriesVisibility(servicosLegendItems);

  // Dados filtrados baseados na visibilidade
  const filteredPieChartData = useMemo(() => {
    return pieChartData.filter((item) =>
      servicosVisibility.visibleKeys.includes(item.label)
    );
  }, [pieChartData, servicosVisibility.visibleKeys]);

  // Legendas para pagamentos
  const pagamentosLegendItems: LegendItem[] = useMemo(() => {
    return pagamentosChartData.map((item) => ({
      key: item.label,
      label: item.label,
      color: item.color,
      formattedValue: item.text,
    }));
  }, [pagamentosChartData]);

  // Hook de visibilidade para gráfico de pagamentos
  const pagamentosVisibility = useSeriesVisibility(pagamentosLegendItems);

  // Dados filtrados de pagamentos
  const filteredPagamentosChartData = useMemo(() => {
    return pagamentosChartData.filter((item) =>
      pagamentosVisibility.visibleKeys.includes(item.label)
    );
  }, [pagamentosChartData, pagamentosVisibility.visibleKeys]);

  // Dados do gráfico de barras de pendência de produção
  const pendenciaChartData = useMemo(() => {
    if (pendenciaData?.faixas) {
      return pendenciaData.faixas.map((faixa) => ({
        value: faixa.quantidade,
        label: faixa.faixa,
        frontColor: faixa.cor || "#8B5CF6",
        topLabelComponent: () => (
          <Text
            style={{ fontSize: 10, color: colors.mutedText, marginBottom: 4 }}
          >
            {faixa.quantidade}
          </Text>
        ),
      }));
    }
    // Mock data fallback - pendências por faixa de atraso
    return [
      {
        value: 45,
        label: "No prazo",
        frontColor: "#10B981",
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, marginBottom: 4 }}>45</Text>
        ),
      },
      {
        value: 28,
        label: "1-2 dias",
        frontColor: "#F59E0B",
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, marginBottom: 4 }}>28</Text>
        ),
      },
      {
        value: 15,
        label: "3-5 dias",
        frontColor: "#F97316",
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, marginBottom: 4 }}>15</Text>
        ),
      },
      {
        value: 8,
        label: "6-10 dias",
        frontColor: "#EF4444",
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, marginBottom: 4 }}>8</Text>
        ),
      },
      {
        value: 4,
        label: ">10 dias",
        frontColor: "#DC2626",
        topLabelComponent: () => (
          <Text style={{ fontSize: 10, marginBottom: 4 }}>4</Text>
        ),
      },
    ];
  }, [pendenciaData, colors.mutedText]);

  const totalPendencias =
    pendenciaData?.totalPendente ||
    pendenciaChartData.reduce((sum, item) => sum + item.value, 0);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filtros Globais */}
      <FilterBar />

      {/* Tabs */}
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {chartTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeChart === tab.key && styles.tabActive,
                activeChart === tab.key && { borderBottomColor: colors.accent },
              ]}
              onPress={() => setActiveChart(tab.key)}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={18}
                color={
                  activeChart === tab.key ? colors.accent : colors.mutedText
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeChart === tab.key
                        ? colors.accent
                        : colors.mutedText,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
                  width={chartWidth}
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
                Acumulado 2025 (R$ mil) - Deslize para ver todos
              </Text>

              <ZoomableChartWrapper
                contentWidth={expandedChartWidth}
                height={250}
              >
                <BarChart
                  data={faturamentoMensalData}
                  width={expandedChartWidth - 50}
                  height={200}
                  barWidth={28}
                  spacing={16}
                  barBorderRadius={4}
                  xAxisColor={colors.cardBorder}
                  yAxisColor={colors.cardBorder}
                  xAxisLabelTextStyle={{
                    color: colors.mutedText,
                    fontSize: 10,
                  }}
                  yAxisTextStyle={{ color: colors.mutedText, fontSize: 10 }}
                  rulesColor={colors.cardBorder}
                  rulesType="dashed"
                  noOfSections={4}
                  isAnimated
                  xAxisLabelsVerticalShift={5}
                  labelsExtraHeight={30}
                />
              </ZoomableChartWrapper>

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
                width={chartWidth}
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

        {/* Gráfico de Serviços (Pizza) */}
        {activeChart === "servicos" && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Distribuição por Serviço
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
              Faturamento por grupo de serviço
            </Text>

            {distribuicaoLoading ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                  Carregando dados...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={filteredPieChartData}
                    donut
                    radius={100}
                    innerRadius={60}
                    innerCircleColor={colors.surface}
                    centerLabelComponent={() => (
                      <View style={styles.pieCenterLabel}>
                        <Text
                          style={[
                            styles.pieCenterValue,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {distribuicaoData
                            ? `R$ ${(distribuicaoData.total / 1000).toFixed(
                                0
                              )}k`
                            : "100%"}
                        </Text>
                        <Text
                          style={[
                            styles.pieCenterSubtitle,
                            { color: colors.mutedText },
                          ]}
                        >
                          Total
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {/* Legenda Interativa do Pizza */}
                <View style={styles.pieLegendContainer}>
                  <InteractiveLegend
                    items={servicosLegendItems}
                    visibleKeys={servicosVisibility.visibleKeys}
                    onToggle={servicosVisibility.toggle}
                    layout="vertical"
                    showValues={true}
                  />
                </View>

                {/* Insight */}
                <View
                  style={[
                    styles.insightBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={20}
                    color={colors.accent}
                  />
                  <Text
                    style={[styles.insightText, { color: colors.textPrimary }]}
                  >
                    {pieChartData[0]?.label || "Lavagem Simples"} representa a
                    maior parte do faturamento
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Gráfico de Pagamentos (Donut) */}
        {activeChart === "pagamentos" && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Formas de Pagamento
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
              Distribuição por modalidade
            </Text>

            {pagamentosLoading ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                  Carregando dados...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.pieChartContainer}>
                  <PieChart
                    data={filteredPagamentosChartData}
                    donut
                    radius={100}
                    innerRadius={65}
                    innerCircleColor={colors.surface}
                    centerLabelComponent={() => (
                      <View style={styles.pieCenterLabel}>
                        <MaterialCommunityIcons
                          name="credit-card-multiple"
                          size={24}
                          color={colors.accent}
                        />
                        <Text
                          style={[
                            styles.pieCenterSubtitle,
                            { color: colors.mutedText },
                          ]}
                        >
                          Pagamentos
                        </Text>
                      </View>
                    )}
                  />
                </View>

                {/* Legenda Interativa do Donut */}
                <View style={styles.pieLegendContainer}>
                  <InteractiveLegend
                    items={pagamentosLegendItems}
                    visibleKeys={pagamentosVisibility.visibleKeys}
                    onToggle={pagamentosVisibility.toggle}
                    layout="vertical"
                    showValues={true}
                  />
                </View>

                {/* Insight */}
                <View
                  style={[
                    styles.insightBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-multiple"
                    size={20}
                    color={colors.success}
                  />
                  <Text
                    style={[styles.insightText, { color: colors.textPrimary }]}
                  >
                    {pagamentosChartData[0]?.label || "Dinheiro"} é a forma de
                    pagamento mais utilizada
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Gráfico de Pendência de Produção (Barras) */}
        {activeChart === "producao" && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Pendências de Produção
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.mutedText }]}>
              Por faixa de atraso
            </Text>

            {pendenciaLoading ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.mutedText }]}>
                  Carregando dados...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.chartWrapper}>
                  <BarChart
                    data={pendenciaChartData}
                    width={chartWidth}
                    height={220}
                    barWidth={40}
                    barBorderRadius={6}
                    xAxisColor={colors.cardBorder}
                    yAxisColor={colors.cardBorder}
                    xAxisLabelTextStyle={{
                      color: colors.mutedText,
                      fontSize: 10,
                    }}
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
                    <Text
                      style={[styles.summaryValue, { color: colors.accent }]}
                    >
                      {totalPendencias}
                    </Text>
                    <Text
                      style={[styles.summaryLabel, { color: colors.mutedText }]}
                    >
                      Total pendente
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text
                      style={[styles.summaryValue, { color: colors.success }]}
                    >
                      {pendenciaChartData[0]?.value || 0}
                    </Text>
                    <Text
                      style={[styles.summaryLabel, { color: colors.mutedText }]}
                    >
                      No prazo
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
                      {pendenciaChartData
                        .slice(3)
                        .reduce((sum, item) => sum + item.value, 0)}
                    </Text>
                    <Text
                      style={[styles.summaryLabel, { color: colors.mutedText }]}
                    >
                      Críticos
                    </Text>
                  </View>
                </View>

                {/* Alertas por cor */}
                <View
                  style={[
                    styles.pendenciaAlerts,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <View style={styles.pendenciaAlertRow}>
                    <View
                      style={[
                        styles.alertIndicator,
                        { backgroundColor: "#10B981" },
                      ]}
                    />
                    <Text
                      style={[styles.alertText, { color: colors.textPrimary }]}
                    >
                      No prazo: produção em dia
                    </Text>
                  </View>
                  <View style={styles.pendenciaAlertRow}>
                    <View
                      style={[
                        styles.alertIndicator,
                        { backgroundColor: "#F59E0B" },
                      ]}
                    />
                    <Text
                      style={[styles.alertText, { color: colors.textPrimary }]}
                    >
                      1-2 dias: atenção recomendada
                    </Text>
                  </View>
                  <View style={styles.pendenciaAlertRow}>
                    <View
                      style={[
                        styles.alertIndicator,
                        { backgroundColor: "#EF4444" },
                      ]}
                    />
                    <Text
                      style={[styles.alertText, { color: colors.textPrimary }]}
                    >
                      6+ dias: ação urgente necessária
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
    marginHorizontal: 2,
  },
  tabActive: {
    borderBottomWidth: 3,
    marginBottom: -1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
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
    overflow: "hidden",
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
    overflow: "hidden",
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
  // Estilos para o gráfico de pizza
  pieChartContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  pieCenterLabel: {
    alignItems: "center",
  },
  pieCenterValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  pieCenterSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  pieLegendContainer: {
    marginTop: 16,
  },
  pieLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e020",
  },
  pieLegendLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  pieLegendValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  // Estilos para alertas de pendência de produção
  pendenciaAlerts: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  pendenciaAlertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  alertText: {
    fontSize: 13,
  },
});
