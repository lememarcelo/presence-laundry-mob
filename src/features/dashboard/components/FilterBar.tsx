/**
 * FilterBar - Barra de filtros do Dashboard
 * Permite selecionar lojas e período de análise
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useFiltersStore } from "../stores/useFiltersStore";
import { useLojas } from "../hooks/useDashboardQueries";
import { Loja } from "../api/dashboard.service";

// ============================================
// FilterBar Component
// ============================================

export function FilterBar() {
  const { colors, tokens } = useTheme();
  const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();
  const {
    data: lojas = [],
    isLoading: lojasLoading,
    isError: lojasError,
    error: lojasQueryError,
  } = useLojas();

  console.log("[FilterBar] Lojas state:", {
    count: lojas.length,
    isLoading: lojasLoading,
    isError: lojasError,
    error: lojasQueryError?.message,
  });

  const [showLojasModal, setShowLojasModal] = useState(false);
  const [showPeriodoModal, setShowPeriodoModal] = useState(false);

  // Texto do botão de lojas
  const lojasButtonText = useMemo(() => {
    if (lojasSelecionadas.length === 0) {
      return "Todas as lojas";
    }
    if (lojasSelecionadas.length === 1) {
      const loja = lojas.find((l) => l.codigo === lojasSelecionadas[0]);
      return loja?.nome ?? lojasSelecionadas[0];
    }
    return `${lojasSelecionadas.length} lojas`;
  }, [lojasSelecionadas, lojas]);

  // Texto do período
  const periodoText = useMemo(() => {
    const formatDate = (date: Date) =>
      date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${formatDate(dataInicio)} - ${formatDate(dataFim)}`;
  }, [dataInicio, dataFim]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Botão de Lojas */}
      <TouchableOpacity
        style={[styles.filterButton, { borderColor: colors.cardBorder }]}
        onPress={() => setShowLojasModal(true)}
      >
        <MaterialCommunityIcons name="store" size={18} color={colors.accent} />
        <Text
          style={[styles.filterText, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {lojasButtonText}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={colors.mutedText}
        />
      </TouchableOpacity>

      {/* Botão de Período */}
      <TouchableOpacity
        style={[styles.filterButton, { borderColor: colors.cardBorder }]}
        onPress={() => setShowPeriodoModal(true)}
      >
        <MaterialCommunityIcons
          name="calendar-range"
          size={18}
          color={colors.accent}
        />
        <Text
          style={[styles.filterText, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {periodoText}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color={colors.mutedText}
        />
      </TouchableOpacity>

      {/* Modal de Lojas */}
      <LojasModal
        visible={showLojasModal}
        onClose={() => setShowLojasModal(false)}
        lojas={lojas}
      />

      {/* Modal de Período */}
      <PeriodoModal
        visible={showPeriodoModal}
        onClose={() => setShowPeriodoModal(false)}
      />
    </View>
  );
}

// ============================================
// LojasModal Component
// ============================================

interface LojasModalProps {
  visible: boolean;
  onClose: () => void;
  lojas: Loja[];
}

function LojasModal({ visible, onClose, lojas }: LojasModalProps) {
  const { colors, tokens } = useTheme();
  const { lojasSelecionadas, setLojasSelecionadas } = useFiltersStore();
  const [searchText, setSearchText] = useState("");

  // Estado LOCAL temporário - só aplica ao clicar em "Aplicar Filtro"
  const [tempSelecionadas, setTempSelecionadas] = useState<string[]>([]);

  console.log("[LojasModal] lojas recebidas:", lojas.length);

  // Sincroniza estado local quando o modal abre
  useEffect(() => {
    if (visible) {
      setTempSelecionadas(lojasSelecionadas);
      setSearchText("");
    }
  }, [visible, lojasSelecionadas]);

  // Filtra lojas pelo texto de busca
  const filteredLojas = useMemo(() => {
    if (!searchText.trim()) return lojas;
    const search = searchText.toLowerCase();
    return lojas.filter(
      (loja) =>
        loja.nome.toLowerCase().includes(search) ||
        loja.codigo.toLowerCase().includes(search)
    );
  }, [lojas, searchText]);

  // Marcar TODAS as lojas
  const handleSelectAll = useCallback(() => {
    const allCodigos = lojas.map((l) => l.codigo);
    setTempSelecionadas(allCodigos);
  }, [lojas]);

  // Limpar seleção (desmarcar todas)
  const handleClearAll = useCallback(() => {
    setTempSelecionadas([]);
  }, []);

  // Toggle individual de uma loja
  const handleToggleLoja = useCallback((codigo: string) => {
    setTempSelecionadas((prev) => {
      if (prev.includes(codigo)) {
        return prev.filter((c) => c !== codigo);
      } else {
        return [...prev, codigo];
      }
    });
  }, []);

  // Verifica se uma loja está selecionada
  const isSelected = useCallback(
    (codigo: string) => tempSelecionadas.includes(codigo),
    [tempSelecionadas]
  );

  // Aplicar filtro e fechar modal
  const handleAplicar = useCallback(() => {
    setLojasSelecionadas(tempSelecionadas);
    onClose();
  }, [tempSelecionadas, setLojasSelecionadas, onClose]);

  const renderLojaItem = useCallback(
    ({ item }: { item: Loja }) => (
      <TouchableOpacity
        style={[
          styles.lojaItem,
          {
            backgroundColor: isSelected(item.codigo)
              ? colors.accent + "15"
              : "transparent",
            borderBottomColor: colors.cardBorder,
          },
        ]}
        onPress={() => handleToggleLoja(item.codigo)}
      >
        <View style={styles.lojaInfo}>
          <Text style={[styles.lojaCodigo, { color: colors.mutedText }]}>
            {item.codigo}
          </Text>
          <Text style={[styles.lojaNome, { color: colors.textPrimary }]}>
            {item.nome}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={
            isSelected(item.codigo)
              ? "checkbox-marked"
              : "checkbox-blank-outline"
          }
          size={24}
          color={isSelected(item.codigo) ? colors.accent : colors.mutedText}
        />
      </TouchableOpacity>
    ),
    [colors, isSelected, handleToggleLoja]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.surface }]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Selecionar Lojas
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Busca */}
          <View
            style={[styles.searchContainer, { borderColor: colors.cardBorder }]}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={colors.mutedText}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar loja..."
              placeholderTextColor={colors.mutedText}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color={colors.mutedText}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Ações rápidas */}
          <View style={styles.quickActions}>
            <View style={styles.quickActionsButtons}>
              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor:
                      tempSelecionadas.length === lojas.length &&
                      lojas.length > 0
                        ? colors.accent + "20"
                        : "transparent",
                    borderColor: colors.accent,
                  },
                ]}
                onPress={handleSelectAll}
              >
                <Text
                  style={[styles.quickActionText, { color: colors.accent }]}
                >
                  Todas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor:
                      tempSelecionadas.length === 0
                        ? "#EF444420"
                        : "transparent",
                    borderColor: "#EF4444",
                  },
                ]}
                onPress={handleClearAll}
              >
                <Text style={[styles.quickActionText, { color: "#EF4444" }]}>
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.mutedText, fontSize: 12 }}>
              {tempSelecionadas.length === 0
                ? "Nenhuma selecionada"
                : `${tempSelecionadas.length} selecionada(s)`}
            </Text>
          </View>

          {/* Lista de lojas */}
          <FlatList
            data={filteredLojas}
            keyExtractor={(item) => item.codigo}
            renderItem={renderLojaItem}
            style={styles.lojasList}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: "center" }}>
                <Text style={{ color: colors.mutedText }}>
                  {lojas.length === 0
                    ? "Carregando lojas..."
                    : "Nenhuma loja encontrada"}
                </Text>
              </View>
            }
          />

          {/* Footer */}
          <View
            style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}
          >
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: colors.accent }]}
              onPress={handleAplicar}
            >
              <Text style={styles.footerButtonText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// PeriodoModal Component
// ============================================

interface PeriodoModalProps {
  visible: boolean;
  onClose: () => void;
}

function PeriodoModal({ visible, onClose }: PeriodoModalProps) {
  const { colors } = useTheme();
  const { dataInicio, dataFim, setPeriodo } = useFiltersStore();

  const [tempInicio, setTempInicio] = useState(dataInicio);
  const [tempFim, setTempFim] = useState(dataFim);
  const [showDatePicker, setShowDatePicker] = useState<"inicio" | "fim" | null>(
    null
  );

  // Sincronizar com o store quando o modal abre
  useEffect(() => {
    if (visible) {
      setTempInicio(dataInicio);
      setTempFim(dataFim);
    }
  }, [visible, dataInicio, dataFim]);

  // Presets de período
  const presets = useMemo(() => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const primeiroDiaMesAnterior = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - 1,
      1
    );
    const ultimoDiaMesAnterior = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      0
    );
    const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      { label: "Hoje", inicio: hoje, fim: hoje },
      { label: "Últimos 7 dias", inicio: seteDiasAtras, fim: hoje },
      { label: "Últimos 30 dias", inicio: trintaDiasAtras, fim: hoje },
      { label: "Mês atual", inicio: primeiroDiaMes, fim: ultimoDiaMes },
      {
        label: "Mês anterior",
        inicio: primeiroDiaMesAnterior,
        fim: ultimoDiaMesAnterior,
      },
      { label: "Ano atual", inicio: primeiroDiaAno, fim: hoje },
    ];
  }, []);

  const handlePresetSelect = useCallback(
    (preset: { inicio: Date; fim: Date }) => {
      setTempInicio(preset.inicio);
      setTempFim(preset.fim);
    },
    []
  );

  const handleApply = useCallback(() => {
    setPeriodo(tempInicio, tempFim);
    onClose();
  }, [tempInicio, tempFim, setPeriodo, onClose]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(null);
    }
    if (selectedDate) {
      if (showDatePicker === "inicio") {
        setTempInicio(selectedDate);
      } else if (showDatePicker === "fim") {
        setTempFim(selectedDate);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            styles.periodoModalContent,
            { backgroundColor: colors.surface },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Selecionar Período
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Presets */}
          <View style={styles.presetsContainer}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  styles.presetButton,
                  { borderColor: colors.cardBorder },
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text
                  style={[styles.presetText, { color: colors.textSecondary }]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Seleção manual */}
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.dateInput, { borderColor: colors.cardBorder }]}
              onPress={() => setShowDatePicker("inicio")}
            >
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                Data inicial
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                {formatDate(tempInicio)}
              </Text>
            </TouchableOpacity>

            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={colors.mutedText}
            />

            <TouchableOpacity
              style={[styles.dateInput, { borderColor: colors.cardBorder }]}
              onPress={() => setShowDatePicker("fim")}
            >
              <Text style={{ color: colors.mutedText, fontSize: 12 }}>
                Data final
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 16 }}>
                {formatDate(tempFim)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={showDatePicker === "inicio" ? tempInicio : tempFim}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Footer */}
          <View
            style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}
          >
            <TouchableOpacity
              style={[styles.footerButton, { backgroundColor: colors.accent }]}
              onPress={handleApply}
            >
              <Text style={styles.footerButtonText}>Aplicar Período</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  filterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: 500,
    height: "85%",
  },
  periodoModalContent: {
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // Quick actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActionsButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Lojas list
  lojasList: {
    flex: 1,
  },
  lojaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lojaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  lojaCodigo: {
    fontSize: 12,
    fontWeight: "600",
    width: 30,
  },
  lojaNome: {
    fontSize: 14,
    flex: 1,
  },

  // Periodo modal
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
