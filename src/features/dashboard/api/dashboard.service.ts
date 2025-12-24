/**
 * Dashboard Service - API para TSMDashLaundry (Presence Remote)
 *
 * Backend: Presence Remote (DataSnap)
 * Módulo: uSMDashLaundry.pas
 * Base URL: http://{host}:{port}/datasnap/rest/TSMDashLaundry
 */

import { apiClient } from "@/shared/api/axios-client";

// ========================================
// Helpers
// ========================================

/**
 * Formata data para o padrão ISO8601 (YYYY-MM-DD)
 * Backend espera este formato para conversão no Firebird
 */
function formatDateForAPI(date: Date): string {
    // Garantir que temos uma data válida
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, "0")}-${hoje.getDate().toString().padStart(2, "0")}`;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Formata lista de lojas para parâmetro de URL
 * @param lojas Array de códigos ou código único
 * @returns String CSV ("01,02,03") ou "--todas--"
 */
function formatLojasParam(lojas?: string[]): string {
    if (!lojas || lojas.length === 0) {
        return "--todas--";
    }
    return lojas.join(",");
}

// ========================================
// Types - Responses do Backend
// ========================================

export interface Loja {
    codigo: string;
    nome: string;
    uf?: string;
}

export interface VariacaoTemporal {
    valor: number;
    percentual: number;
    direcao: "up" | "down" | "stable";
}

export interface MetricaFaturamento {
    valor: number;
    valorRede?: number;
    meta?: number;
}

export interface MetricaTickets {
    quantidade: number;
    ticketMedio: number;
    percentualDelivery: number;
}

export interface MetricaPecas {
    quantidade: number;
    pecasPorAtendimento: number;
    precoMedioPeca: number;
}

export interface MetricaClientes {
    ativos: number;
    novos: number;
    inativos: number;
    total: number;
}

export interface MetricaRanking {
    posicao: number;
    totalLojas: number;
    variacao: "subiu" | "desceu" | "manteve";
}

export interface MetricaProjecao {
    faturamentoProjetado: number;
    meta?: number;
    diasUteis: number;
    diasUteisPassados: number;
}

export interface DashboardKPIs {
    faturamento: {
        atual: MetricaFaturamento;
        anterior?: MetricaFaturamento;
        anoAnterior?: MetricaFaturamento;
        variacao?: VariacaoTemporal;
    };
    tickets: {
        atual: MetricaTickets;
        variacao?: VariacaoTemporal;
    };
    pecas: {
        atual: MetricaPecas;
        variacao?: VariacaoTemporal;
    };
    clientes: MetricaClientes;
    ranking: MetricaRanking;
    projecao: MetricaProjecao;
}

export interface DadosGraficoLinha {
    titulo: string;
    metrica: string;
    pontos: Array<{ label: string; valor: number; valorAnterior?: number }>;
}

export interface DadosGraficoBarras {
    titulo: string;
    mesAtual: { label: string; valores: number[] };
    mesAnterior?: { label: string; valores: number[] };
    labels: string[];
}

export interface FaturamentoMensalComparativo {
    titulo: string;
    anoAtual: { ano: number; valores: number[] };
    anoAnterior: { ano: number; valores: number[] };
    labels: string[];
}

export interface SegmentoPizza {
    grupo: string;
    valor: number;
    percentual: number;
    cor: string;
}

export interface DadosGraficoPizza {
    titulo: string;
    segmentos: SegmentoPizza[];
    total: number;
}

export interface EvolucaoPagamentos {
    periodo: string;
    pagamentos: Array<{
        modalidade: string;
        valor: number;
        percentual: number;
        cor: string;
    }>;
}

export interface FaixaPendencia {
    faixa: string;
    quantidade: number;
    percentual: number;
    cor: string;
}

export interface DadosPendenciaProducao {
    faixas: FaixaPendencia[];
    totalPendente: number;
}

export interface DadosHeatmapTemporal {
    titulo: string;
    diasSemana: string[];
    horas: string[];
    valores: number[][];
    maxValor: number;
    minValor: number;
}

export interface RegiaoGeografica {
    uf: string;
    lojas: number;
    faturamento: number;
    percentual: number;
}

export interface DadosMapaGeografico {
    regioes: RegiaoGeografica[];
    totalLojas: number;
    totalFaturamento: number;
}

export interface LojaRanking {
    posicao: number;
    codigo: string;
    nome: string;
    faturamento: number;
    percentual: number;
}

export interface DadosRankingLojas {
    lojas: LojaRanking[];
    totalLojas: number;
    totalFaturamento: number;
}

export interface PassivosFinanceiros {
    rolsEmAberto: { quantidade: number; valor: number };
    planos: { quantidade: number; valor: number };
    creditos: { quantidade: number; valor: number };
    total: number;
}

export interface FaixaPrazo {
    faixa: string;
    quantidade: number;
    percentual: number;
}

export interface PrazosEntrega {
    prazoMedio: number;
    faixas: FaixaPrazo[];
    total: number;
}

export interface ConfigSemaforos {
    faturamento: { verde: number; amarelo: number };
    tickets: { verde: number; amarelo: number };
    delivery: { verde: number; amarelo: number };
    pecas: { verde: number; amarelo: number };
}

// ========================================
// Endpoints do TSMDashLaundry
// ========================================

const BASE_PATH = "/TSMDashLaundry";

/**
 * GET /TSMDashLaundry/Lojas
 * Lista de lojas disponíveis para o dashboard
 */
export async function getLojas(): Promise<Loja[]> {
    const url = `${BASE_PATH}/Lojas`;
    console.log('[Dashboard API] Fetching Lojas... URL:', url);
    try {
        const response = await apiClient.get(url);
        console.log('[Dashboard API] Lojas raw response.data:', JSON.stringify(response.data).substring(0, 500));

        // Backend retorna { value: [...], Count: N }
        const lojas = response.data?.value ?? response.data ?? [];

        // Log first loja to check structure
        if (Array.isArray(lojas) && lojas.length > 0) {
            console.log('[Dashboard API] First loja example:', JSON.stringify(lojas[0]));
            console.log('[Dashboard API] Total lojas:', lojas.length);
        } else {
            console.log('[Dashboard API] No lojas or not an array:', typeof lojas);
        }

        return lojas;
    } catch (error: any) {
        console.error('[Dashboard API] Lojas ERROR:', {
            message: error?.message,
            code: error?.code,
            name: error?.name,
        });
        throw error;
    }
}

/**
 * GET /TSMDashLaundry/MetricasConsolidadas/{lojas}/{dtIni}/{dtFim}
 * KPIs consolidados do dashboard
 */
export async function getMetricasConsolidadas(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DashboardKPIs> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    console.log('[Dashboard API] MetricasConsolidadas:', { lojasParam, dtIni, dtFim });

    try {
        const response = await apiClient.get(
            `${BASE_PATH}/MetricasConsolidadas/${lojasParam}/${dtIni}/${dtFim}`
        );

        console.log('[Dashboard API] MetricasConsolidadas response:', response.data);

        // Backend retorna { status: "ok", data: {...} }
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('[Dashboard API] MetricasConsolidadas ERROR:', error);
        throw error;
    }
}

/**
 * GET /TSMDashLaundry/FaturamentoDiario/{lojas}/{mes}/{ano}
 * Faturamento dia a dia do mês para gráfico de barras
 */
export async function getFaturamentoDiario(
    lojas: string[],
    mes?: number,
    ano?: number
): Promise<DadosGraficoBarras> {
    const lojasParam = formatLojasParam(lojas);
    const mesParam = mes ?? new Date().getMonth() + 1;
    const anoParam = ano ?? new Date().getFullYear();

    const response = await apiClient.get(
        `${BASE_PATH}/FaturamentoDiario/${lojasParam}/${mesParam}/${anoParam}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/FaturamentoMensal/{lojas}/{ano}
 * Faturamento mensal comparativo (ano atual vs anterior)
 */
export async function getFaturamentoMensal(
    lojas: string[],
    ano?: number
): Promise<FaturamentoMensalComparativo> {
    const lojasParam = formatLojasParam(lojas);
    const anoParam = ano ?? new Date().getFullYear();

    const response = await apiClient.get(
        `${BASE_PATH}/FaturamentoMensal/${lojasParam}/${anoParam}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/Crescimento12Meses/{lojas}/{metrica}
 * Linha de crescimento dos últimos 12 meses
 */
export async function getCrescimento12Meses(
    lojas: string[],
    metrica: "faturamento" | "pecas" | "tickets" = "faturamento"
): Promise<DadosGraficoLinha> {
    const lojasParam = formatLojasParam(lojas);

    const response = await apiClient.get(
        `${BASE_PATH}/Crescimento12Meses/${lojasParam}/${metrica}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/DistribuicaoServicos/{lojas}/{dtIni}/{dtFim}
 * Distribuição de faturamento por grupo de serviço (pizza)
 */
export async function getDistribuicaoServicos(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosGraficoPizza> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/DistribuicaoServicos/${lojasParam}/${dtIni}/${dtFim}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/EvolucaoPagamentos/{lojas}/{dtIni}/{dtFim}
 * Evolução de pagamentos por modalidade
 * Backend retorna: {data: EvolucaoPagamentos[], _source: 'database'|'cache'}
 */
export async function getEvolucaoPagamentos(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<EvolucaoPagamentos[]> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/EvolucaoPagamentos/${lojasParam}/${dtIni}/${dtFim}`
    );
    // Backend retorna { data: [...], _source: '...' }
    const wrapper = response.data as { data: EvolucaoPagamentos[] };
    return wrapper.data ?? response.data?.value ?? response.data ?? [];
}

/**
 * GET /TSMDashLaundry/PendenciaProducao/{lojas}
 * Pendências de produção (backlog) por dias de atraso
 */
export async function getPendenciaProducao(
    lojas: string[]
): Promise<DadosPendenciaProducao> {
    const lojasParam = formatLojasParam(lojas);

    const response = await apiClient.get(
        `${BASE_PATH}/PendenciaProducao/${lojasParam}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/MapaTemporal/{lojas}/{dtIni}/{dtFim}
 * Mapa de calor temporal (matriz dia×hora)
 */
export async function getMapaTemporal(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosHeatmapTemporal> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/MapaTemporal/${lojasParam}/${dtIni}/${dtFim}`
    );
    return response.data.data || response.data;
}

/**
 * GET /TSMDashLaundry/MapaGeografico/{lojas}/{dtIni}/{dtFim}
 * Dados geográficos por UF
 */
export async function getMapaGeografico(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosMapaGeografico> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/MapaGeografico/${lojasParam}/${dtIni}/${dtFim}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/RankingLojas/{dtIni}/{dtFim}
 * Ranking de todas as lojas
 */
export async function getRankingLojas(
    dataInicio: Date,
    dataFim: Date
): Promise<DadosRankingLojas> {
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/RankingLojas/${dtIni}/${dtFim}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/RankingRede/{loja}/{dtIni}/{dtFim}
 * Posição de uma loja específica na rede
 */
export async function getRankingRede(
    loja: string,
    dataInicio: Date,
    dataFim: Date
): Promise<MetricaRanking & { faturamento: number }> {
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/RankingRede/${loja}/${dtIni}/${dtFim}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/DiasUteis/{loja}/{ano}/{mes}
 * Dias úteis do mês para cálculo de projeção
 */
export async function getDiasUteis(
    loja: string,
    ano?: number,
    mes?: number
): Promise<{ diasUteis: number; diasUteisPassados: number; diaAtual: number }> {
    const anoParam = ano ?? new Date().getFullYear();
    const mesParam = mes ?? new Date().getMonth() + 1;

    const response = await apiClient.get(
        `${BASE_PATH}/DiasUteis/${loja}/${anoParam}/${mesParam}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/PassivosFinanceiros/{lojas}
 * Passivos financeiros (ROLs em aberto, planos, créditos)
 */
export async function getPassivosFinanceiros(
    lojas: string[]
): Promise<PassivosFinanceiros> {
    const lojasParam = formatLojasParam(lojas);

    const response = await apiClient.get(
        `${BASE_PATH}/PassivosFinanceiros/${lojasParam}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/PrazosEntrega/{lojas}/{dtIni}/{dtFim}
 * Estatísticas de prazos de entrega por faixa
 */
export async function getPrazosEntrega(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<PrazosEntrega> {
    const lojasParam = formatLojasParam(lojas);
    const dtIni = formatDateForAPI(dataInicio);
    const dtFim = formatDateForAPI(dataFim);

    const response = await apiClient.get(
        `${BASE_PATH}/PrazosEntrega/${lojasParam}/${dtIni}/${dtFim}`
    );
    return response.data;
}

/**
 * GET /TSMDashLaundry/ConfigSemaforos/{loja}
 * Configuração de semáforos/thresholds
 */
export async function getConfigSemaforos(
    loja: string
): Promise<ConfigSemaforos> {
    const response = await apiClient.get(`${BASE_PATH}/ConfigSemaforos/${loja}`);
    return response.data;
}

/**
 * POST /TSMDashLaundry/updateConfigSemaforos
 * Salvar configuração de semáforos
 */
export async function saveConfigSemaforos(
    config: ConfigSemaforos & { loja: string }
): Promise<{ success: boolean }> {
    const response = await apiClient.post(
        `${BASE_PATH}/updateConfigSemaforos`,
        config
    );
    return response.data;
}
