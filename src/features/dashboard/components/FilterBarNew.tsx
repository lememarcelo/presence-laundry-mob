/**
 * FilterBar - Barra de filtros do Dashboard
 * Componente principal que integra seleção de lojas, período e presets
 */

import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore, PeriodPresetKey } from "../stores/useFiltersStore";
import { useLojas } from "../hooks/useDashboardQueries";
import { LojaPicker } from "./LojaPicker";
import { DateRangePicker } from "./DateRangePicker";
import { PeriodPresetsInline } from "./PeriodPresets";

// ============================================
// FilterBar Component
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

  const [showLojasModal, setShowLojasModal] = useState(false);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

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
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Linha 1: Seletor de Lojas */}
      <View style={styles.row}>
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
          accessibilityRole="button"
          accessibilityLabel={`Selecionar lojas. Atualmente: ${lojasButtonText}`}
          accessibilityHint="Abre modal para selecionar as lojas a serem filtradas"
        >
          <MaterialCommunityIcons
            name="store"
            size={18}
            color={colors.accent}
          />
          <Text
            style={[styles.lojasText, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {lojasLoading ? "Carregando..." : lojasButtonText}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>
              {lojasSelecionadas.length === 0
                ? lojas.length || "..."
                : lojasSelecionadas.length}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.mutedText}
          />
        </TouchableOpacity>
      </View>

      {/* Linha 2: Presets de Período */}
      <View style={styles.row}>
        <PeriodPresetsInline
          activePreset={activePreset}
          onPresetSelect={handlePresetSelect}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onCustomPress={() => setShowPeriodoModal(true)}
        />
      </View>

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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  lojasButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    minHeight: 44, // Touch target mínimo de 44pt
  },
  lojasText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
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
