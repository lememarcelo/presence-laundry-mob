/**
 * PeriodPresets - Barra de presets rápidos de período
 * Exibe botões para seleção rápida de períodos comuns
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/shared/theme/ThemeProvider";

export type PeriodPresetKey =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

interface PresetConfig {
  key: PeriodPresetKey;
  label: string;
  shortLabel: string;
  icon: string;
  getRange: () => { inicio: Date; fim: Date };
}

interface PeriodPresetsProps {
  activePreset?: PeriodPresetKey;
  onPresetSelect: (inicio: Date, fim: Date, preset: PeriodPresetKey) => void;
  onCustomPress?: () => void;
  compact?: boolean;
}

// Gera configurações dos presets
function getPresetConfigs(): PresetConfig[] {
  return [
    {
      key: "today",
      label: "Hoje",
      shortLabel: "Hoje",
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
      key: "last7days",
      label: "7 dias",
      shortLabel: "7d",
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
      key: "thisMonth",
      label: "Este mês",
      shortLabel: "Mês",
      icon: "calendar-month",
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
      shortLabel: "M.Ant",
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
      shortLabel: "Ano",
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

export function PeriodPresets({
  activePreset,
  onPresetSelect,
  onCustomPress,
  compact = false,
}: PeriodPresetsProps) {
  const { colors } = useTheme();
  const presets = useMemo(() => getPresetConfigs(), []);

  const handlePresetPress = (preset: PresetConfig) => {
    const range = preset.getRange();
    onPresetSelect(range.inicio, range.fim, preset.key);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {presets.map((preset) => {
          const isActive = activePreset === preset.key;
          return (
            <TouchableOpacity
              key={preset.key}
              style={[
                styles.presetButton,
                compact && styles.presetButtonCompact,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderColor: isActive ? colors.accent : colors.cardBorder,
                },
              ]}
              onPress={() => handlePresetPress(preset)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Período: ${preset.label}${
                isActive ? ", selecionado" : ""
              }`}
              accessibilityHint={
                isActive ? undefined : `Toque para filtrar por ${preset.label}`
              }
            >
              {!compact && (
                <MaterialCommunityIcons
                  name={preset.icon as any}
                  size={16}
                  color={isActive ? "#FFF" : colors.textSecondary}
                />
              )}
              <Text
                style={[
                  styles.presetText,
                  compact && styles.presetTextCompact,
                  { color: isActive ? "#FFF" : colors.textPrimary },
                ]}
              >
                {compact ? preset.shortLabel : preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Botão customizado */}
        {onCustomPress && (
          <TouchableOpacity
            style={[
              styles.presetButton,
              compact && styles.presetButtonCompact,
              {
                backgroundColor:
                  activePreset === "custom" ? colors.accent : colors.surface,
                borderColor:
                  activePreset === "custom" ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={onCustomPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="calendar-edit"
              size={16}
              color={activePreset === "custom" ? "#FFF" : colors.textSecondary}
            />
            {!compact && (
              <Text
                style={[
                  styles.presetText,
                  {
                    color:
                      activePreset === "custom" ? "#FFF" : colors.textPrimary,
                  },
                ]}
              >
                Personalizado
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * PeriodPresetsInline - Versão inline para uso no header
 * Mais compacta, sem scroll
 */
interface PeriodPresetsInlineProps {
  activePreset?: PeriodPresetKey;
  onPresetSelect: (inicio: Date, fim: Date, preset: PeriodPresetKey) => void;
  dataInicio: Date;
  dataFim: Date;
  onCustomPress: () => void;
}

export function PeriodPresetsInline({
  activePreset,
  onPresetSelect,
  dataInicio,
  dataFim,
  onCustomPress,
}: PeriodPresetsInlineProps) {
  const { colors } = useTheme();

  // Presets reduzidos para inline
  const inlinePresets: PresetConfig[] = useMemo(
    () => [
      {
        key: "today" as const,
        label: "Hoje",
        shortLabel: "Hoje",
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
        key: "last7days" as const,
        label: "7 dias",
        shortLabel: "7d",
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
        key: "thisMonth" as const,
        label: "Mês",
        shortLabel: "Mês",
        icon: "calendar-month",
        getRange: () => {
          const hoje = new Date();
          const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          primeiroDia.setHours(0, 0, 0, 0);
          const ultimoDia = new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            0
          );
          ultimoDia.setHours(23, 59, 59, 999);
          return { inicio: primeiroDia, fim: ultimoDia };
        },
      },
    ],
    []
  );

  const handlePresetPress = (preset: PresetConfig) => {
    const range = preset.getRange();
    onPresetSelect(range.inicio, range.fim, preset.key);
  };

  // Formatar período customizado
  const customPeriodLabel = useMemo(() => {
    const formatShort = (d: Date) =>
      d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    return `${formatShort(dataInicio)} - ${formatShort(dataFim)}`;
  }, [dataInicio, dataFim]);

  const isCustomActive =
    activePreset === "custom" ||
    (!activePreset && !inlinePresets.some((p) => p.key === activePreset));

  return (
    <View style={styles.inlineContainer}>
      {inlinePresets.map((preset) => {
        const isActive = activePreset === preset.key;
        return (
          <TouchableOpacity
            key={preset.key}
            style={[
              styles.inlineButton,
              {
                backgroundColor: isActive ? colors.accent : "transparent",
                borderColor: isActive ? colors.accent : colors.cardBorder,
              },
            ]}
            onPress={() => handlePresetPress(preset)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.inlineButtonText,
                { color: isActive ? "#FFF" : colors.textPrimary },
              ]}
            >
              {preset.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Botão de período customizado */}
      <TouchableOpacity
        style={[
          styles.inlineButton,
          styles.customButton,
          {
            backgroundColor: isCustomActive ? colors.accent : "transparent",
            borderColor: isCustomActive ? colors.accent : colors.cardBorder,
          },
        ]}
        onPress={onCustomPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="calendar-range"
          size={14}
          color={isCustomActive ? "#FFF" : colors.textSecondary}
        />
        <Text
          style={[
            styles.inlineButtonText,
            { color: isCustomActive ? "#FFF" : colors.textPrimary },
          ]}
          numberOfLines={1}
        >
          {isCustomActive ? customPeriodLabel : "..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minHeight: 44, // Touch target mínimo de 44pt
  },
  presetButtonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44, // Touch target mínimo de 44pt
  },
  presetText: {
    fontSize: 13,
    fontWeight: "600",
  },
  presetTextCompact: {
    fontSize: 12,
  },
  // Inline styles
  inlineContainer: {
    flexDirection: "row",
    gap: 6,
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 44, // Touch target mínimo de 44pt
  },
  inlineButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  customButton: {
    minWidth: 80,
    maxWidth: 130,
  },
});
