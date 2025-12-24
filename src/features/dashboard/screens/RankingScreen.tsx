/**
 * Ranking Screen - Tela de rankings e comparativos
 * Exibe rankings de lojas e funcionários com badges e animações
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
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
import { FilterBar } from "../components/FilterBarNew";

type RankingType = "lojas" | "funcionarios";

// Tipo estendido para incluir código da loja e mudança de posição
interface RankingItemWithCode extends RankingItem {
  codigo?: string;
  positionChange?: number; // +2 = subiu 2, -1 = desceu 1, 0 = manteve
}

// Transforma dados da API em RankingItem[]
function transformRankingFromAPI(
  data: DadosRankingLojas
): RankingItemWithCode[] {
  // Validação: se não tem lojas, retorna array vazio
  if (!data?.lojas || !Array.isArray(data.lojas)) {
    return [];
  }

  return data.lojas.map((loja, index) => {
    // Garante valores seguros para evitar erros de undefined
    const faturamento = loja?.faturamento ?? 0;
    const posicao = loja?.posicao ?? index + 1;
    const codigo = loja?.codigo ?? `${index}`;
    const nome = loja?.nome ?? "Loja";
    const percentual = loja?.percentual ?? 0;

    // Simula mudança de posição (em produção viria do backend)
    // Gera valores entre -3 e +3 baseado no código para consistência
    const positionChangeSeed = (codigo.charCodeAt(0) % 7) - 3;
    const positionChange = index < 3 ? 0 : positionChangeSeed; // Top 3 sem mudança

    return {
      id: `loja-${codigo}`,
      codigo: codigo,
      position: posicao,
      name: nome,
      value: faturamento,
      formattedValue: `R$ ${faturamento.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      percentOfTotal: percentual,
      trend:
        positionChange > 0
          ? ("up" as const)
          : positionChange < 0
          ? ("down" as const)
          : ("stable" as const),
      positionChange: positionChange,
      badge:
        index === 0
          ? "gold"
          : index === 1
          ? "silver"
          : index === 2
          ? "bronze"
          : undefined,
    };
  });
}

// Componente animado de item de ranking
function RankingItemComponent({
  item,
  colors,
  isUserStore = false,
  index = 0,
  animationKey = 0,
}: {
  item: RankingItemWithCode;
  colors: any;
  isUserStore?: boolean;
  index?: number;
  animationKey?: number;
}) {
  // Animação de entrada - resetada quando animationKey muda
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Reset valores antes de animar
    fadeAnim.setValue(0);
    slideAnim.setValue(100);
    scaleAnim.setValue(0.8);

    const delay = index * 120; // 120ms entre cada item

    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [animationKey]); // Re-anima quando animationKey muda

  const badgeColors: Record<string, { bg: string; text: string }> = {
    gold: { bg: "#FEF3C7", text: "#D97706" },
    silver: { bg: "#F3F4F6", text: "#6B7280" },
    bronze: { bg: "#FED7AA", text: "#C2410C" },
  };

  const positionChange = item.positionChange ?? 0;
  const trendIcon =
    positionChange > 0
      ? "arrow-up-bold"
      : positionChange < 0
      ? "arrow-down-bold"
      : "minus";

  const trendColor =
    positionChange > 0
      ? "#10B981"
      : positionChange < 0
      ? "#EF4444"
      : colors.mutedText;

  return (
    <Animated.View
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
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
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

      {/* Indicador de mudança de posição */}
      {positionChange !== 0 && (
        <View
          style={[
            styles.positionChangeIndicator,
            { backgroundColor: trendColor + "20" },
          ]}
        >
          <MaterialCommunityIcons
            name={trendIcon}
            size={10}
            color={trendColor}
          />
          <Text style={[styles.positionChangeText, { color: trendColor }]}>
            {Math.abs(positionChange)}
          </Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
      </View>

      {/* Valor e percentual */}
      <View style={styles.valueContainer}>
        <Text style={[styles.itemValue, { color: colors.textPrimary }]}>
          {item.formattedValue}
        </Text>
        <Text style={[styles.percentText, { color: colors.mutedText }]}>
          {(item.percentOfTotal ?? 0).toFixed(1)}%
        </Text>
      </View>
    </Animated.View>
  );
}

export function RankingScreen() {
  const { colors, tokens } = useTheme();
  const [activeRanking, setActiveRanking] = useState<RankingType>("lojas");
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"faturamento" | "tickets" | "pecas">(
    "faturamento"
  );
  const { invalidateRanking } = useInvalidateDashboard();
  const { lojasSelecionadas } = useFiltersStore();

  // Regiões disponíveis para filtro
  const REGIOES = [
    { key: null, label: "Todas" },
    { key: "sudeste", label: "Sudeste" },
    { key: "sul", label: "Sul" },
    { key: "nordeste", label: "Nordeste" },
    { key: "norte", label: "Norte" },
    { key: "centro-oeste", label: "Centro-Oeste" },
  ];

  // Opções de ordenação
  const SORT_OPTIONS = [
    { key: "faturamento" as const, label: "Faturamento", icon: "cash" },
    { key: "tickets" as const, label: "Tickets", icon: "ticket-confirmation" },
    { key: "pecas" as const, label: "Peças", icon: "tshirt-crew" },
  ];

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

  // Simula região para cada loja (em produção viria do backend)
  const getLojaRegion = (codigo: string): string => {
    const codeNum = parseInt(codigo, 10) || 0;
    const regions = ["sudeste", "sul", "nordeste", "norte", "centro-oeste"];
    return regions[codeNum % regions.length];
  };

  // Filtra e ordena o ranking
  const filteredRankingLojas = useMemo(() => {
    let data = [...rankingLojas];

    // Filtra por região
    if (selectedRegion) {
      data = data.filter((item) => {
        const itemWithCode = item as RankingItemWithCode;
        return getLojaRegion(itemWithCode.codigo || "0") === selectedRegion;
      });
    }

    // Reordena (simulado - em produção o backend faria isso)
    if (sortBy !== "faturamento") {
      // Simula valores diferentes para outras métricas
      data = data
        .map((item, index) => ({
          ...item,
          // Inverte parcialmente a ordem para simular outra métrica
          _sortValue:
            sortBy === "tickets"
              ? item.value * (1 + (index % 3) * 0.1)
              : item.value * (1 - (index % 2) * 0.05),
        }))
        .sort((a, b) => (b as any)._sortValue - (a as any)._sortValue);
    }

    // Recalcula posições após filtro
    return data.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  }, [rankingLojas, selectedRegion, sortBy]);

  // Trigger animação quando filtros mudam
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [activeRanking, rankingLojasAPI, selectedRegion, sortBy]);

  const onRefresh = React.useCallback(async () => {
    await invalidateRanking();
    refetch();
  }, [invalidateRanking, refetch]);

  // Dados do ranking ativo (lojas ou funcionários)
  const rankingData =
    activeRanking === "lojas" ? filteredRankingLojas : mockRankingFuncionarios;

  const totalValue =
    activeRanking === "lojas" && rankingLojasAPI
      ? rankingLojasAPI.totalFaturamento ?? 0
      : rankingData.reduce((sum, item) => sum + (item.value ?? 0), 0);

  // Loading state para lojas
  if (isLoading && activeRanking === "lojas") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Carregando ranking...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filtros Globais */}
      <FilterBar />

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

      {/* Filtros de Região e Ordenação - apenas para ranking de lojas */}
      {activeRanking === "lojas" && (
        <View
          style={[styles.filtersContainer, { backgroundColor: colors.surface }]}
        >
          {/* Filtro por Região */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.mutedText }]}>
              Região:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {REGIOES.map((regiao) => (
                  <TouchableOpacity
                    key={regiao.key || "todas"}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          selectedRegion === regiao.key
                            ? colors.accent
                            : colors.background,
                        borderColor:
                          selectedRegion === regiao.key
                            ? colors.accent
                            : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setSelectedRegion(regiao.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color:
                            selectedRegion === regiao.key
                              ? "#FFF"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {regiao.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Ordenar por */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.mutedText }]}>
              Ordenar:
            </Text>
            <View style={styles.filterChips}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        sortBy === option.key
                          ? colors.accent
                          : colors.background,
                      borderColor:
                        sortBy === option.key
                          ? colors.accent
                          : colors.cardBorder,
                    },
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={14}
                    color={
                      sortBy === option.key ? "#FFF" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          sortBy === option.key ? "#FFF" : colors.textSecondary,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

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

          {rankingData.map((item, index) => {
            // Verifica se é a loja do usuário (comparando código)
            const itemWithCode = item as RankingItemWithCode;
            const isUserStore =
              activeRanking === "lojas" &&
              itemWithCode.codigo === userStoreCode;

            return (
              <RankingItemComponent
                key={`${item.id}-${animationKey}`}
                item={itemWithCode}
                colors={colors}
                isUserStore={isUserStore}
                index={index}
                animationKey={animationKey}
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
                ? `R$ ${(totalValue ?? 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`
                : `${totalValue ?? 0} atendimentos`}
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
    </View>
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
  positionChangeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    marginRight: 4,
  },
  positionChangeText: {
    fontSize: 10,
    fontWeight: "700",
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 55,
  },
  filterChips: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
