/**
 * DateRangePicker - Modal de seleção de período
 * Permite selecionar intervalo de datas com presets rápidos
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTheme } from "@/shared/theme/ThemeProvider";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Tipos de preset de período
export type PeriodPreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

interface PresetOption {
  key: PeriodPreset;
  label: string;
  icon: string;
  getRange: () => { inicio: Date; fim: Date };
}

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  dataInicio: Date;
  dataFim: Date;
  onApply: (inicio: Date, fim: Date, preset?: PeriodPreset) => void;
  activePreset?: PeriodPreset;
}

// Gera os presets de período
function getPresetOptions(): PresetOption[] {
  return [
    {
      key: "today",
      label: "Hoje",
      icon: "calendar-today",
      getRange: () => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const fimHoje = new Date();
        fimHoje.setHours(23, 59, 59, 999);
        return { inicio: hoje, fim: fimHoje };
      },
    },
    {
      key: "yesterday",
      label: "Ontem",
      icon: "calendar-minus",
      getRange: () => {
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        ontem.setHours(0, 0, 0, 0);
        const fimOntem = new Date(ontem);
        fimOntem.setHours(23, 59, 59, 999);
        return { inicio: ontem, fim: fimOntem };
      },
    },
    {
      key: "last7days",
      label: "Últimos 7 dias",
      icon: "calendar-week",
      getRange: () => {
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);
        seteDiasAtras.setHours(0, 0, 0, 0);
        return { inicio: seteDiasAtras, fim: hoje };
      },
    },
    {
      key: "last30days",
      label: "Últimos 30 dias",
      icon: "calendar-month",
      getRange: () => {
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999);
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 29);
        trintaDiasAtras.setHours(0, 0, 0, 0);
        return { inicio: trintaDiasAtras, fim: hoje };
      },
    },
    {
      key: "thisMonth",
      label: "Este mês",
      icon: "calendar-month-outline",
      getRange: () => {
        const hoje = new Date();
        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        primeiroDia.setHours(0, 0, 0, 0);
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        ultimoDia.setHours(23, 59, 59, 999);
        return { inicio: primeiroDia, fim: ultimoDia };
      },
    },
    {
      key: "lastMonth",
      label: "Mês anterior",
      icon: "calendar-arrow-left",
      getRange: () => {
        const hoje = new Date();
        const primeiroDia = new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 1,
          1
        );
        primeiroDia.setHours(0, 0, 0, 0);
        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        ultimoDia.setHours(23, 59, 59, 999);
        return { inicio: primeiroDia, fim: ultimoDia };
      },
    },
    {
      key: "thisYear",
      label: "Este ano",
      icon: "calendar-blank-multiple",
      getRange: () => {
        const hoje = new Date();
        const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
        primeiroDiaAno.setHours(0, 0, 0, 0);
        hoje.setHours(23, 59, 59, 999);
        return { inicio: primeiroDiaAno, fim: hoje };
      },
    },
  ];
}

export function DateRangePicker({
  visible,
  onClose,
  dataInicio,
  dataFim,
  onApply,
  activePreset,
}: DateRangePickerProps) {
  const { colors } = useTheme();
  const presetOptions = useMemo(() => getPresetOptions(), []);

  const [tempInicio, setTempInicio] = useState(dataInicio);
  const [tempFim, setTempFim] = useState(dataFim);
  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset | null>(
    activePreset || null
  );
  const [showDatePicker, setShowDatePicker] = useState<"inicio" | "fim" | null>(
    null
  );

  // Sincronizar com props quando o modal abre
  useEffect(() => {
    if (visible) {
      setTempInicio(dataInicio);
      setTempFim(dataFim);
      setSelectedPreset(activePreset || null);
      setShowDatePicker(null);
    }
  }, [visible, dataInicio, dataFim, activePreset]);

  const handlePresetSelect = useCallback((preset: PresetOption) => {
    const range = preset.getRange();
    setTempInicio(range.inicio);
    setTempFim(range.fim);
    setSelectedPreset(preset.key);
  }, []);

  const handleApply = useCallback(() => {
    onApply(tempInicio, tempFim, selectedPreset || undefined);
    onClose();
  }, [tempInicio, tempFim, selectedPreset, onApply, onClose]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateShort = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(null);
    }
    if (event.type === "set" && selectedDate) {
      if (showDatePicker === "inicio") {
        selectedDate.setHours(0, 0, 0, 0);
        setTempInicio(selectedDate);
        // Se a data de início for maior que a de fim, ajusta
        if (selectedDate > tempFim) {
          setTempFim(selectedDate);
        }
      } else if (showDatePicker === "fim") {
        selectedDate.setHours(23, 59, 59, 999);
        setTempFim(selectedDate);
        // Se a data de fim for menor que a de início, ajusta
        if (selectedDate < tempInicio) {
          setTempInicio(selectedDate);
        }
      }
      setSelectedPreset("custom");
    }
  };

  // Descrição do período selecionado
  const periodDescription = useMemo(() => {
    const diffTime = Math.abs(tempFim.getTime() - tempInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dia${diffDays !== 1 ? "s" : ""} selecionado${
      diffDays !== 1 ? "s" : ""
    }`;
  }, [tempInicio, tempFim]);

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
            <View>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Selecionar Período
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.mutedText }]}>
                {periodDescription}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: colors.cardBorder },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Presets rápidos */}
            <View style={styles.presetsSection}>
              <Text
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Atalhos rápidos
              </Text>
              <View style={styles.presetsGrid}>
                {presetOptions.map((preset) => {
                  const isActive = selectedPreset === preset.key;
                  return (
                    <TouchableOpacity
                      key={preset.key}
                      style={[
                        styles.presetButton,
                        {
                          backgroundColor: isActive
                            ? colors.accent
                            : colors.background,
                          borderColor: isActive
                            ? colors.accent
                            : colors.cardBorder,
                        },
                      ]}
                      onPress={() => handlePresetSelect(preset)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={preset.icon as any}
                        size={18}
                        color={isActive ? "#FFF" : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.presetText,
                          { color: isActive ? "#FFF" : colors.textPrimary },
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Seleção manual de datas */}
            <View style={styles.customDateSection}>
              <Text
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                Período personalizado
              </Text>
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      borderColor:
                        showDatePicker === "inicio"
                          ? colors.accent
                          : colors.cardBorder,
                      backgroundColor: colors.background,
                    },
                  ]}
                  onPress={() => setShowDatePicker("inicio")}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="calendar-start"
                    size={20}
                    color={colors.accent}
                  />
                  <View style={styles.dateInputText}>
                    <Text
                      style={[styles.dateLabel, { color: colors.mutedText }]}
                    >
                      Data inicial
                    </Text>
                    <Text
                      style={[styles.dateValue, { color: colors.textPrimary }]}
                    >
                      {formatDateShort(tempInicio)}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View
                  style={[
                    styles.dateArrow,
                    { backgroundColor: colors.cardBorder },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={16}
                    color={colors.mutedText}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      borderColor:
                        showDatePicker === "fim"
                          ? colors.accent
                          : colors.cardBorder,
                      backgroundColor: colors.background,
                    },
                  ]}
                  onPress={() => setShowDatePicker("fim")}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="calendar-end"
                    size={20}
                    color={colors.accent}
                  />
                  <View style={styles.dateInputText}>
                    <Text
                      style={[styles.dateLabel, { color: colors.mutedText }]}
                    >
                      Data final
                    </Text>
                    <Text
                      style={[styles.dateValue, { color: colors.textPrimary }]}
                    >
                      {formatDateShort(tempFim)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Resumo do período */}
            <View
              style={[
                styles.summaryContainer,
                { backgroundColor: colors.accent + "10" },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-range"
                size={24}
                color={colors.accent}
              />
              <View style={styles.summaryText}>
                <Text
                  style={[styles.summaryLabel, { color: colors.textSecondary }]}
                >
                  Período selecionado
                </Text>
                <Text
                  style={[styles.summaryValue, { color: colors.textPrimary }]}
                >
                  {formatDate(tempInicio)} — {formatDate(tempFim)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* DateTimePicker nativo */}
          {showDatePicker && (
            <View
              style={[
                styles.datePickerContainer,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.datePickerHeader}>
                <Text
                  style={[
                    styles.datePickerTitle,
                    { color: colors.textPrimary },
                  ]}
                >
                  {showDatePicker === "inicio"
                    ? "Selecionar data inicial"
                    : "Selecionar data final"}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <Text style={{ color: colors.accent, fontWeight: "600" }}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={showDatePicker === "inicio" ? tempInicio : tempFim}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="pt-BR"
              />
            </View>
          )}

          {/* Footer */}
          <View
            style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}
          >
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.cardBorder }]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.accent }]}
              onPress={handleApply}
            >
              <MaterialCommunityIcons name="check" size={18} color="#FFF" />
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    flexShrink: 1,
  },
  presetsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  presetText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customDateSection: {
    padding: 16,
    paddingTop: 8,
  },
  dateRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 10,
  },
  dateInputText: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  dateArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  datePickerContainer: {
    borderTopWidth: 1,
    paddingBottom: 8,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
  },
  datePickerTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
