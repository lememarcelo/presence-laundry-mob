/**
 * BrasilMapSVG - Mapa do Brasil em SVG com estados coloridos
 * M4-H-003: Mapa visual SVG do Brasil por UF
 */

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { useTheme } from "@/shared/theme/ThemeProvider";

// Paths SVG simplificados dos estados brasileiros
// Baseado em proporções de 600x600
const ESTADOS_PATHS: Record<string, string> = {
  AC: "M30,280 L50,275 L55,290 L45,300 L30,295 Z",
  AL: "M500,230 L515,225 L520,235 L510,245 L495,240 Z",
  AM: "M80,200 L180,180 L200,230 L160,280 L80,260 Z",
  AP: "M280,120 L310,110 L320,140 L295,160 L275,145 Z",
  BA: "M420,240 L500,220 L520,290 L480,350 L400,320 Z",
  CE: "M480,170 L520,160 L530,190 L500,210 L475,195 Z",
  DF: "M360,300 L375,295 L380,305 L370,315 L355,310 Z",
  ES: "M490,340 L515,330 L525,355 L510,370 L485,360 Z",
  GO: "M340,280 L400,270 L420,330 L380,360 L330,330 Z",
  MA: "M380,160 L440,145 L460,190 L420,220 L370,200 Z",
  MG: "M380,300 L470,280 L500,350 L450,400 L370,380 Z",
  MS: "M280,340 L340,330 L360,400 L310,440 L260,410 Z",
  MT: "M200,250 L320,230 L350,320 L280,360 L180,330 Z",
  PA: "M200,140 L320,120 L360,200 L280,250 L180,220 Z",
  PB: "M500,200 L540,192 L545,208 L520,218 L495,212 Z",
  PE: "M470,210 L540,195 L550,220 L500,240 L465,228 Z",
  PI: "M420,180 L470,168 L485,220 L450,250 L410,230 Z",
  PR: "M330,400 L400,385 L420,420 L370,450 L310,435 Z",
  RJ: "M460,380 L510,370 L525,395 L490,415 L450,400 Z",
  RN: "M510,178 L545,170 L550,188 L530,198 L505,192 Z",
  RO: "M120,280 L180,265 L200,310 L160,340 L110,320 Z",
  RR: "M140,120 L190,105 L210,150 L175,180 L130,160 Z",
  RS: "M320,450 L390,440 L410,500 L350,540 L300,510 Z",
  SC: "M370,440 L420,430 L435,460 L400,480 L355,468 Z",
  SE: "M505,248 L525,242 L530,258 L518,268 L500,262 Z",
  SP: "M380,380 L450,365 L470,410 L420,440 L360,420 Z",
  TO: "M360,220 L410,205 L430,270 L390,310 L345,280 Z",
};

// Mapeamento UF -> Nome completo
const UF_NOMES: Record<string, string> = {
  AC: "Acre",
  AL: "Alagoas",
  AM: "Amazonas",
  AP: "Amapá",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MG: "Minas Gerais",
  MS: "Mato Grosso do Sul",
  MT: "Mato Grosso",
  PA: "Pará",
  PB: "Paraíba",
  PE: "Pernambuco",
  PI: "Piauí",
  PR: "Paraná",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RO: "Rondônia",
  RR: "Roraima",
  RS: "Rio Grande do Sul",
  SC: "Santa Catarina",
  SE: "Sergipe",
  SP: "São Paulo",
  TO: "Tocantins",
};

export interface UFData {
  uf: string;
  valor: number;
  percentual?: number;
}

interface BrasilMapSVGProps {
  /** Dados por UF */
  data: UFData[];
  /** Largura do mapa */
  width?: number;
  /** Altura do mapa */
  height?: number;
  /** Cor mínima (valor baixo) */
  minColor?: string;
  /** Cor máxima (valor alto) */
  maxColor?: string;
  /** Callback ao tocar em um estado */
  onPressUF?: (uf: string, data: UFData | undefined) => void;
  /** UF selecionada */
  selectedUF?: string;
}

/**
 * Interpola entre duas cores hex
 */
function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function BrasilMapSVG({
  data,
  width = 300,
  height = 300,
  minColor = "#E5E7EB",
  maxColor = "#2563EB",
  onPressUF,
  selectedUF,
}: BrasilMapSVGProps) {
  const { colors } = useTheme();

  // Mapear dados por UF
  const dataMap = React.useMemo(() => {
    const map: Record<string, UFData> = {};
    data.forEach((d) => {
      map[d.uf] = d;
    });
    return map;
  }, [data]);

  // Calcular valores min/max para escala de cores
  const { minVal, maxVal } = React.useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 1 };
    const values = data.map((d) => d.valor);
    return {
      minVal: Math.min(...values),
      maxVal: Math.max(...values),
    };
  }, [data]);

  // Obter cor para um estado baseado no valor
  const getColorForUF = (uf: string): string => {
    const ufData = dataMap[uf];
    if (!ufData) return colors.cardBorder;

    const range = maxVal - minVal || 1;
    const factor = (ufData.valor - minVal) / range;
    return interpolateColor(minColor, maxColor, factor);
  };

  // Escala do viewBox para o tamanho desejado
  const viewBox = "0 0 600 600";

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox={viewBox}>
        <G>
          {Object.entries(ESTADOS_PATHS).map(([uf, path]) => {
            const isSelected = selectedUF === uf;
            const fillColor = getColorForUF(uf);

            return (
              <Path
                key={uf}
                d={path}
                fill={fillColor}
                stroke={isSelected ? colors.accent : colors.surface}
                strokeWidth={isSelected ? 3 : 1}
                onPress={() => onPressUF?.(uf, dataMap[uf])}
              />
            );
          })}
        </G>
      </Svg>

      {/* Legenda de cores */}
      <View style={styles.legend}>
        <View style={[styles.legendGradient, { backgroundColor: minColor }]}>
          <View
            style={[styles.legendGradientEnd, { backgroundColor: maxColor }]}
          />
        </View>
        <View style={styles.legendLabels}>
          <Text style={[styles.legendText, { color: colors.mutedText }]}>
            Menor
          </Text>
          <Text style={[styles.legendText, { color: colors.mutedText }]}>
            Maior
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Helper para obter nome completo do estado
 */
export function getUFNome(uf: string): string {
  return UF_NOMES[uf] || uf;
}

/**
 * Lista de todas as UFs em ordem alfabética
 */
export const TODAS_UFS = Object.keys(UF_NOMES).sort();

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    marginTop: 12,
    alignItems: "center",
  },
  legendGradient: {
    width: 120,
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  legendGradientEnd: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
  },
  legendLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
  },
});
