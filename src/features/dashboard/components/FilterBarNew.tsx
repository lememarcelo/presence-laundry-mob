/**
 * FilterBar - Barra de filtros do Dashboard
 * Componente colapsável que mostra resumo compacto ou opções expandidas
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore, PeriodPresetKey } from "../stores/useFiltersStore";
import { useLojas } from "../hooks/useDashboardQueries";
import { LojaPicker } from "./LojaPicker";
import { DateRangePicker } from "./DateRangePicker";
import { PeriodPresetsInline } from "./PeriodPresets";
import { OfflineBanner } from "./OfflineIndicator";

// Habilita LayoutAnimation no Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================
// FilterBar Component (Collapsible)
// ============================================

export function FilterBar() {
  const { colors } = useTheme();
  const {
    dataInicio,
    dataFim,
    lojasSelecionadas,
    activePreset,
    setLojasSelecionadas,
    setPeriodo,
  } = useFiltersStore();

  const { data: lojas = [], isLoading: lojasLoading } = useLojas();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showLojasModal, setShowLojasModal] = useState(false);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

  // Toggle expand/collapse com animação
  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  // Texto do botão de lojas
  const lojasButtonText = useMemo(() => {
    if (lojasSelecionadas.length === 0) {
      return "Todas";
    }
    if (lojasSelecionadas.length === 1) {
      const loja = lojas.find((l) => l.codigo === lojasSelecionadas[0]);
      return loja?.nome ?? lojasSelecionadas[0];
    }
    return `${lojasSelecionadas.length} lojas`;
  }, [lojasSelecionadas, lojas]);

  // Texto do período para versão compacta
  const periodoText = useMemo(() => {
    const presetLabels: Record<string, string> = {
      today: "Hoje",
      yesterday: "Ontem",
      last7days: "7 dias",
      thisMonth: "Mês",
      lastMonth: "Mês ant.",
      thisYear: "Ano",
    };
    if (activePreset && presetLabels[activePreset]) {
      return presetLabels[activePreset];
    }
    const formatShort = (d: Date) =>
      d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${formatShort(dataInicio)} - ${formatShort(dataFim)}`;
  }, [activePreset, dataInicio, dataFim]);

  // Handler para aplicar seleção de lojas
  const handleLojasApply = useCallback(
    (selectedLojas: string[]) => {
      setLojasSelecionadas(selectedLojas);
    },
    [setLojasSelecionadas]
  );

  // Handler para aplicar período
  const handlePeriodoApply = useCallback(
    (inicio: Date, fim: Date, preset?: PeriodPresetKey) => {
      setPeriodo(inicio, fim, preset);
    },
    [setPeriodo]
  );

  // Handler para presets inline
  const handlePresetSelect = useCallback(
    (inicio: Date, fim: Date, preset: PeriodPresetKey) => {
      setPeriodo(inicio, fim, preset);
    },
    [setPeriodo]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Banner de Offline */}
      <OfflineBanner />

      {/* Versão Compacta (Colapsada) */}
      {!isExpanded && (
        <TouchableOpacity
          style={[
            styles.compactBar,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.textPrimary,
            },
          ]}
          onPress={toggleExpanded}
          activeOpacity={0.8}
        >
          {/* Loja */}
          <TouchableOpacity
            style={[
              styles.compactChip,
              { backgroundColor: colors.accent + "15" },
            ]}
            onPress={() => setShowLojasModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="storefront-outline"
              size={16}
              color={colors.accent}
            />
            <Text
              style={[styles.compactChipText, { color: colors.accent }]}
              numberOfLines={1}
            >
              {lojasLoading ? "..." : lojasButtonText}
            </Text>
            {lojasSelecionadas.length > 0 && (
              <View
                style={[
                  styles.compactBadge,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Text style={styles.compactBadgeText}>
                  {lojasSelecionadas.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View
            style={[styles.compactDot, { backgroundColor: colors.mutedText }]}
          />

          {/* Período */}
          <TouchableOpacity
            style={[
              styles.compactChip,
              { backgroundColor: colors.accent + "15" },
            ]}
            onPress={() => setShowPeriodoModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="calendar-range"
              size={16}
              color={colors.accent}
            />
            <Text style={[styles.compactChipText, { color: colors.accent }]}>
              {periodoText}
            </Text>
          </TouchableOpacity>

          {/* Botão Expandir */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={toggleExpanded}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Versão Expandida */}
      {isExpanded && (
        <View
          style={[
            styles.filterCard,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.textPrimary,
            },
          ]}
        >
          {/* Header com botão de colapsar */}
          <TouchableOpacity
            style={styles.collapseHeader}
            onPress={toggleExpanded}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTitle, { color: colors.textPrimary }]}>
              Filtros
            </Text>
            <MaterialCommunityIcons
              name="chevron-up"
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>

          {/* Seletor de Lojas */}
          <TouchableOpacity
            style={[
              styles.lojasButton,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.background,
              },
            ]}
            onPress={() => setShowLojasModal(true)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.lojaIconContainer,
                { backgroundColor: colors.accent + "15" },
              ]}
            >
              <MaterialCommunityIcons
                name="storefront-outline"
                size={18}
                color={colors.accent}
              />
            </View>
            <View style={styles.lojaTextContainer}>
              <Text style={[styles.lojaLabel, { color: colors.mutedText }]}>
                Lojas
              </Text>
              <Text
                style={[styles.lojasText, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {lojasLoading ? "Carregando..." : lojasButtonText}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>
                {lojasSelecionadas.length === 0
                  ? lojas.length || "..."
                  : lojasSelecionadas.length}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.mutedText}
            />
          </TouchableOpacity>

          {/* Separador visual */}
          <View
            style={[styles.separator, { backgroundColor: colors.cardBorder }]}
          />

          {/* Presets de Período */}
          <View style={styles.periodSection}>
            <Text style={[styles.periodLabel, { color: colors.mutedText }]}>
              Período
            </Text>
            <PeriodPresetsInline
              activePreset={activePreset}
              onPresetSelect={handlePresetSelect}
              dataInicio={dataInicio}
              dataFim={dataFim}
              onCustomPress={() => setShowPeriodoModal(true)}
            />
          </View>
        </View>
      )}

      {/* Modal de Lojas */}
      <LojaPicker
        visible={showLojasModal}
        onClose={() => setShowLojasModal(false)}
        lojas={lojas}
        selectedLojas={lojasSelecionadas}
        onApply={handleLojasApply}
      />

      {/* Modal de Período */}
      <DateRangePicker
        visible={showPeriodoModal}
        onClose={() => setShowPeriodoModal(false)}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onApply={handlePeriodoApply}
        activePreset={activePreset}
      />
    </View>
  );
}

// ============================================
// FilterBarCompact - Versão compacta para headers
// ============================================

export function FilterBarCompact() {
  const { colors } = useTheme();
  const {
    dataInicio,
    dataFim,
    lojasSelecionadas,
    activePreset,
    setLojasSelecionadas,
    setPeriodo,
  } = useFiltersStore();

  const { data: lojas = [] } = useLojas();

  const [showLojasModal, setShowLojasModal] = useState(false);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

  // Texto do botão de lojas
  const lojasButtonText = useMemo(() => {
    if (lojasSelecionadas.length === 0) return "Todas";
    if (lojasSelecionadas.length === 1) {
      const loja = lojas.find((l) => l.codigo === lojasSelecionadas[0]);
      return loja?.nome?.substring(0, 10) ?? lojasSelecionadas[0];
    }
    return `${lojasSelecionadas.length}`;
  }, [lojasSelecionadas, lojas]);

  // Texto do período
  const periodoText = useMemo(() => {
    const formatDate = (date: Date) =>
      date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${formatDate(dataInicio)} - ${formatDate(dataFim)}`;
  }, [dataInicio, dataFim]);

  const handleLojasApply = useCallback(
    (selectedLojas: string[]) => setLojasSelecionadas(selectedLojas),
    [setLojasSelecionadas]
  );

  const handlePeriodoApply = useCallback(
    (inicio: Date, fim: Date, preset?: PeriodPresetKey) =>
      setPeriodo(inicio, fim, preset),
    [setPeriodo]
  );

  return (
    <View
      style={[styles.compactContainer, { backgroundColor: colors.surface }]}
    >
      {/* Botão de Lojas */}
      <TouchableOpacity
        style={[styles.compactButton, { borderColor: colors.cardBorder }]}
        onPress={() => setShowLojasModal(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="store" size={16} color={colors.accent} />
        <Text
          style={[styles.compactText, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {lojasButtonText}
        </Text>
      </TouchableOpacity>

      {/* Botão de Período */}
      <TouchableOpacity
        style={[
          styles.compactButton,
          styles.compactButtonPeriodo,
          { borderColor: colors.cardBorder },
        ]}
        onPress={() => setShowPeriodoModal(true)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="calendar-range"
          size={16}
          color={colors.accent}
        />
        <Text
          style={[styles.compactText, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {periodoText}
        </Text>
      </TouchableOpacity>

      {/* Modals */}
      <LojaPicker
        visible={showLojasModal}
        onClose={() => setShowLojasModal(false)}
        lojas={lojas}
        selectedLojas={lojasSelecionadas}
        onApply={handleLojasApply}
      />

      <DateRangePicker
        visible={showPeriodoModal}
        onClose={() => setShowPeriodoModal(false)}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onApply={handlePeriodoApply}
        activePreset={activePreset}
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  // Compact bar styles (collapsed state)
  compactBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  compactChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  compactChipText: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 100,
  },
  compactBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  compactBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  compactDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  expandButton: {
    marginLeft: "auto",
    padding: 4,
  },
  // Expanded card styles
  filterCard: {
    borderRadius: 14,
    padding: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  collapseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  lojasButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    minHeight: 48,
  },
  lojaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lojaTextContainer: {
    flex: 1,
  },
  lojaLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  lojasText: {
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 4,
  },
  periodSection: {
    gap: 8,
  },
  periodLabel: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },

  // Compact styles
  compactContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10, // Aumentado para atingir 44pt com fonte
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minHeight: 44, // Touch target mínimo de 44pt
  },
  compactButtonPeriodo: {
    flex: 1,
  },
  compactText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default FilterBar;
