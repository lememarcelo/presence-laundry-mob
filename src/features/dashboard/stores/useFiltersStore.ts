/**
 * Filters Store - Gerenciamento de filtros do Dashboard
 * Controla lojas selecionadas, período e outras opções de filtro
 * Com persistência via SecureStore do Expo
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type PeriodPresetKey =
    | 'today'
    | 'yesterday'
    | 'last7days'
    | 'last30days'
    | 'thisMonth'
    | 'lastMonth'
    | 'thisYear'
    | 'custom';

export interface FiltersState {
    // Filtros de período
    dataInicio: Date;
    dataFim: Date;
    activePreset: PeriodPresetKey;

    // Lojas selecionadas (códigos string, ex: "01", "02")
    // Vazio significa "todas as lojas"
    lojasSelecionadas: string[];

    // Flag para saber se os filtros foram inicializados
    isInitialized: boolean;

    // Ações
    setDataInicio: (data: Date) => void;
    setDataFim: (data: Date) => void;
    setPeriodo: (inicio: Date, fim: Date, preset?: PeriodPresetKey) => void;
    setActivePreset: (preset: PeriodPresetKey) => void;
    setLojasSelecionadas: (lojas: string[]) => void;
    toggleLoja: (lojaCodigo: string) => void;
    resetFiltros: () => void;
    applyPreset: (preset: PeriodPresetKey) => void;
}

// Gera range de datas para um preset
function getDateRangeForPreset(preset: PeriodPresetKey): { inicio: Date; fim: Date } {
    const hoje = new Date();
    
    switch (preset) {
        case 'today': {
            const inicio = new Date(hoje);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(hoje);
            fim.setHours(23, 59, 59, 999);
            return { inicio, fim };
        }
        case 'yesterday': {
            const ontem = new Date(hoje);
            ontem.setDate(ontem.getDate() - 1);
            ontem.setHours(0, 0, 0, 0);
            const fimOntem = new Date(ontem);
            fimOntem.setHours(23, 59, 59, 999);
            return { inicio: ontem, fim: fimOntem };
        }
        case 'last7days': {
            const fim = new Date(hoje);
            fim.setHours(23, 59, 59, 999);
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - 6);
            inicio.setHours(0, 0, 0, 0);
            return { inicio, fim };
        }
        case 'last30days': {
            const fim = new Date(hoje);
            fim.setHours(23, 59, 59, 999);
            const inicio = new Date(hoje);
            inicio.setDate(inicio.getDate() - 29);
            inicio.setHours(0, 0, 0, 0);
            return { inicio, fim };
        }
        case 'thisMonth': {
            const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            fim.setHours(23, 59, 59, 999);
            return { inicio, fim };
        }
        case 'lastMonth': {
            const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
            fim.setHours(23, 59, 59, 999);
            return { inicio, fim };
        }
        case 'thisYear': {
            const inicio = new Date(hoje.getFullYear(), 0, 1);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(hoje);
            fim.setHours(23, 59, 59, 999);
            return { inicio, fim };
        }
        case 'custom':
        default: {
            // Para custom, retorna o mês atual como fallback
            const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            fim.setHours(23, 59, 59, 999);
            return { inicio, fim };
        }
    }
}

// Valores padrão: mês atual
const getDefaultState = () => {
    const range = getDateRangeForPreset('thisMonth');
    return {
        dataInicio: range.inicio,
        dataFim: range.fim,
        activePreset: 'thisMonth' as PeriodPresetKey,
        lojasSelecionadas: [] as string[],
        isInitialized: true,
    };
};

// Storage key for persistence
const STORAGE_KEY = 'dashboard-filters';

// Save filters to SecureStore
const saveFilters = async (state: {
    dataInicio: Date;
    dataFim: Date;
    activePreset: PeriodPresetKey;
    lojasSelecionadas: string[];
}) => {
    try {
        const data = {
            dataInicio: state.dataInicio.toISOString(),
            dataFim: state.dataFim.toISOString(),
            activePreset: state.activePreset,
            lojasSelecionadas: state.lojasSelecionadas,
        };
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save filters:', error);
    }
};

// Load filters from SecureStore
const loadFilters = async (): Promise<Partial<FiltersState> | null> => {
    try {
        const data = await SecureStore.getItemAsync(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            return {
                dataInicio: new Date(parsed.dataInicio),
                dataFim: new Date(parsed.dataFim),
                activePreset: parsed.activePreset,
                lojasSelecionadas: parsed.lojasSelecionadas,
            };
        }
    } catch (error) {
        console.warn('Failed to load filters:', error);
    }
    return null;
};

export const useFiltersStore = create<FiltersState>()(
    (set, get) => {
        const defaultState = getDefaultState();

        // Load persisted state on init
        loadFilters().then((persisted) => {
            if (persisted) {
                set({ ...persisted, isInitialized: true });
            }
        });

        return {
            ...defaultState,

            /**
             * Define a data de início do período
             */
            setDataInicio: (data: Date) => {
                set({ dataInicio: data, activePreset: 'custom' });
                const state = get();
                saveFilters(state);
            },

            /**
             * Define a data de fim do período
             */
            setDataFim: (data: Date) => {
                set({ dataFim: data, activePreset: 'custom' });
                const state = get();
                saveFilters(state);
            },

            /**
             * Define o período completo (início e fim)
             */
            setPeriodo: (inicio: Date, fim: Date, preset?: PeriodPresetKey) => {
                set({
                    dataInicio: inicio,
                    dataFim: fim,
                    activePreset: preset || 'custom',
                });
                const state = get();
                saveFilters(state);
            },

            /**
             * Define o preset ativo
             */
            setActivePreset: (preset: PeriodPresetKey) => {
                set({ activePreset: preset });
                const state = get();
                saveFilters(state);
            },

            /**
             * Define as lojas selecionadas (substitui completamente)
             */
            setLojasSelecionadas: (lojas: string[]) => {
                set({ lojasSelecionadas: lojas });
                const state = get();
                saveFilters(state);
            },

            /**
             * Adiciona ou remove uma loja da seleção
             */
            toggleLoja: (lojaCodigo: string) => {
                set((state) => {
                    const lojas = state.lojasSelecionadas;
                    if (lojas.includes(lojaCodigo)) {
                        return {
                            lojasSelecionadas: lojas.filter((codigo) => codigo !== lojaCodigo),
                        };
                    } else {
                        return {
                            lojasSelecionadas: [...lojas, lojaCodigo],
                        };
                    }
                });
                const state = get();
                saveFilters(state);
            },

            /**
             * Aplica um preset de período
             */
            applyPreset: (preset: PeriodPresetKey) => {
                const range = getDateRangeForPreset(preset);
                set({
                    dataInicio: range.inicio,
                    dataFim: range.fim,
                    activePreset: preset,
                });
                const state = get();
                saveFilters(state);
            },

            /**
             * Reseta todos os filtros para os valores padrão
             */
            resetFiltros: () => {
                const defaultState = getDefaultState();
                set(defaultState);
                saveFilters(defaultState);
            },
        };
    }
);

// Exporta função utilitária para usar em outros lugares
export { getDateRangeForPreset };
