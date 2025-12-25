/**
 * useResponsiveColumns - Hook para calcular número de colunas baseado no tamanho da tela
 *
 * M2-K-005: Layout responsivo para tablets
 *
 * Breakpoints:
 * - < 480px: 2 colunas (celular pequeno)
 * - 480-768px: 2 colunas (celular grande / phablet)
 * - 768-1024px: 3 colunas (tablet retrato)
 * - > 1024px: 4 colunas (tablet paisagem / iPad Pro)
 */

import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

// Breakpoints para diferentes dispositivos (em dp)
const BREAKPOINTS = {
    PHONE_SMALL: 480, // Celular pequeno
    TABLET_PORTRAIT: 768, // Tablet em retrato
    TABLET_LANDSCAPE: 1024, // Tablet em paisagem / iPad Pro
} as const;

// Configurações de colunas por tipo de dispositivo
const COLUMN_CONFIG = {
    phone: 2,
    tabletPortrait: 3,
    tabletLandscape: 4,
} as const;

export type DeviceType = "phone" | "tabletPortrait" | "tabletLandscape";

interface ResponsiveColumnsResult {
    /** Número de colunas para o grid */
    columns: number;
    /** Tipo de dispositivo detectado */
    deviceType: DeviceType;
    /** Se é um tablet (portrait ou landscape) */
    isTablet: boolean;
    /** Largura da tela */
    screenWidth: number;
    /** Altura da tela */
    screenHeight: number;
    /** Gap recomendado entre items */
    gap: number;
    /** Padding horizontal recomendado */
    paddingHorizontal: number;
}

interface UseResponsiveColumnsOptions {
    /** Número mínimo de colunas (default: 2) */
    minColumns?: number;
    /** Número máximo de colunas (default: 4) */
    maxColumns?: number;
    /** Gap em celular (default: 12) */
    phoneGap?: number;
    /** Gap em tablet (default: 16) */
    tabletGap?: number;
    /** Padding horizontal em celular (default: 16) */
    phonePadding?: number;
    /** Padding horizontal em tablet (default: 24) */
    tabletPadding?: number;
}

/**
 * Hook que calcula o número ideal de colunas baseado no tamanho da tela
 *
 * @example
 * ```tsx
 * const { columns, isTablet, gap } = useResponsiveColumns();
 *
 * return (
 *   <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
 *     {items.map(item => (
 *       <View style={{ width: `${100 / columns}%` }}>
 *         <Card />
 *       </View>
 *     ))}
 *   </View>
 * );
 * ```
 */
export function useResponsiveColumns(
    options: UseResponsiveColumnsOptions = {}
): ResponsiveColumnsResult {
    const {
        minColumns = 2,
        maxColumns = 4,
        phoneGap = 12,
        tabletGap = 16,
        phonePadding = 16,
        tabletPadding = 24,
    } = options;

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    return useMemo(() => {
        // Determinar tipo de dispositivo baseado na largura
        let deviceType: DeviceType;
        let columns: number;

        if (screenWidth < BREAKPOINTS.TABLET_PORTRAIT) {
            // Celular (qualquer tamanho até 768px)
            deviceType = "phone";
            columns = COLUMN_CONFIG.phone;
        } else if (screenWidth < BREAKPOINTS.TABLET_LANDSCAPE) {
            // Tablet em retrato
            deviceType = "tabletPortrait";
            columns = COLUMN_CONFIG.tabletPortrait;
        } else {
            // Tablet em paisagem / iPad Pro
            deviceType = "tabletLandscape";
            columns = COLUMN_CONFIG.tabletLandscape;
        }

        // Aplicar limites min/max
        columns = Math.max(minColumns, Math.min(maxColumns, columns));

        const isTablet = deviceType !== "phone";
        const gap = isTablet ? tabletGap : phoneGap;
        const paddingHorizontal = isTablet ? tabletPadding : phonePadding;

        return {
            columns,
            deviceType,
            isTablet,
            screenWidth,
            screenHeight,
            gap,
            paddingHorizontal,
        };
    }, [
        screenWidth,
        screenHeight,
        minColumns,
        maxColumns,
        phoneGap,
        tabletGap,
        phonePadding,
        tabletPadding,
    ]);
}

export default useResponsiveColumns;
