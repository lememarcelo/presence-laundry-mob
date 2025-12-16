/**
 * Presence Laundry Mobile - Sistema de Tema
 * Baseado no Tigra Mob theme system
 */

export type ThemeMode = 'light' | 'dark';

export type ThemePalette = {
    background: string;
    surface: string;
    card: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    mutedText: string;
    accent: string;
    accentText: string;
    disabled: string;
    success: string;
    warning: string;
    danger: string;
};

export type ThemeSpacing = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
};

export type ThemeTypography = {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
    bodySmall: number;
    caption: number;
};

export type ThemeTokens = {
    mode: ThemeMode;
    palette: ThemePalette;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
    borderRadius: {
        sm: number;
        md: number;
        lg: number;
        xl: number;
        full: number;
    };
    shadow: {
        sm: {
            shadowColor: string;
            shadowOffset: { width: number; height: number };
            shadowOpacity: number;
            shadowRadius: number;
            elevation: number;
        };
        md: {
            shadowColor: string;
            shadowOffset: { width: number; height: number };
            shadowOpacity: number;
            shadowRadius: number;
            elevation: number;
        };
        lg: {
            shadowColor: string;
            shadowOffset: { width: number; height: number };
            shadowOpacity: number;
            shadowRadius: number;
            elevation: number;
        };
    };
};

// Paleta de cores - modo claro
const lightPalette: ThemePalette = {
    background: '#F1F5F9',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    mutedText: '#64748B',
    accent: '#2563EB',
    accentText: '#F8FAFC',
    disabled: '#CBD5E1',
    success: '#16a34a',
    warning: '#f97316',
    danger: '#dc2626',
};

// Paleta de cores - modo escuro
const darkPalette: ThemePalette = {
    background: '#020617',
    surface: '#0B1220',
    card: '#0F172A',
    cardBorder: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    mutedText: '#94A3B8',
    accent: '#60A5FA',
    accentText: '#0F172A',
    disabled: '#334155',
    success: '#22c55e',
    warning: '#fb923c',
    danger: '#f87171',
};

// Espaçamentos padrão
const spacing: ThemeSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Tamanhos de fonte
const typography: ThemeTypography = {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
};

// Border radius
const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Sombras para modo claro
const lightShadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
};

// Sombras para modo escuro
const darkShadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 6,
    },
};

// Tokens completos por modo
const tokens: Record<ThemeMode, ThemeTokens> = {
    light: {
        mode: 'light',
        palette: lightPalette,
        spacing,
        typography,
        borderRadius,
        shadow: lightShadow,
    },
    dark: {
        mode: 'dark',
        palette: darkPalette,
        spacing,
        typography,
        borderRadius,
        shadow: darkShadow,
    },
};

/**
 * Retorna os tokens de tema para o modo especificado
 */
export function getThemeTokens(mode: ThemeMode): ThemeTokens {
    return tokens[mode];
}
