/**
 * SparklineChart - Mini gráfico inline para KPI cards
 * M2-K-006: Mini-gráficos sparkline nos KPI cards
 */

import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@/shared/theme/ThemeProvider";

interface SparklineChartProps {
  /** Dados do gráfico (valores numéricos) */
  data: number[];
  /** Largura do gráfico */
  width?: number;
  /** Altura do gráfico */
  height?: number;
  /** Cor da linha */
  color?: string;
  /** Mostrar ponto no último valor */
  showLastPoint?: boolean;
  /** Mostrar área preenchida */
  filled?: boolean;
}

export function SparklineChart({
  data,
  width = 60,
  height = 24,
  color,
  showLastPoint = true,
  filled = true,
}: SparklineChartProps) {
  const { colors } = useTheme();
  const lineColor = color || colors.accent;

  // Gerar path SVG a partir dos dados
  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (!data || data.length < 2) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }

    const padding = 4;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue || 1;

    // Normalizar pontos para coordenadas SVG
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + (1 - (value - minValue) / range) * chartHeight;
      return { x, y };
    });

    // Criar path da linha
    const linePathPoints = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    // Criar path da área (fechando por baixo)
    const areaPathPoints = `${linePathPoints} L ${
      points[points.length - 1].x
    } ${height - padding} L ${padding} ${height - padding} Z`;

    return {
      linePath: linePathPoints,
      areaPath: areaPathPoints,
      lastPoint: points[points.length - 1],
    };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return <View style={[styles.container, { width, height }]} />;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Área preenchida */}
        {filled && <Path d={areaPath} fill={lineColor} fillOpacity={0.15} />}

        {/* Linha do gráfico */}
        <Path
          d={linePath}
          stroke={lineColor}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ponto no último valor */}
        {showLastPoint && lastPoint && (
          <Circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={lineColor} />
        )}
      </Svg>
    </View>
  );
}

/**
 * Gera dados mock para sparkline (últimos 7 dias)
 */
export function generateMockSparklineData(
  baseValue: number,
  variance: number = 0.1,
  points: number = 7
): number[] {
  const data: number[] = [];
  let current = baseValue * (1 - variance);

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.4) * baseValue * variance;
    current = Math.max(0, current + change);
    data.push(Math.round(current));
  }

  // Garantir que o último valor é próximo do baseValue
  data[data.length - 1] = baseValue;

  return data;
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
