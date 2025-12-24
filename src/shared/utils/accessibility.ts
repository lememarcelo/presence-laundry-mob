/**
 * Accessibility Utilities - Utilitários para acessibilidade mobile
 * 
 * Garante que o app segue as guidelines de acessibilidade:
 * - Touch targets mínimos de 44pt (iOS) / 48dp (Android)
 * - Labels semânticos para screen readers
 * - Contrastes adequados
 */

import { StyleSheet, ViewStyle, TextStyle } from "react-native";

/**
 * Tamanho mínimo para touch targets (44pt conforme Apple HIG)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Estilos base para garantir touch targets adequados
 */
export const accessibilityStyles = StyleSheet.create({
    /**
     * Container mínimo para elementos tocáveis
     * Usa minWidth/minHeight para garantir área de toque adequada
     */
    touchableMinSize: {
        minWidth: MIN_TOUCH_TARGET,
        minHeight: MIN_TOUCH_TARGET,
        justifyContent: "center",
        alignItems: "center",
    } as ViewStyle,

    /**
     * Padding para botões pequenos (ícones)
     * Adiciona padding para alcançar o tamanho mínimo
     */
    iconButtonPadding: {
        padding: 10, // (44 - 24) / 2 = 10 para ícones de 24pt
    } as ViewStyle,

    /**
     * Hit slop extra para elementos pequenos
     * Expande a área de toque sem alterar layout visual
     */
    hitSlopExpanded: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    },
});

/**
 * Gera props de acessibilidade para um botão
 */
export function getButtonA11yProps(label: string, hint?: string) {
    return {
        accessibilityRole: "button" as const,
        accessibilityLabel: label,
        accessibilityHint: hint,
    };
}

/**
 * Gera props de acessibilidade para um card/tile informativo
 */
export function getCardA11yProps(title: string, value: string, trend?: string) {
    const label = trend
        ? `${title}: ${value}, ${trend}`
        : `${title}: ${value}`;

    return {
        accessible: true,
        accessibilityRole: "summary" as const,
        accessibilityLabel: label,
    };
}

/**
 * Gera props de acessibilidade para uma imagem/ícone
 */
export function getImageA11yProps(description: string) {
    return {
        accessible: true,
        accessibilityRole: "image" as const,
        accessibilityLabel: description,
    };
}

/**
 * Gera props de acessibilidade para um tab
 */
export function getTabA11yProps(label: string, isSelected: boolean, index: number, total: number) {
    return {
        accessibilityRole: "tab" as const,
        accessibilityState: { selected: isSelected },
        accessibilityLabel: `${label}, aba ${index + 1} de ${total}`,
        accessibilityHint: isSelected ? undefined : `Toque duas vezes para selecionar ${label}`,
    };
}

/**
 * Gera props de acessibilidade para uma lista
 */
export function getListA11yProps(label: string, itemCount: number) {
    return {
        accessibilityRole: "list" as const,
        accessibilityLabel: `${label}, ${itemCount} itens`,
    };
}

/**
 * Gera props de acessibilidade para item de lista
 */
export function getListItemA11yProps(index: number, content: string) {
    return {
        accessibilityRole: "listitem" as const,
        accessibilityLabel: `Item ${index + 1}: ${content}`,
    };
}

/**
 * Verifica se uma cor tem contraste suficiente com o fundo
 * Retorna true se o contraste é >= 4.5:1 (WCAG AA)
 */
export function hasAdequateContrast(foreground: string, background: string): boolean {
    const getLuminance = (hex: string): number => {
        const rgb = hex.replace("#", "").match(/.{2}/g);
        if (!rgb) return 0;

        const [r, g, b] = rgb.map((c) => {
            const val = parseInt(c, 16) / 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return ratio >= 4.5;
}

/**
 * Cores com alto contraste garantido
 */
export const highContrastColors = {
    text: {
        onLight: "#1F2937", // gray-800
        onDark: "#F9FAFB",  // gray-50
        onAccent: "#FFFFFF",
    },
    status: {
        success: "#047857",   // green-700
        warning: "#B45309",   // amber-700
        error: "#B91C1C",     // red-700
        info: "#1D4ED8",      // blue-700
    },
};
