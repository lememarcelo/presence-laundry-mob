/**
 * Filters Store - Gerenciamento de filtros do Dashboard
 * Controla lojas selecionadas, período e outras opções de filtro
 */

import { create } from 'zustand';

export interface FiltersState {
    // Filtros de período
    dataInicio: Date;
    dataFim: Date;

    // Lojas selecionadas (códigos string, ex: "01", "02")
    lojasSelecionadas: string[];

    // Ações
    setDataInicio: (data: Date) => void;
    setDataFim: (data: Date) => void;
    setPeriodo: (inicio: Date, fim: Date) => void;
    setLojasSelecionadas: (lojas: string[]) => void;
    toggleLoja: (lojaCodigo: string) => void;
    resetFiltros: () => void;
}

// Valores padrão: mês atual
const getDefaultDateRange = () => {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    return {
        dataInicio: primeiroDiaMes,
        dataFim: ultimoDiaMes,
    };
};

export const useFiltersStore = create<FiltersState>((set) => {
    const { dataInicio, dataFim } = getDefaultDateRange();

    return {
        dataInicio,
        dataFim,
        lojasSelecionadas: [], // Vazio = todas as lojas (--todas--)

        /**
         * Define a data de início do período
         */
        setDataInicio: (data: Date) =>
            set({ dataInicio: data }),

        /**
         * Define a data de fim do período
         */
        setDataFim: (data: Date) =>
            set({ dataFim: data }),

        /**
         * Define o período completo (início e fim)
         */
        setPeriodo: (inicio: Date, fim: Date) =>
            set({ dataInicio: inicio, dataFim: fim }),

        /**
         * Define as lojas selecionadas (substitui completamente)
         */
        setLojasSelecionadas: (lojas: string[]) =>
            set({ lojasSelecionadas: lojas }),

        /**
         * Adiciona ou remove uma loja da seleção
         */
        toggleLoja: (lojaCodigo: string) =>
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
            }),

        /**
         * Reseta todos os filtros para os valores padrão
         */
        resetFiltros: () => {
            const defaultRange = getDefaultDateRange();
            set({
                dataInicio: defaultRange.dataInicio,
                dataFim: defaultRange.dataFim,
                lojasSelecionadas: [],
            });
        },
    };
});
