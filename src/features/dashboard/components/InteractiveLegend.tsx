/**
 * InteractiveLegend - Legenda interativa para gráficos
 * M3-C-005: Legendas interativas nos gráficos
 *
 * Permite toggle de séries ao tocar nos itens da legenda
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "@/shared/theme/ThemeProvider";

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  value?: string | number;
  formattedValue?: string;
}

interface InteractiveLegendProps {
  /** Itens da legenda */
  items: LegendItem[];
  /** Chaves dos itens visíveis */
  visibleKeys: string[];
  /** Callback quando um item é toggled */
  onToggle: (key: string) => void;
  /** Layout horizontal ou vertical */
  layout?: "horizontal" | "vertical";
  /** Mostrar valores ao lado dos labels */
  showValues?: boolean;
  /** Permitir toggle (default: true) */
  interactive?: boolean;
}

export function InteractiveLegend({
  items,
  visibleKeys,
  onToggle,
  layout = "vertical",
  showValues = true,
  interactive = true,
}: InteractiveLegendProps) {
  const { colors } = useTheme();

  const isHorizontal = layout === "horizontal";

  return (
    <ScrollView
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        isHorizontal ? styles.containerHorizontal : styles.containerVertical,
      ]}
    >
      {items.map((item) => {
        const isVisible = visibleKeys.includes(item.key);

        const content = (
          <View
            style={[
              styles.legendItem,
              isHorizontal && styles.legendItemHorizontal,
              !isVisible && styles.legendItemHidden,
            ]}
          >
            <View
              style={[
                styles.legendDot,
                { backgroundColor: isVisible ? item.color : colors.mutedText },
                !isVisible && styles.legendDotHidden,
              ]}
            />
            <Text
              style={[
                styles.legendLabel,
                { color: isVisible ? colors.textPrimary : colors.mutedText },
                !isVisible && styles.legendLabelHidden,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            {showValues && item.formattedValue && (
              <Text
                style={[
                  styles.legendValue,
                  { color: isVisible ? colors.mutedText : colors.cardBorder },
                ]}
              >
                {item.formattedValue}
              </Text>
            )}
          </View>
        );

        if (interactive) {
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onToggle(item.key)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isVisible }}
              accessibilityLabel={`${item.label}${
                showValues && item.formattedValue
                  ? `: ${item.formattedValue}`
                  : ""
              }`}
              accessibilityHint={
                isVisible
                  ? "Toque para ocultar esta série"
                  : "Toque para mostrar esta série"
              }
            >
              {content}
            </TouchableOpacity>
          );
        }

        return <View key={item.key}>{content}</View>;
      })}
    </ScrollView>
  );
}

/**
 * Hook para gerenciar estado de visibilidade das séries
 */
export function useSeriesVisibility(items: LegendItem[]) {
  const [visibleKeys, setVisibleKeys] = React.useState<string[]>(
    items.map((i) => i.key)
  );

  // Reset quando items mudam
  React.useEffect(() => {
    setVisibleKeys(items.map((i) => i.key));
  }, [items.length]);

  const toggle = React.useCallback((key: string) => {
    setVisibleKeys((current) => {
      // Se for o único visível, não pode esconder
      if (current.length === 1 && current.includes(key)) {
        return current;
      }
      if (current.includes(key)) {
        return current.filter((k) => k !== key);
      }
      return [...current, key];
    });
  }, []);

  const showAll = React.useCallback(() => {
    setVisibleKeys(items.map((i) => i.key));
  }, [items]);

  const hideAll = React.useCallback(() => {
    // Mantém pelo menos um visível
    if (items.length > 0) {
      setVisibleKeys([items[0].key]);
    }
  }, [items]);

  const isVisible = React.useCallback(
    (key: string) => visibleKeys.includes(key),
    [visibleKeys]
  );

  return {
    visibleKeys,
    toggle,
    showAll,
    hideAll,
    isVisible,
  };
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  containerHorizontal: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 4,
  },
  containerVertical: {
    flexDirection: "column",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  legendItemHorizontal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 16,
  },
  legendItemHidden: {
    opacity: 0.5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotHidden: {
    opacity: 0.4,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  legendLabelHidden: {
    textDecorationLine: "line-through",
  },
  legendValue: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
});
