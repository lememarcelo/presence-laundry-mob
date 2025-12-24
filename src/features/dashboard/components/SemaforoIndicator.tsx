/**
 * SemaforoIndicator - Indicador visual de semáforo para KPIs
 *
 * Exibe um indicador colorido baseado na performance do KPI:
 * - Verde: desempenho acima ou igual à meta/período anterior
 * - Amarelo: pequena variação negativa (alerta)
 * - Vermelho: variação negativa significativa (crítico)
 */

import React from "react";
import { View, StyleSheet } from "react-native";

export type SemaforoStatus = "verde" | "amarelo" | "vermelho";

interface SemaforoIndicatorProps {
  /** Status do semáforo */
  status: SemaforoStatus;
  /** Tamanho do indicador (default: 8) */
  size?: number;
  /** Se deve mostrar o glow/sombra (default: true) */
  showGlow?: boolean;
}

/**
 * Calcula o status do semáforo baseado na variação percentual
 * @param percentChange Variação percentual em relação ao período anterior
 * @param threshold Limite para considerar alerta (default: -5)
 */
export function getSemaforoStatus(
  percentChange: number,
  threshold = -5
): SemaforoStatus {
  if (percentChange >= 0) {
    return "verde";
  } else if (percentChange >= threshold) {
    return "amarelo";
  } else {
    return "vermelho";
  }
}

/**
 * Retorna a cor do semáforo baseado no status
 */
export function getSemaforoColor(status: SemaforoStatus): string {
  switch (status) {
    case "verde":
      return "#10B981"; // Tailwind green-500
    case "amarelo":
      return "#F59E0B"; // Tailwind amber-500
    case "vermelho":
      return "#EF4444"; // Tailwind red-500
    default:
      return "#9CA3AF"; // gray-400
  }
}

/**
 * Componente visual do semáforo
 */
export function SemaforoIndicator({
  status,
  size = 8,
  showGlow = true,
}: SemaforoIndicatorProps) {
  const color = getSemaforoColor(status);

  return (
    <View
      style={[
        styles.indicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        showGlow && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: size / 2,
          elevation: 3,
        },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Indicador de status: ${status}`}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    // Base styles são aplicados inline
  },
});
