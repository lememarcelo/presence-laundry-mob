/**
 * Ranking Screen - Tela de rankings e comparativos
 * Exibe rankings de lojas e funcionários com badges
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore } from "../stores/useFiltersStore";
import { mockRankingLojas, mockRankingFuncionarios } from "../data/mock-data";
import { RankingItem } from "@/models/dashboard.models";
import {
  useRankingLojas,
  useInvalidateDashboard,
} from "../hooks/useDashboardQueries";
import { DadosRankingLojas } from "../api/dashboard.service";

type RankingType = "lojas" | "funcionarios";

// Tipo estendido para incluir código da loja
interface RankingItemWithCode extends RankingItem {
  codigo?: string;
}

// Transforma dados da API em RankingItem[]
function transformRankingFromAPI(
  data: DadosRankingLojas
): RankingItemWithCode[] {
  return data.lojas.map((loja, index) => ({
    id: `loja-${loja.codigo}`,
    codigo: loja.codigo,
    position: loja.posicao,
    name: loja.nome,
    value: loja.faturamento,
    formattedValue: `R$ ${loja.faturamento.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    percentOfTotal: loja.percentual,
    trend: "stable" as const,
    badge:
      index === 0
        ? "gold"
        : index === 1
        ? "silver"
        : index === 2
        ? "bronze"
        : undefined,
  }));
}

// Componente de item de ranking
function RankingItemComponent({
  item,
  colors,
  isUserStore = false,
}: {
  item: RankingItem;
  colors: any;
  isUserStore?: boolean;
}) {
  const badgeColors: Record<string, { bg: string; text: string }> = {
    gold: { bg: "#FEF3C7", text: "#D97706" },
    silver: { bg: "#F3F4F6", text: "#6B7280" },
    bronze: { bg: "#FED7AA", text: "#C2410C" },
  };

  const trendIcon =
    item.trend === "up"
      ? "arrow-up"
      : item.trend === "down"
      ? "arrow-down"
      : "minus";

  const trendColor =
    item.trend === "up"
      ? "#10B981"
      : item.trend === "down"
      ? "#EF4444"
      : colors.mutedText;

  return (
    <View
      style={[
        styles.rankingItem,
        { borderBottomColor: colors.cardBorder },
        item.position <= 3 && styles.topThreeItem,
        isUserStore && styles.userStoreItem,
        isUserStore && {
          backgroundColor: colors.accent + "15",
          borderLeftColor: colors.accent,
          borderLeftWidth: 3,
        },
      ]}
    >
      {/* Posição */}
      <View style={styles.positionContainer}>
        {item.badge ? (
          <View
            style={[
              styles.badgeCircle,
              {
                backgroundColor: badgeColors[item.badge]?.bg || colors.surface,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="trophy"
              size={16}
              color={badgeColors[item.badge]?.text || colors.mutedText}
            />
          </View>
        ) : (
          <Text style={[styles.positionNumber, { color: colors.mutedText }]}>
            {item.position}º
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
      </View>

      {/* Valor e tendência */}
      <View style={styles.valueContainer}>
        <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
          {item.formattedValue}
        </Text>
        <View style={styles.trendContainer}>
          <MaterialCommunityIcons
            name={trendIcon}
            size={12}
            color={trendColor}
          />
          <Text style={[styles.percentText, { color: trendColor }]}>
            {(item.percentOfTotal ?? 0).toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export function RankingScreen() {
  const { colors, tokens } = useTheme();
  const [activeRanking, setActiveRanking] = useState<RankingType>("lojas");
  const { invalidateRanking } = useInvalidateDashboard();
  const { lojasSelecionadas } = useFiltersStore();

  // Código da loja do usuário (primeira loja selecionada ou padrão "01")
  const userStoreCode =
    lojasSelecionadas.length > 0 ? lojasSelecionadas[0] : "01";

  // Query para ranking de lojas
  const {
    data: rankingLojasAPI,
    isLoading,
    isFetching,
    refetch,
  } = useRankingLojas();

  // Transforma dados da API ou usa mock como fallback
  const rankingLojas = useMemo(() => {
    if (rankingLojasAPI) {
      return transformRankingFromAPI(rankingLojasAPI);
    }
    return mockRankingLojas;
  }, [rankingLojasAPI]);

  const onRefresh = React.useCallback(async () => {
    await invalidateRanking();
    refetch();
  }, [invalidateRanking, refetch]);

  // Dados do ranking ativo (lojas ou funcionários)
  const rankingData =
    activeRanking === "lojas" ? rankingLojas : mockRankingFuncionarios;

  const totalValue =
    activeRanking === "lojas" && rankingLojasAPI
      ? rankingLojasAPI.totalFaturamento
      : rankingData.reduce((sum, item) => sum + item.value, 0);

  // Loading state para lojas
  if (isLoading && activeRanking === "lojas") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando ranking...
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
      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeRanking === "lojas" && {
              borderBottomColor: colors.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveRanking("lojas")}
        >
          <MaterialCommunityIcons
            name="store"
            size={20}
            color={activeRanking === "lojas" ? colors.accent : colors.mutedText}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  activeRanking === "lojas" ? colors.accent : colors.mutedText,
              },
            ]}
          >
            Lojas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeRanking === "funcionarios" && {
              borderBottomColor: colors.accent,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveRanking("funcionarios")}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={
              activeRanking === "funcionarios"
                ? colors.accent
                : colors.mutedText
            }
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  activeRanking === "funcionarios"
                    ? colors.accent
                    : colors.mutedText,
              },
            ]}
          >
            Funcionários
          </Text>
        </TouchableOpacity>
      </View>

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
        {/* Card de destaque do líder */}
        {rankingData.length > 0 && (
          <View
            style={[
              styles.leaderCard,
              {
                backgroundColor: colors.accent + "15",
                borderColor: colors.accent,
              },
            ]}
          >
            <MaterialCommunityIcons name="crown" size={32} color="#D97706" />
            <View style={styles.leaderInfo}>
              <Text style={[styles.leaderLabel, { color: colors.mutedText }]}>
                Líder do Ranking
              </Text>
              <Text style={[styles.leaderName, { color: colors.textPrimary }]}>
                {rankingData[0].name}
              </Text>
              <Text style={[styles.leaderValue, { color: colors.accent }]}>
                {rankingData[0].formattedValue}
              </Text>
            </View>
            <View style={styles.leaderPercentContainer}>
              <Text style={[styles.leaderPercent, { color: colors.accent }]}>
                {(rankingData[0].percentOfTotal ?? 0).toFixed(0)}%
              </Text>
              <Text
                style={[styles.leaderPercentLabel, { color: colors.mutedText }]}
              >
                do total
              </Text>
            </View>
          </View>
        )}

        {/* Lista de ranking */}
        <View
          style={[
            styles.rankingCard,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.rankingHeader}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={20}
              color={colors.accent}
            />
            <Text
              style={[
                styles.rankingTitle,
                { color: colors.textPrimary, fontSize: tokens.typography.h3 },
              ]}
            >
              {activeRanking === "lojas"
                ? "Ranking por Faturamento"
                : "Ranking por Atendimentos"}
            </Text>
          </View>

          {rankingData.map((item) => {
            // Verifica se é a loja do usuário (comparando código)
            const itemWithCode = item as RankingItemWithCode;
            const isUserStore =
              activeRanking === "lojas" &&
              itemWithCode.codigo === userStoreCode;

            return (
              <RankingItemComponent
                key={item.id}
                item={item}
                colors={colors}
                isUserStore={isUserStore}
              />
            );
          })}

          {/* Total */}
          <View
            style={[styles.totalRow, { borderTopColor: colors.cardBorder }]}
          >
            <Text style={[styles.totalLabel, { color: colors.mutedText }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: colors.textPrimary }]}>
              {activeRanking === "lojas"
                ? `R$ ${totalValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : `${totalValue} atendimentos`}
            </Text>
          </View>
        </View>

        {/* Insights */}
        <View
          style={[
            styles.insightsCard,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={20}
              color="#10B981"
            />
            <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>
              Destaques
            </Text>
          </View>
          {activeRanking === "lojas" ? (
            <>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Loja Centro lidera com 37% do faturamento total
              </Text>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Top 3 representam 87,5% das vendas
              </Text>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Loja Norte precisa de atenção (-12% vs período anterior)
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Maria Silva mantém liderança pelo 3º mês consecutivo
              </Text>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Equipe Sênior representa 60% dos atendimentos
              </Text>
              <Text
                style={[styles.insightText, { color: colors.textSecondary }]}
              >
                • Carla Mendes teve maior crescimento (+23%)
              </Text>
            </>
          )}
        </View>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  leaderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 16,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  leaderName: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  leaderValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  leaderPercentContainer: {
    alignItems: "center",
  },
  leaderPercent: {
    fontSize: 28,
    fontWeight: "700",
  },
  leaderPercentLabel: {
    fontSize: 10,
  },
  rankingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  rankingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  rankingTitle: {
    fontWeight: "600",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topThreeItem: {
    paddingVertical: 14,
  },
  userStoreItem: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  positionContainer: {
    width: 40,
    alignItems: "center",
  },
  badgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  percentText: {
    fontSize: 11,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  insightsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  insightText: {
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
