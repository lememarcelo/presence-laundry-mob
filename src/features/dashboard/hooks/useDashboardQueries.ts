/**
 * Dashboard Queries - Hooks TanStack Query para dados do dashboard
 * Consome endpoints do TSMDashLaundry (Presence Remote)
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFiltersStore } from "../stores/useFiltersStore";
import { useSessionStore } from "@features/auth/stores/session.store";
import {
    getLojas,
    getMetricasConsolidadas,
    getFaturamentoDiario,
    getFaturamentoMensal,
    getCrescimento12Meses,
    getDistribuicaoServicos,
    getEvolucaoPagamentos,
    getPendenciaProducao,
    getMapaTemporal,
    getMapaGeografico,
    getRankingLojas,
    getRankingRede,
    getDiasUteis,
    getPassivosFinanceiros,
    getPrazosEntrega,
    getConfigSemaforos,
} from "../api/dashboard.service";

// ============================================
// Query Keys
// ============================================

export const dashboardKeys = {
    all: ["dashboard"] as const,
    lojas: () => [...dashboardKeys.all, "lojas"] as const,
    metricas: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "metricas",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    faturamentoDiario: (lojas: string[], mes: number, ano: number) =>
        [...dashboardKeys.all, "faturamento-diario", lojas, mes, ano] as const,
    faturamentoMensal: (lojas: string[], ano: number) =>
        [...dashboardKeys.all, "faturamento-mensal", lojas, ano] as const,
    crescimento12Meses: (
        lojas: string[],
        metrica: "faturamento" | "pecas" | "tickets"
    ) => [...dashboardKeys.all, "crescimento-12m", lojas, metrica] as const,
    distribuicaoServicos: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "distribuicao-servicos",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    evolucaoPagamentos: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "evolucao-pagamentos",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    pendenciaProducao: (lojas: string[]) =>
        [...dashboardKeys.all, "pendencia-producao", lojas] as const,
    mapaTemporal: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "mapa-temporal",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    mapaGeografico: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "mapa-geografico",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    rankingLojas: (dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "ranking-lojas",
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    rankingRede: (loja: string, dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "ranking-rede",
            loja,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    diasUteis: (loja: string, ano: number, mes: number) =>
        [...dashboardKeys.all, "dias-uteis", loja, ano, mes] as const,
    passivosFinanceiros: (lojas: string[]) =>
        [...dashboardKeys.all, "passivos-financeiros", lojas] as const,
    prazosEntrega: (lojas: string[], dataInicio: Date, dataFim: Date) =>
        [
            ...dashboardKeys.all,
            "prazos-entrega",
            lojas,
            dataInicio.toISOString(),
            dataFim.toISOString(),
        ] as const,
    configSemaforos: (loja: string) =>
        [...dashboardKeys.all, "config-semaforos", loja] as const,
};

// ============================================
// Hooks - Dados Básicos
// ============================================

/**
 * Lista de lojas disponíveis para seleção
 */
export function useLojas() {
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

    const query = useQuery({
        queryKey: dashboardKeys.lojas(),
        queryFn: getLojas,
        staleTime: 1000 * 60 * 30, // 30 minutos - lojas mudam raramente
        enabled: isAuthenticated, // Só executa se estiver autenticado
    });

    if (__DEV__) {
        console.log('[useLojas] Status:', {
            isLoading: query.isLoading,
            isError: query.isError,
            dataLength: query.data?.length,
            error: query.error,
            enabled: isAuthenticated,
        });
    }

    return query;
}

/**
 * KPIs consolidados do dashboard (faturamento, tickets, peças, clientes)
 */
export function useMetricasConsolidadas() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

    if (__DEV__) {
        console.log('[useMetricasConsolidadas] Filters:', {
            dataInicio: dataInicio?.toISOString(),
            dataFim: dataFim?.toISOString(),
            lojasSelecionadas,
            enabled: isAuthenticated // Removida condição de lojas - vazio = todas
        });
    }

    return useQuery({
        queryKey: dashboardKeys.metricas(lojasSelecionadas, dataInicio, dataFim),
        queryFn: () =>
            getMetricasConsolidadas(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 2,
        enabled: isAuthenticated, // Vazio = todas as lojas (tratado no service)
    });
}

// ============================================
// Hooks - Gráficos de Faturamento
// ============================================

/**
 * Faturamento dia a dia do mês (barras comparativas)
 */
export function useFaturamentoDiario(mes?: number, ano?: number) {
    const { lojasSelecionadas } = useFiltersStore();
    const now = new Date();
    const mesParam = mes ?? now.getMonth() + 1;
    const anoParam = ano ?? now.getFullYear();

    return useQuery({
        queryKey: dashboardKeys.faturamentoDiario(
            lojasSelecionadas,
            mesParam,
            anoParam
        ),
        queryFn: () => getFaturamentoDiario(lojasSelecionadas, mesParam, anoParam),
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}

/**
 * Faturamento mensal comparativo (ano atual vs anterior)
 */
export function useFaturamentoMensal(ano?: number) {
    const { lojasSelecionadas } = useFiltersStore();
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
    const anoParam = ano ?? new Date().getFullYear();

    return useQuery({
        queryKey: dashboardKeys.faturamentoMensal(lojasSelecionadas, anoParam),
        queryFn: () => getFaturamentoMensal(lojasSelecionadas, anoParam),
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: isAuthenticated, // Vazio = todas as lojas
    });
}

/**
 * Linha de crescimento dos últimos 12 meses
 */
export function useCrescimento12Meses(
    metrica: "faturamento" | "pecas" | "tickets" = "faturamento"
) {
    const { lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.crescimento12Meses(lojasSelecionadas, metrica),
        queryFn: () => getCrescimento12Meses(lojasSelecionadas, metrica),
        staleTime: 1000 * 60 * 10, // 10 minutos
        retry: 2,
    });
}

// ============================================
// Hooks - Distribuições e Pagamentos
// ============================================

/**
 * Distribuição de faturamento por grupo de serviço (gráfico pizza)
 */
export function useDistribuicaoServicos() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.distribuicaoServicos(
            lojasSelecionadas,
            dataInicio,
            dataFim
        ),
        queryFn: () =>
            getDistribuicaoServicos(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}

/**
 * Evolução de pagamentos por modalidade
 */
export function useEvolucaoPagamentos() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.evolucaoPagamentos(
            lojasSelecionadas,
            dataInicio,
            dataFim
        ),
        queryFn: () =>
            getEvolucaoPagamentos(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}

// ============================================
// Hooks - Produção e Operacional
// ============================================

/**
 * Pendências de produção (backlog) por faixa de atraso
 */
export function usePendenciaProducao() {
    const { lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.pendenciaProducao(lojasSelecionadas),
        queryFn: () => getPendenciaProducao(lojasSelecionadas),
        staleTime: 1000 * 60 * 2, // 2 minutos - atualiza mais frequentemente
        retry: 2,
    });
}

/**
 * Mapa de calor temporal (matriz dia x hora)
 */
export function useMapaTemporal() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: dashboardKeys.mapaTemporal(lojasSelecionadas, dataInicio, dataFim),
        queryFn: () => getMapaTemporal(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: isAuthenticated, // Vazio = todas as lojas
    });
}

/**
 * Estatísticas de prazos de entrega por faixa
 */
export function usePrazosEntrega() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.prazosEntrega(
            lojasSelecionadas,
            dataInicio,
            dataFim
        ),
        queryFn: () => getPrazosEntrega(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}

// ============================================
// Hooks - Geográfico e Ranking
// ============================================

/**
 * Dados geográficos por UF
 */
export function useMapaGeografico() {
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.mapaGeografico(
            lojasSelecionadas,
            dataInicio,
            dataFim
        ),
        queryFn: () => getMapaGeografico(lojasSelecionadas, dataInicio, dataFim),
        staleTime: 1000 * 60 * 10,
        retry: 2,
    });
}

/**
 * Ranking de todas as lojas por faturamento
 */
export function useRankingLojas() {
    const { dataInicio, dataFim } = useFiltersStore();
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: dashboardKeys.rankingLojas(dataInicio, dataFim),
        queryFn: () => getRankingLojas(dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: isAuthenticated,
    });
}

/**
 * Posição de uma loja específica na rede
 */
export function useRankingRede(loja: string) {
    const { dataInicio, dataFim } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.rankingRede(loja, dataInicio, dataFim),
        queryFn: () => getRankingRede(loja, dataInicio, dataFim),
        staleTime: 1000 * 60 * 5,
        retry: 2,
        enabled: !!loja, // Só executa se loja estiver definida
    });
}

// ============================================
// Hooks - Financeiro
// ============================================

/**
 * Passivos financeiros (ROLs, planos, créditos)
 */
export function usePassivosFinanceiros() {
    const { lojasSelecionadas } = useFiltersStore();

    return useQuery({
        queryKey: dashboardKeys.passivosFinanceiros(lojasSelecionadas),
        queryFn: () => getPassivosFinanceiros(lojasSelecionadas),
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
}

// ============================================
// Hooks - Utilitários
// ============================================

/**
 * Dias úteis do mês para projeção
 */
export function useDiasUteis(loja: string, ano?: number, mes?: number) {
    const now = new Date();
    const anoParam = ano ?? now.getFullYear();
    const mesParam = mes ?? now.getMonth() + 1;

    return useQuery({
        queryKey: dashboardKeys.diasUteis(loja, anoParam, mesParam),
        queryFn: () => getDiasUteis(loja, anoParam, mesParam),
        staleTime: 1000 * 60 * 60 * 24, // 24 horas - dias úteis não mudam durante o dia
        enabled: !!loja,
    });
}

/**
 * Configuração de semáforos/thresholds
 */
export function useConfigSemaforos(loja: string) {
    return useQuery({
        queryKey: dashboardKeys.configSemaforos(loja),
        queryFn: () => getConfigSemaforos(loja),
        staleTime: 1000 * 60 * 60, // 1 hora
        enabled: !!loja,
    });
}

/**
 * Hook para invalidar cache do dashboard
 */
export function useInvalidateDashboard() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () =>
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),

        invalidateMetricas: () => {
            const { dataInicio, dataFim, lojasSelecionadas } =
                useFiltersStore.getState();
            queryClient.invalidateQueries({
                queryKey: dashboardKeys.metricas(lojasSelecionadas, dataInicio, dataFim),
            });
        },

        invalidateRanking: () => {
            const { dataInicio, dataFim } = useFiltersStore.getState();
            queryClient.invalidateQueries({
                queryKey: dashboardKeys.rankingLojas(dataInicio, dataFim),
            });
        },

        invalidateMapaTemporal: () => {
            const { dataInicio, dataFim, lojasSelecionadas } =
                useFiltersStore.getState();
            queryClient.invalidateQueries({
                queryKey: dashboardKeys.mapaTemporal(
                    lojasSelecionadas,
                    dataInicio,
                    dataFim
                ),
            });
        },
    };
}

/**
 * M6-U-004: Hook para prefetch de dados críticos do dashboard
 * Carrega dados em background para melhorar tempo de carregamento inicial
 */
export function usePrefetchDashboard() {
    const queryClient = useQueryClient();
    const { dataInicio, dataFim, lojasSelecionadas } = useFiltersStore();

    const prefetchCriticalData = async () => {
        if (lojasSelecionadas.length === 0) return;

        const prefetchPromises: Promise<void>[] = [];

        // Prefetch KPIs (mais importante)
        prefetchPromises.push(
            queryClient.prefetchQuery({
                queryKey: dashboardKeys.metricas(lojasSelecionadas, dataInicio, dataFim),
                queryFn: () => getMetricasConsolidadas(lojasSelecionadas, dataInicio, dataFim),
                staleTime: 1000 * 60 * 5,
            })
        );

        // Prefetch Ranking (segunda tela mais usada)
        prefetchPromises.push(
            queryClient.prefetchQuery({
                queryKey: dashboardKeys.rankingLojas(dataInicio, dataFim),
                queryFn: () => getRankingLojas(dataInicio, dataFim),
                staleTime: 1000 * 60 * 5,
            })
        );

        // Prefetch lojas
        prefetchPromises.push(
            queryClient.prefetchQuery({
                queryKey: dashboardKeys.lojas(),
                queryFn: getLojas,
                staleTime: 1000 * 60 * 30,
            })
        );

        // Executa todos em paralelo (fail-fast é ok, dados serão carregados on-demand)
        try {
            await Promise.allSettled(prefetchPromises);
            if (__DEV__) {
                console.log('[usePrefetchDashboard] Prefetch concluído');
            }
        } catch (error) {
            // Silently fail - dados serão carregados on-demand
            if (__DEV__) {
                console.log('[usePrefetchDashboard] Prefetch parcialmente falhou:', error);
            }
        }
    };

    return { prefetchCriticalData };
}
