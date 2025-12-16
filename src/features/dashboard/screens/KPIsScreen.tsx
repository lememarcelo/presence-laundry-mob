/**
 * KPIs Screen - Tela de indicadores principais
 * Exibe cards com métricas de faturamento, tickets, peças, clientes, etc.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore } from "../stores/useFiltersStore";
import {
  useMetricasConsolidadas,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import { FilterBar } from "../components/FilterBar";
import { mockKPIs } from "../data/mock-data";
import { KPICard as KPICardType } from "@/models/dashboard.models";
import { DashboardKPIs } from "../api/dashboard.service";

// ========================================
// Helpers - Transforma dados da API em KPICards
// ========================================

function formatCurrency(value: number | undefined | null): string {
  const num = value ?? 0;
  return `R$ ${num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value: number | undefined | null): string {
  const num = value ?? 0;
  return num.toLocaleString("pt-BR");
}

function isValidDashboardKPIs(data: unknown): data is DashboardKPIs {
  if (!data || typeof data !== "object") return false;
  const d = data as any;
  return (
    d.faturamento?.atual?.valor !== undefined &&
    d.tickets?.atual?.quantidade !== undefined &&
    d.pecas?.atual?.quantidade !== undefined &&
    d.clientes !== undefined &&
    d.ranking !== undefined
  );
}

function transformKPIsFromAPI(data: DashboardKPIs): KPICardType[] {
  const kpis: KPICardType[] = [];

  // Faturamento
  kpis.push({
    id: "faturamento",
    title: "Faturamento",
    value: data.faturamento?.atual?.valor ?? 0,
    formattedValue: formatCurrency(data.faturamento?.atual?.valor ?? 0),
    previousValue: data.faturamento?.anterior?.valor,
    percentChange: data.faturamento?.variacao?.percentual ?? 0,
    trend: data.faturamento?.variacao?.direcao ?? "stable",
    icon: "cash-multiple",
    color: "#10B981",
  });

  // Tickets (Atendimentos/ROLs)
  kpis.push({
    id: "tickets",
    title: "Atendimentos",
    value: data.tickets?.atual?.quantidade ?? 0,
    formattedValue: formatNumber(data.tickets?.atual?.quantidade ?? 0),
    percentChange: data.tickets?.variacao?.percentual ?? 0,
    trend: data.tickets?.variacao?.direcao ?? "stable",
    icon: "receipt",
    color: "#3B82F6",
  });

  // Ticket Médio
  kpis.push({
    id: "ticket-medio",
    title: "Ticket Médio",
    value: data.tickets?.atual?.ticketMedio ?? 0,
    formattedValue: formatCurrency(data.tickets?.atual?.ticketMedio ?? 0),
    percentChange: data.tickets?.variacao?.percentual ?? 0,
    trend: data.tickets?.variacao?.direcao ?? "stable",
    icon: "tag",
    color: "#F59E0B",
  });

  // Peças
  kpis.push({
    id: "pecas",
    title: "Peças",
    value: data.pecas?.atual?.quantidade ?? 0,
    formattedValue: formatNumber(data.pecas?.atual?.quantidade ?? 0),
    percentChange: data.pecas?.variacao?.percentual ?? 0,
    trend: data.pecas?.variacao?.direcao ?? "stable",
    icon: "tshirt-crew",
    color: "#8B5CF6",
  });

  // Clientes Novos
  kpis.push({
    id: "clientes-novos",
    title: "Clientes Novos",
    value: data.clientes?.novos ?? 0,
    formattedValue: formatNumber(data.clientes?.novos ?? 0),
    percentChange: 0,
    trend: "stable",
    icon: "account-plus",
    color: "#06B6D4",
  });

  // Ranking na Rede
  kpis.push({
    id: "ranking",
    title: "Ranking Rede",
    value: data.ranking?.posicao ?? 0,
    formattedValue: `${data.ranking?.posicao ?? 0}º de ${
      data.ranking?.totalLojas ?? 0
    }`,
    percentChange: 0,
    trend:
      data.ranking?.variacao === "subiu"
        ? "up"
        : data.ranking?.variacao === "desceu"
        ? "down"
        : "stable",
    icon: "trophy",
    color: "#EC4899",
  });

  return kpis;
}

// Componente de Card de KPI
function KPICardComponent({ data }: { data: KPICardType }) {
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
        styles.kpiCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.kpiHeader}>
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

      <Text
        style={[
          styles.kpiValue,
          { color: colors.textPrimary, fontSize: tokens.typography.h2 },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {data.formattedValue}
      </Text>

      <Text
        style={[
          styles.kpiTitle,
          { color: colors.mutedText, fontSize: tokens.typography.caption },
        ]}
      >
        {data.title}
      </Text>
    </View>
  );
}

export function KPIsScreen() {
  const { colors, tokens } = useTheme();
  const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();
  const { invalidateAll } = useInvalidateDashboard();

  // Query para métricas consolidadas
  const {
    data: metricas,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMetricasConsolidadas();

  // Transforma dados da API em KPICards ou usa mock como fallback
  const kpis = React.useMemo(() => {
    if (metricas && isValidDashboardKPIs(metricas)) {
      return transformKPIsFromAPI(metricas);
    }
    return mockKPIs; // Fallback para mock data
  }, [metricas]);

  // Resumo calculado a partir dos dados
  const resumo = React.useMemo(() => {
    if (metricas && isValidDashboardKPIs(metricas)) {
      const faturamento = metricas.faturamento?.atual?.valor ?? 0;
      const diasPassados = metricas.projecao?.diasUteisPassados || 15;
      const mediaDiaria = diasPassados > 0 ? faturamento / diasPassados : 0;
      const crescimento = metricas.faturamento?.variacao?.percentual ?? 0;

      return {
        totalFaturado: formatCurrency(faturamento),
        mediaDiaria: formatCurrency(mediaDiaria),
        crescimento: `${crescimento >= 0 ? "+" : ""}${crescimento.toFixed(
          2
        )}% vs anterior`,
        crescimentoPositivo: crescimento >= 0,
      };
    }
    return {
      totalFaturado: "R$ 87.450,00",
      mediaDiaria: "R$ 5.830,00",
      crescimento: "+6,52% vs anterior",
      crescimentoPositivo: true,
    };
  }, [metricas]);

  const onRefresh = React.useCallback(async () => {
    await invalidateAll();
    refetch();
  }, [invalidateAll, refetch]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            Carregando indicadores...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError && !metricas) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={colors.mutedText}
          />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Erro ao carregar dados
          </Text>
          <Text style={[styles.errorMessage, { color: colors.mutedText }]}>
            {error instanceof Error ? error.message : "Tente novamente"}
          </Text>
          <Text style={[styles.errorHint, { color: colors.mutedText }]}>
            Puxe para baixo para tentar novamente
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      {/* Barra de Filtros */}
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
        {/* Grid de KPIs */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KPICardComponent key={kpi.id} data={kpi} />
          ))}
        </View>

        {/* Resumo */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text
            style={[
              styles.summaryTitle,
              { color: colors.textPrimary, fontSize: tokens.typography.h3 },
            ]}
          >
            Resumo do Período
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>
                Total Faturado
              </Text>
              <Text
                style={[styles.summaryValue, { color: colors.textPrimary }]}
              >
                {resumo.totalFaturado}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>
                Média Diária
              </Text>
              <Text
                style={[styles.summaryValue, { color: colors.textPrimary }]}
              >
                {resumo.mediaDiaria}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>
                Projeção Mês
              </Text>
              <Text
                style={[styles.summaryValue, { color: colors.textPrimary }]}
              >
                {metricas
                  ? formatCurrency(metricas.projecao.faturamentoProjetado)
                  : "R$ 120.000,00"}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>
                Crescimento
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: resumo.crescimentoPositivo ? "#10B981" : "#EF4444" },
                ]}
              >
                {resumo.crescimento}
              </Text>
            </View>
          </View>
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
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 6,
  },
  periodLabel: {
    fontSize: 13,
  },
  periodSeparator: {
    fontSize: 13,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  kpiHeader: {
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
  kpiValue: {
    fontWeight: "700",
    marginBottom: 4,
  },
  kpiTitle: {
    fontWeight: "500",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  summaryTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
  },
  errorHint: {
    fontSize: 12,
    marginTop: 8,
  },
});
