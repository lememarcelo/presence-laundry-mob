/**
 * Store de Filtros do Dashboard
 * Gerencia seleção de lojas e período para todas as telas do dashboard
 */

import { create } from 'zustand';
import type { Loja } from '@models/dashboard.models';

/**
 * Retorna o primeiro dia do mês atual
 */
function getFirstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Retorna a data atual
 */
function getToday(): Date {
  return new Date();
}

interface FiltersState {
  // Estado dos filtros
  lojasSelecionadas: string[];
  dataInicio: Date;
  dataFim: Date;

  // Lista de lojas disponíveis (carregada do backend)
  lojas: Loja[];
  isLoadingLojas: boolean;

  // Ações
  setLojasSelecionadas: (lojas: string[]) => void;
  setDataInicio: (date: Date) => void;
  setDataFim: (date: Date) => void;
  setPeriodo: (dataInicio: Date, dataFim: Date) => void;
  setLojas: (lojas: Loja[]) => void;
  setLoadingLojas: (loading: boolean) => void;
  selecionarTodasLojas: () => void;
  limparSelecaoLojas: () => void;
  resetFiltros: () => void;
}

/**
 * Store Zustand para filtros do dashboard
 * Compartilha estado de filtros entre todas as telas
 */
export const useFiltersStore = create<FiltersState>((set, get) => ({
  // Estado inicial - mês atual por padrão
  lojasSelecionadas: [],
  dataInicio: getFirstDayOfMonth(),
  dataFim: getToday(),
  lojas: [],
  isLoadingLojas: false,

  /**
   * Define as lojas selecionadas pelo código
   */
  setLojasSelecionadas: (lojas: string[]) => {
    set({ lojasSelecionadas: lojas });
  },

  /**
   * Define a data de início do período
   */
  setDataInicio: (date: Date) => {
    set({ dataInicio: date });
  },

  /**
   * Define a data de fim do período
   */
  setDataFim: (date: Date) => {
    set({ dataFim: date });
  },

  /**
   * Define o período completo (início e fim)
   */
  setPeriodo: (dataInicio: Date, dataFim: Date) => {
    set({ dataInicio, dataFim });
  },

  /**
   * Define a lista de lojas disponíveis (carregada do backend)
   */
  setLojas: (lojas: Loja[]) => {
    set({ lojas });
    // Se não houver lojas selecionadas, seleciona todas
    const { lojasSelecionadas } = get();
    if (lojasSelecionadas.length === 0 && lojas.length > 0) {
      set({ lojasSelecionadas: lojas.map((l) => l.codigo) });
    }
  },

  setLoadingLojas: (loading: boolean) => {
    set({ isLoadingLojas: loading });
  },

  /**
   * Seleciona todas as lojas disponíveis
   */
  selecionarTodasLojas: () => {
    const { lojas } = get();
    set({ lojasSelecionadas: lojas.map((l) => l.codigo) });
  },

  /**
   * Remove seleção de todas as lojas
   */
  limparSelecaoLojas: () => {
    set({ lojasSelecionadas: [] });
  },

  /**
   * Reseta filtros para valores padrão (mês atual, todas as lojas)
   */
  resetFiltros: () => {
    const { lojas } = get();
    set({
      dataInicio: getFirstDayOfMonth(),
      dataFim: getToday(),
      lojasSelecionadas: lojas.map((l) => l.codigo),
    });
  },
}));

// Seletor para obter filtros fora de componentes React
export const getFilters = () => {
  const { lojasSelecionadas, dataInicio, dataFim } = useFiltersStore.getState();
  return { lojasSelecionadas, dataInicio, dataFim };
};
