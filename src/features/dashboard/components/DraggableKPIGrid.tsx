/**
 * DraggableKPIGrid - Grid de KPIs responsivo
 *
 * M2-K-005: Layout responsivo para tablets
 * - 2 colunas em celular
 * - 3 colunas em tablet retrato
 * - 4 colunas em tablet paisagem
 *
 * A ordem é persistida no AsyncStorage via Zustand.
 *
 * NOTA: Drag & drop removido temporariamente devido a incompatibilidade
 * com Expo Go (Worklets version mismatch). Pode ser adicionado futuramente
 * com um development build.
 */

import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useKPIOrderStore, useOrderedKPIs } from "../stores/useKPIOrderStore";
import { KPICard as KPICardType } from "@/models/dashboard.models";
import { useTheme } from "@/shared/theme/ThemeProvider";
import { useResponsiveColumns } from "@/shared/hooks";

interface DraggableKPIGridProps {
  /** Lista de KPIs para exibir */
  kpis: KPICardType[];
  /** Função para renderizar cada card */
  renderCard: (
    kpi: KPICardType,
    index: number,
    drag: () => void,
    isActive: boolean
  ) => React.ReactNode;
  /** Key para forçar re-render das animações */
  animationKey?: number;
}

export function DraggableKPIGrid({
  kpis,
  renderCard,
  animationKey = 0,
}: DraggableKPIGridProps) {
  const { colors } = useTheme();
  const orderedKPIs = useOrderedKPIs(kpis);
  const { columns, gap, isTablet, deviceType, screenWidth } =
    useResponsiveColumns();

  // Calcular largura de cada card baseado no número de colunas
  const paddingHorizontal = isTablet ? 24 : 16;
  const containerWidth = screenWidth - paddingHorizontal * 2;
  const totalGaps = (columns - 1) * gap;
  const cardWidth = (containerWidth - totalGaps) / columns;

  // Dummy drag function (drag & drop desabilitado temporariamente)
  const dummyDrag = useCallback(() => {}, []);

  return (
    <View style={[styles.container, { paddingHorizontal }]}>
      {/* Grid de cards responsivo */}
      <View style={styles.grid}>
        {orderedKPIs.map((kpi, index) => {
          // Calcular margin para criar gap entre cards
          const isLastInRow = (index + 1) % columns === 0;
          const marginRight = isLastInRow ? 0 : gap;

          return (
            <View
              key={`${kpi.id}-${animationKey}`}
              style={[
                styles.cardWrapper,
                {
                  width: cardWidth,
                  marginRight,
                  marginBottom: gap,
                },
              ]}
            >
              {renderCard(kpi, index, dummyDrag, false)}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal definido dinamicamente
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    // Width e margins definidos dinamicamente
  },
});

export default DraggableKPIGrid;
