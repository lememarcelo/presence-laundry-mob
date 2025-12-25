/**
 * GridContainer - Sistema de grid responsivo com suporte a span
 * Permite cards de 1 ou 2 colunas de largura
 */

import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";

// ============================================
// Types
// ============================================

export type GridSpan = 1 | 2;

export interface GridItemConfig {
  id: string;
  span?: GridSpan;
  component: React.ReactNode;
}

interface GridContainerProps {
  items: GridItemConfig[];
  columns?: number;
  gap?: number;
  paddingHorizontal?: number;
}

interface GridItemProps {
  children: React.ReactNode;
  span?: GridSpan;
  columns?: number;
  gap?: number;
  containerWidth: number;
}

// ============================================
// Helpers
// ============================================

/**
 * Calcula a largura de um item baseado no span e largura do container
 */
function calculateItemWidth(
  span: GridSpan,
  columns: number,
  gap: number,
  containerWidth: number
): number {
  const totalGaps = (columns - 1) * gap;
  const availableWidth = containerWidth - totalGaps;
  const columnWidth = availableWidth / columns;

  if (span === 2 || span >= columns) {
    return containerWidth; // Full width
  }

  return columnWidth;
}

// ============================================
// GridItem Component
// ============================================

export function GridItem({
  children,
  span = 1,
  columns = 2,
  gap = 12,
  containerWidth,
}: GridItemProps) {
  const width = useMemo(
    () => calculateItemWidth(span, columns, gap, containerWidth),
    [span, columns, gap, containerWidth]
  );

  return (
    <View style={[styles.gridItem, { width, marginBottom: gap }]}>
      {children}
    </View>
  );
}

// ============================================
// GridContainer Component
// ============================================

export function GridContainer({
  items,
  columns = 2,
  gap = 12,
  paddingHorizontal = 0,
}: GridContainerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - paddingHorizontal * 2;

  return (
    <View style={[styles.container, { gap }]}>
      {items.map((item) => (
        <GridItem
          key={item.id}
          span={item.span}
          columns={columns}
          gap={gap}
          containerWidth={containerWidth}
        >
          {item.component}
        </GridItem>
      ))}
    </View>
  );
}

// ============================================
// Hook para calcular larguras
// ============================================

interface UseGridLayoutOptions {
  columns?: number;
  gap?: number;
  paddingHorizontal?: number;
}

interface GridLayoutResult {
  containerWidth: number;
  getItemWidth: (span?: GridSpan) => number;
  singleColumnWidth: number;
  fullWidth: number;
}

/**
 * Hook para usar o sistema de grid em componentes customizados
 * Retorna funções para calcular larguras baseadas no span
 */
export function useGridLayout(
  options: UseGridLayoutOptions = {}
): GridLayoutResult {
  const { columns = 2, gap = 12, paddingHorizontal = 16 } = options;
  const { width: screenWidth } = useWindowDimensions();

  return useMemo(() => {
    const containerWidth = screenWidth - paddingHorizontal * 2;
    const totalGaps = (columns - 1) * gap;
    const availableWidth = containerWidth - totalGaps;
    const singleColumnWidth = availableWidth / columns;

    const getItemWidth = (span: GridSpan = 1): number => {
      if (span === 2 || span >= columns) {
        return containerWidth;
      }
      return singleColumnWidth;
    };

    return {
      containerWidth,
      getItemWidth,
      singleColumnWidth,
      fullWidth: containerWidth,
    };
  }, [screenWidth, columns, gap, paddingHorizontal]);
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    // Width is set dynamically
  },
});

export default GridContainer;
