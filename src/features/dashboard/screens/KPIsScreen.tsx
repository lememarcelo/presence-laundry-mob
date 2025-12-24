/**
 * KPIs Screen - Tela de indicadores principais
 * Exibe cards com métricas de faturamento, tickets, peças, clientes, etc.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore } from "../stores/useFiltersStore";
import {
  useMetricasConsolidadas,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import { FilterBar } from "../components/FilterBarNew";
import {
  SemaforoIndicator,
  getSemaforoStatus,
} from "../components/SemaforoIndicator";
import { KPISkeletonGrid } from "../components/SkeletonCard";
import {
  ComparativoLojaRedeCard,
  formatadores,
} from "../components/ComparativoLojaRedeCard";
import {
  SparklineChart,
  generateMockSparklineData,
} from "../components/SparklineChart";
import { KPIDetailModal, KPIDetailData } from "../components/KPIDetailModal";
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
  // Valida estrutura conforme backend Horse
  return (
    d.faturamento?.atual !== undefined &&
    d.tickets?.atual !== undefined &&
    d.pecas?.atual !== undefined &&
    d.clientes !== undefined &&
    d.ranking !== undefined
  );
}

// M2-K-003: Helpers para dados do modal de detalhes
const KPI_DESCRIPTIONS: Record<string, string> = {
  faturamento:
    "Total de receita no período selecionado. Inclui todos os tipos de serviço e formas de pagamento.",
  tickets:
    "Número de atendimentos/ROLs processados no período. Cada ticket representa uma entrada de cliente.",
  "ticket-medio":
    "Valor médio por atendimento, calculado dividindo o faturamento pelo número de tickets.",
  pecas:
    "Total de peças/itens processados no período. Indica o volume de produção da lavanderia.",
  delivery:
    "Percentual de atendimentos realizados via delivery sobre o total de atendimentos.",
  ranking:
    "Posição da loja no ranking comparativo de todas as unidades da rede.",
};

function getKPIDescription(kpiId: string): string {
  return KPI_DESCRIPTIONS[kpiId] || "Indicador de performance do período.";
}

function getKPIBreakdown(
  kpi: KPICardType,
  metricas: DashboardKPIs | undefined
): { label: string; value: string; icon?: string; subValue?: string }[] {
  if (!metricas) return [];

  // Cast para acessar campos opcionais que podem não estar no tipo
  const m = metricas as any;

  switch (kpi.id) {
    case "faturamento":
      if (!m.formasPagamento) return [];
      return [
        {
          label: "Dinheiro",
          value: formatCurrency(m.formasPagamento?.dinheiro ?? 0),
          icon: "cash",
        },
        {
          label: "Cartão Crédito",
          value: formatCurrency(m.formasPagamento?.credito ?? 0),
          icon: "credit-card",
        },
        {
          label: "Cartão Débito",
          value: formatCurrency(m.formasPagamento?.debito ?? 0),
          icon: "credit-card-outline",
        },
        {
          label: "PIX",
          value: formatCurrency(m.formasPagamento?.pix ?? 0),
          icon: "qrcode",
        },
      ];
    case "tickets":
      return [
        {
          label: "Média por Dia",
          value: formatNumber(
            Math.round(
              (metricas.tickets?.atual ?? 0) /
                (metricas.projecao?.diasUteisPassados || 1)
            )
          ),
          icon: "calendar-today",
        },
        {
          label: "Novos Clientes",
          value: formatNumber(metricas.clientes?.novos ?? 0),
          icon: "account-plus",
          subValue: `${(
            ((metricas.clientes?.novos ?? 0) / (metricas.tickets?.atual || 1)) *
            100
          ).toFixed(1)}% do total`,
        },
      ];
    case "pecas":
      return [
        {
          label: "Média por Ticket",
          value: formatNumber(
            Math.round(
              (metricas.pecas?.atual ?? 0) / (metricas.tickets?.atual || 1)
            )
          ),
          icon: "tshirt-crew",
        },
      ];
    default:
      return [];
  }
}

function getKPIMeta(
  kpiId: string,
  metricas: DashboardKPIs | undefined
): string | undefined {
  // Cast para acessar campos opcionais
  const m = metricas as any;
  if (!m?.metas) return undefined;

  switch (kpiId) {
    case "faturamento":
      return m.metas.faturamento
        ? formatCurrency(m.metas.faturamento)
        : undefined;
    case "tickets":
      return m.metas.tickets ? formatNumber(m.metas.tickets) : undefined;
    default:
      return undefined;
  }
}

function getKPIMetaAtingida(
  kpi: KPICardType,
  metricas: DashboardKPIs | undefined
): number | undefined {
  // Cast para acessar campos opcionais
  const m = metricas as any;
  if (!m?.metas) return undefined;

  const valor = typeof kpi.value === "number" ? kpi.value : 0;
  let meta: number | undefined;

  switch (kpi.id) {
    case "faturamento":
      meta = m.metas.faturamento;
      break;
    case "tickets":
      meta = m.metas.tickets;
      break;
    default:
      return undefined;
  }

  if (!meta || meta === 0) return undefined;
  return (valor / meta) * 100;
}

function transformKPIsFromAPI(data: DashboardKPIs): KPICardType[] {
  const kpis: KPICardType[] = [];

  // Faturamento (atual é valor direto, não objeto)
  kpis.push({
    id: "faturamento",
    title: "Faturamento",
    value: data.faturamento?.atual ?? 0,
    formattedValue: formatCurrency(data.faturamento?.atual ?? 0),
    previousValue: data.faturamento?.anterior,
    percentChange: data.faturamento?.variacao?.percentual ?? 0,
    trend:
      (data.faturamento?.variacao?.direcao as "up" | "down" | "stable") ??
      "stable",
    icon: "cash-multiple",
    color: "#10B981",
  });

  // Tickets (Atendimentos/ROLs) - atual é número direto
  kpis.push({
    id: "tickets",
    title: "Atendimentos",
    value: data.tickets?.atual ?? 0,
    formattedValue: formatNumber(data.tickets?.atual ?? 0),
    percentChange: data.tickets?.variacao?.percentual ?? 0,
    trend:
      (data.tickets?.variacao?.direcao as "up" | "down" | "stable") ?? "stable",
    icon: "receipt",
    color: "#3B82F6",
  });

  // Ticket Médio
  kpis.push({
    id: "ticket-medio",
    title: "Ticket Médio",
    value: data.tickets?.ticketMedio ?? 0,
    formattedValue: formatCurrency(data.tickets?.ticketMedio ?? 0),
    percentChange: data.tickets?.variacaoTicketMedio?.percentual ?? 0,
    trend:
      (data.tickets?.variacaoTicketMedio?.direcao as
        | "up"
        | "down"
        | "stable") ?? "stable",
    icon: "tag",
    color: "#F59E0B",
  });

  // Peças - atual é número direto
  kpis.push({
    id: "pecas",
    title: "Peças",
    value: data.pecas?.atual ?? 0,
    formattedValue: formatNumber(data.pecas?.atual ?? 0),
    percentChange: data.pecas?.variacao?.percentual ?? 0,
    trend:
      (data.pecas?.variacao?.direcao as "up" | "down" | "stable") ?? "stable",
    icon: "tshirt-crew",
    color: "#8B5CF6",
  });

  // Delivery
  kpis.push({
    id: "delivery",
    title: "Delivery",
    value: data.delivery?.percentual ?? 0,
    formattedValue: `${(data.delivery?.percentual ?? 0).toFixed(1)}%`,
    percentChange: data.delivery?.variacao?.percentual ?? 0,
    trend:
      (data.delivery?.variacao?.direcao as "up" | "down" | "stable") ??
      "stable",
    icon: "truck-delivery",
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
function KPICardComponent({
  data,
  sparklineData,
  onPress,
}: {
  data: KPICardType;
  sparklineData?: number[];
  onPress?: () => void;
}) {
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

  // Status do semáforo baseado na variação percentual
  const semaforoStatus = getSemaforoStatus(data.percentChange ?? 0);

  return (
    <TouchableOpacity
      style={[
        styles.kpiCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${data.title}: ${data.formattedValue}. Toque para ver detalhes.`}
      accessibilityHint="Abre modal com detalhes do indicador"
    >
      <View style={styles.kpiHeader}>
        <View style={styles.kpiHeaderLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: data.color + "20" },
            ]}
          >
            <MaterialCommunityIcons
              name={data.icon as any}
              size={24}
              color={data.color}
            />
          </View>
          {/* Semáforo de status */}
          <SemaforoIndicator status={semaforoStatus} size={10} />
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

      {/* Sparkline - tendência dos últimos 7 dias */}
      {sparklineData && sparklineData.length > 0 && (
        <View style={styles.sparklineContainer}>
          <SparklineChart
            data={sparklineData}
            width={100}
            height={24}
            color={data.color}
            showLastPoint={true}
            filled={true}
          />
        </View>
      )}

      <Text
        style={[
          styles.kpiTitle,
          { color: colors.mutedText, fontSize: tokens.typography.caption },
        ]}
      >
        {data.title}
      </Text>
    </TouchableOpacity>
  );
}

export function KPIsScreen() {
  const { colors, tokens } = useTheme();
  const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();
  const { invalidateAll } = useInvalidateDashboard();

  // M2-K-003: State para modal de detalhes do KPI
  const [selectedKPI, setSelectedKPI] = useState<KPIDetailData | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

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
      const faturamento = metricas.faturamento?.atual ?? 0;
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
        projecaoMes: formatCurrency(metricas.projecao?.valorProjetado ?? 0),
      };
    }
    return {
      totalFaturado: "R$ 87.450,00",
      mediaDiaria: "R$ 5.830,00",
      crescimento: "+6,52% vs anterior",
      crescimentoPositivo: true,
      projecaoMes: "R$ 120.000,00",
    };
  }, [metricas]);

  // Dados do comparativo Loja x Média da Rede
  const comparativoData = React.useMemo(() => {
    if (metricas?.mediaRede) {
      const mr = metricas.mediaRede;
      return {
        nomeLoja:
          lojasSelecionadas.length > 0
            ? `Loja ${lojasSelecionadas[0]}`
            : "Sua Loja",
        metricas: [
          {
            label: "Faturamento",
            valorLoja: metricas.faturamento?.atual ?? 0,
            valorRede: mr.faturamento ?? 0,
            formatador: formatadores.currency,
          },
          {
            label: "Ticket Médio",
            valorLoja: metricas.tickets?.ticketMedio ?? 0,
            valorRede: mr.ticketMedio ?? 0,
            formatador: formatadores.currency,
          },
          {
            label: "Peças",
            valorLoja: metricas.pecas?.atual ?? 0,
            valorRede: mr.pecas ?? 0,
            formatador: formatadores.number,
          },
          {
            label: "% Delivery",
            valorLoja: metricas.delivery?.percentual ?? 0,
            valorRede: mr.pctDelivery ?? 0,
            formatador: formatadores.percent,
          },
        ],
      };
    }
    // Mock fallback
    return {
      nomeLoja: "Loja Centro",
      metricas: [
        {
          label: "Faturamento",
          valorLoja: 87450,
          valorRede: 72500,
          formatador: formatadores.currency,
        },
        {
          label: "Ticket Médio",
          valorLoja: 45.5,
          valorRede: 42.3,
          formatador: formatadores.currency,
        },
        {
          label: "Peças",
          valorLoja: 1523,
          valorRede: 1280,
          formatador: formatadores.number,
        },
        {
          label: "% Delivery",
          valorLoja: 28.5,
          valorRede: 22.0,
          formatador: formatadores.percent,
        },
      ],
    };
  }, [metricas, lojasSelecionadas]);

  // Gerar dados de sparkline para cada KPI (mock por enquanto)
  const sparklineDataMap = React.useMemo(() => {
    const map: Record<string, number[]> = {};
    kpis.forEach((kpi) => {
      // Gerar dados mock baseados no valor atual
      const baseValue = typeof kpi.value === "number" ? kpi.value : 0;
      map[kpi.id] = generateMockSparklineData(baseValue, 0.15, 7);
    });
    return map;
  }, [kpis]);

  // M2-K-003: Handler para abrir modal de detalhes do KPI
  const handleKPIPress = React.useCallback(
    (kpi: KPICardType) => {
      // Monta dados estendidos para o modal
      const detailData: KPIDetailData = {
        ...kpi,
        periodo: `${dataInicio.toLocaleDateString(
          "pt-BR"
        )} - ${dataFim.toLocaleDateString("pt-BR")}`,
        description: getKPIDescription(kpi.id),
        breakdown: getKPIBreakdown(kpi, metricas),
        meta: getKPIMeta(kpi.id, metricas),
        metaAtingida: getKPIMetaAtingida(kpi, metricas),
      };
      setSelectedKPI(detailData);
      setIsDetailModalVisible(true);
    },
    [dataInicio, dataFim, metricas]
  );

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

  // Loading state - mostra skeleton cards
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FilterBar />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={[styles.skeletonTitle, { color: colors.mutedText }]}>
            Carregando indicadores...
          </Text>
          <KPISkeletonGrid count={6} />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (isError && !metricas) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            <KPICardComponent
              key={kpi.id}
              data={kpi}
              sparklineData={sparklineDataMap[kpi.id]}
              onPress={() => handleKPIPress(kpi)}
            />
          ))}
        </View>

        {/* Comparativo Loja x Rede */}
        <ComparativoLojaRedeCard
          nomeLoja={comparativoData.nomeLoja}
          metricas={comparativoData.metricas}
          isLoading={isFetching}
        />

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
                {resumo.projecaoMes}
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

      {/* M2-K-003: Modal de detalhes do KPI */}
      <KPIDetailModal
        visible={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedKPI(null);
        }}
        data={selectedKPI}
      />
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
  kpiHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  sparklineContainer: {
    marginVertical: 6,
    alignItems: "center",
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
  skeletonTitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 8,
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
