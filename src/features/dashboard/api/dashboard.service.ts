/**
 * Dashboard Service - API para Presence Dashboard API (Horse)
 *
 * Backend: Presence Dashboard API (Delphi + Horse)
 * Base URL: http://{host}:{port}/api/v1
 *
 * Endpoints usam query parameters:
 *   ?lojas=01,02 ou ?lojas=--todas--
 *   &dtIni=2025-01-01
 *   &dtFim=2025-01-31
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

/**
 * Extrai dados da resposta padrão do backend
 * Backend retorna: { success: true, data: {...}, timestamp: '...' }
 */
function extractData<T>(response: any): T {
    const raw = response.data;
    // Se tem wrapper { success, data }
    if (raw && typeof raw === 'object' && 'data' in raw) {
        return raw.data as T;
    }
    // Se é array direto ou objeto direto
    return raw as T;
}

// ========================================
// Types - Responses do Backend
// ========================================

export interface Loja {
    codigo: string;
    nome: string;
    uf?: string;
}

/**
 * Variação percentual entre períodos
 * Backend: TVariacao.ToJSON()
 */
export interface VariacaoTemporal {
    valor: number;
    percentual: number;
    direcao: "up" | "down" | "stable";
}

/**
 * Métricas de faturamento
 * Backend: TMetricaFaturamento.ToJSON()
 */
export interface MetricaFaturamento {
    atual: number;
    anterior: number;
    anoAnterior: number;
    variacao: VariacaoTemporal;
    variacaoAno: VariacaoTemporal;
}

/**
 * Métricas de tickets (ROLs)
 * Backend: TMetricaTickets.ToJSON()
 */
export interface MetricaTickets {
    atual: number;
    anterior: number;
    anoAnterior: number;
    ticketMedio: number;
    ticketMedioAnterior: number;
    variacao: VariacaoTemporal;
    variacaoTicketMedio: VariacaoTemporal;
}

/**
 * Métricas de peças
 * Backend: TMetricaPecas.ToJSON()
 */
export interface MetricaPecas {
    atual: number;
    anterior: number;
    anoAnterior: number;
    precoPeca: number;
    precoPecaAnterior: number;
    variacao: VariacaoTemporal;
    variacaoPrecoPeca: VariacaoTemporal;
}

/**
 * Métricas de clientes
 * Backend: TMetricaClientes.ToJSON()
 */
export interface MetricaClientes {
    total: number;
    ativos: number;
    novos: number;
    inativos: number;
    novosAnterior: number;
    variacaoNovos: VariacaoTemporal;
}

/**
 * Métricas de delivery
 * Backend: TMetricaDelivery.ToJSON()
 */
export interface MetricaDelivery {
    quantidade: number;
    percentual: number;
    quantidadeAnterior: number;
    percentualAnterior: number;
    variacao: VariacaoTemporal;
}

/**
 * Ranking na rede
 * Backend: TRankingRede.ToJSON()
 */
export interface MetricaRanking {
    posicao: number;
    totalLojas: number;
    faturamento: number;
    nomeLoja: string;
    variacao: "subiu" | "desceu" | "manteve";
}

/**
 * Médias da rede para comparativo
 * Backend: TMediaRede.ToJSON()
 */
export interface MetricaMediaRede {
    totalLojas: number;
    faturamento: number;
    ticketMedio: number;
    pecas: number;
    pctDelivery: number;
    diferencaFaturamento: number;
    diferencaTicketMedio: number;
    diferencaPecas: number;
}

/**
 * Projeção do mês
 * Backend: TProjecaoMes.ToJSON()
 */
export interface MetricaProjecao {
    valorAtual: number;
    valorProjetado: number;
    meta: number;
    diasUteisPassados: number;
    diasUteisTotais: number;
    diasUteisRestantes: number;
    percentualMeta: number;
}

/**
 * Métricas consolidadas do dashboard
 * Backend: TMetricasConsolidadas.ToJSON()
 * Endpoint: GET /api/v1/metricas/consolidadas
 */
export interface DashboardKPIs {
    faturamento: MetricaFaturamento;
    tickets: MetricaTickets;
    pecas: MetricaPecas;
    clientes: MetricaClientes;
    delivery: MetricaDelivery;
    ranking: MetricaRanking;
    mediaRede: MetricaMediaRede;
    projecao: MetricaProjecao;
}

export interface DadosGraficoLinha {
    titulo: string;
    metrica: string;
    pontos: Array<{ label: string; valor: number; valorAnterior?: number }>;
}

/**
 * Formato transformado para gráfico de barras de faturamento diário
 * Backend: { dias, diasAnteriores } → Frontend: { categorias, serieAtual, serieAnterior }
 */
export interface DadosGraficoBarras {
    titulo: string;
    categorias: string[];
    serieAtual: number[];
    serieAnterior?: number[];
}

/**
 * Formato transformado para faturamento mensal comparativo
 * Backend: { meses[] } → Frontend: { dadosAnoAtual, dadosAnoAnterior }
 */
export interface FaturamentoMensalComparativo {
    anoAtual: number;
    anoAnterior: number;
    dadosAnoAtual: Array<{ mes: number; valor: number }>;
    dadosAnoAnterior: Array<{ mes: number; valor: number }>;
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

export interface CelulaHeatmap {
    diaSemana: number;
    diaSemanaLabel: string;
    hora: number;
    horaLabel: string;
    valor: number;
    intensidade: number;
}

export interface DadosHeatmapTemporal {
    titulo: string;
    diasSemana: string[];
    horas: string[];
    valores?: number[][];     // Formato antigo (matriz 2D)
    celulas?: CelulaHeatmap[]; // Formato novo (array de objetos)
    maxValor: number;
    minValor?: number;
    metrica?: string;
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
    intensidade: number; // 0-1 normalizado
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
// Base Path - Presence Dashboard API
// ========================================

const BASE_PATH = "/api/v1";

/**
 * GET /api/v1/lojas
 * Lista de lojas disponíveis para o dashboard
 */
export async function getLojas(): Promise<Loja[]> {
    const url = `${BASE_PATH}/lojas`;
    console.log('[Dashboard API] Fetching Lojas... URL:', url);
    try {
        const response = await apiClient.get(url);
        console.log('[Dashboard API] Lojas raw response:', JSON.stringify(response.data).substring(0, 500));

        // Backend retorna { success: true, data: [...], count: N }
        const lojas = extractData<Loja[]>(response);

        if (Array.isArray(lojas) && lojas.length > 0) {
            console.log('[Dashboard API] First loja example:', JSON.stringify(lojas[0]));
            console.log('[Dashboard API] Total lojas:', lojas.length);
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
 * GET /api/v1/metricas/consolidadas?lojas=...&dtIni=...&dtFim=...
 * KPIs consolidados do dashboard
 */
export async function getMetricasConsolidadas(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DashboardKPIs> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    console.log('[Dashboard API] MetricasConsolidadas:', params);

    try {
        const response = await apiClient.get(`${BASE_PATH}/metricas/consolidadas`, { params });

        console.log('[Dashboard API] MetricasConsolidadas response:', JSON.stringify(response.data).substring(0, 500));

        return extractData<DashboardKPIs>(response);
    } catch (error) {
        console.error('[Dashboard API] MetricasConsolidadas ERROR:', error);
        throw error;
    }
}

/**
 * GET /api/v1/graficos/faturamento-diario?lojas=...&mes=...&ano=...
 * Faturamento dia a dia do mês para gráfico de barras
 * 
 * Backend retorna: { dias: [{dia, valor}], diasAnteriores: [{dia, valor}] }
 * Frontend espera: { titulo, categorias, serieAtual, serieAnterior }
 */
export async function getFaturamentoDiario(
    lojas: string[],
    mes?: number,
    ano?: number
): Promise<DadosGraficoBarras> {
    const params = {
        lojas: formatLojasParam(lojas),
        mes: mes ?? new Date().getMonth() + 1,
        ano: ano ?? new Date().getFullYear(),
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/faturamento-diario`, { params });
    const rawData = extractData<any>(response);

    // Transformar formato backend para frontend (igual React web)
    const dias: Array<{ dia: number; valor: number }> = rawData?.dias || [];
    const diasAnteriores: Array<{ dia: number; valor: number }> = rawData?.diasAnteriores || [];

    const categorias = dias.map((d) => String(d.dia));
    const serieAtual = dias.map((d) => d.valor);

    // Criar serieAnterior mapeando por dia
    const diasAnterioresMap = new Map(diasAnteriores.map(d => [d.dia, d.valor]));
    const serieAnterior = categorias.map(dia => diasAnterioresMap.get(Number(dia)) || 0);

    return {
        titulo: rawData?.titulo || 'Faturamento Diário',
        categorias,
        serieAtual,
        serieAnterior: serieAnterior.some(v => v > 0) ? serieAnterior : undefined,
    };
}

/**
 * GET /api/v1/graficos/faturamento-mensal?lojas=...&ano=...
 * Faturamento mensal comparativo (ano atual vs anterior)
 * 
 * Backend retorna: { meses: [{mesNum, valorAtual, valorAnterior}], anoAtual, anoAnterior }
 * Frontend espera: { anoAtual, anoAnterior, dadosAnoAtual, dadosAnoAnterior }
 */
export async function getFaturamentoMensal(
    lojas: string[],
    ano?: number
): Promise<FaturamentoMensalComparativo> {
    const params = {
        lojas: formatLojasParam(lojas),
        ano: ano ?? new Date().getFullYear(),
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/faturamento-mensal`, { params });
    const rawData = extractData<any>(response);

    // Transformar formato backend para frontend (igual React web)
    const meses = rawData?.meses || [];

    const dadosAnoAtual = meses.map((m: { mesNum: number; valorAtual: number }) => ({
        mes: m.mesNum,
        valor: m.valorAtual || 0,
    }));

    const dadosAnoAnterior = meses.map((m: { mesNum: number; valorAnterior: number }) => ({
        mes: m.mesNum,
        valor: m.valorAnterior || 0,
    }));

    return {
        anoAtual: rawData?.anoAtual || new Date().getFullYear(),
        anoAnterior: rawData?.anoAnterior || new Date().getFullYear() - 1,
        dadosAnoAtual,
        dadosAnoAnterior,
    };
}

/**
 * GET /api/v1/graficos/crescimento-12m?lojas=...&metrica=...
 * Linha de crescimento dos últimos 12 meses
 */
export async function getCrescimento12Meses(
    lojas: string[],
    metrica: "faturamento" | "pecas" | "tickets" = "faturamento"
): Promise<DadosGraficoLinha> {
    const params = {
        lojas: formatLojasParam(lojas),
        metrica,
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/crescimento-12m`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/graficos/distribuicao-servicos?lojas=...&dtIni=...&dtFim=...
 * Distribuição de faturamento por grupo de serviço (pizza)
 */
export async function getDistribuicaoServicos(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosGraficoPizza> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/distribuicao-servicos`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/graficos/evolucao-pagamentos?lojas=...&dtIni=...&dtFim=...
 * Evolução de pagamentos por modalidade
 * 
 * Backend retorna: { success, data: { titulo, data: [...] } }
 * Frontend espera: EvolucaoPagamentos[] (array de meses)
 */
export async function getEvolucaoPagamentos(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<EvolucaoPagamentos[]> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/evolucao-pagamentos`, { params });
    const rawData = extractData<any>(response);

    // Backend retorna { titulo, data: [...] } - precisamos extrair o array
    const meses = (rawData?.data || rawData || []) as EvolucaoPagamentos[];

    console.log('[Dashboard API] EvolucaoPagamentos:', {
        rawDataKeys: Object.keys(rawData || {}),
        mesesCount: meses?.length || 0,
    });

    return meses;
}

/**
 * GET /api/v1/graficos/pendencia-producao?lojas=...
 * Pendências de produção (backlog) por dias de atraso
 */
export async function getPendenciaProducao(
    lojas: string[]
): Promise<DadosPendenciaProducao> {
    const params = {
        lojas: formatLojasParam(lojas),
    };

    const response = await apiClient.get(`${BASE_PATH}/graficos/pendencia-producao`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/mapas/temporal?lojas=...&dtIni=...&dtFim=...
 * Mapa de calor temporal (matriz dia×hora)
 * 
 * Backend retorna: { celulas: [{diaSemana, hora, valor, intensidade 0-100}] }
 * Frontend espera: { celulas: [{dia, hora, valor, intensidade 0-1}], maxValor, minValor }
 */
export async function getMapaTemporal(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosHeatmapTemporal> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    console.log('[Dashboard API] Fetching MapaTemporal...', params);
    try {
        const response = await apiClient.get(`${BASE_PATH}/mapas/temporal`, { params });
        const rawData = extractData<any>(response);

        console.log('[Dashboard API] MapaTemporal raw response:', {
            rawKeys: Object.keys(rawData || {}),
            hasCelulas: Array.isArray(rawData?.celulas),
            celulasCount: rawData?.celulas?.length || 0,
        });

        // Transformar formato do backend para formato do frontend
        // Backend: diaSemana, hora, valor, intensidade (0-100)
        // Frontend: dia, hora, valor, intensidade (0-1)
        const celulasRaw = rawData?.celulas || [];
        const celulas = celulasRaw.map(
            (c: { diaSemana: number; hora: number; valor: number; intensidade: number }) => ({
                dia: c.diaSemana,
                hora: c.hora,
                valor: c.valor,
                intensidade: c.intensidade / 100, // Backend 0-100, frontend 0-1
            })
        );

        // Calcular max/min dos valores
        const valores = celulas.map((c: { valor: number }) => c.valor);
        const maxValor = valores.length > 0 ? Math.max(...valores) : 0;
        const minValor = valores.length > 0 ? Math.min(...valores) : 0;

        const result: DadosHeatmapTemporal = {
            titulo: rawData?.titulo || 'Mapa de Calor Temporal',
            diasSemana: rawData?.diasSemana || ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
            horas: rawData?.horas || Array.from({ length: 24 }, (_, i) => `${i}h`),
            celulas,
            maxValor,
            minValor,
            metrica: rawData?.metrica || 'faturamento',
        };

        console.log('[Dashboard API] MapaTemporal transformed:', {
            celulasCount: result.celulas?.length || 0,
            maxValor: result.maxValor,
            minValor: result.minValor,
        });

        return result;
    } catch (error: any) {
        console.error('[Dashboard API] MapaTemporal ERROR:', error?.message);
        throw error;
    }
}

/**
 * GET /api/v1/mapas/geografico?lojas=...&dtIni=...&dtFim=...
 * Dados geográficos por UF
 */
export async function getMapaGeografico(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<DadosMapaGeografico> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    const response = await apiClient.get(`${BASE_PATH}/mapas/geografico`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/ranking/lojas?dtIni=...&dtFim=...
 * Ranking de todas as lojas
 * 
 * Backend retorna: { lojas: [{posicao, loja, nomeLoja, valor, percentualTop}], totalExibido, valorTotal }
 * Frontend espera: { lojas: [{posicao, codigo, nome, faturamento, percentual}], totalLojas, totalFaturamento }
 */
export async function getRankingLojas(
    dataInicio: Date,
    dataFim: Date
): Promise<DadosRankingLojas> {
    const params = {
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    console.log('[Dashboard API] Fetching RankingLojas...', params);
    try {
        const response = await apiClient.get(`${BASE_PATH}/ranking/lojas`, { params });
        const rawData = extractData<any>(response);

        console.log('[Dashboard API] RankingLojas raw response:', {
            rawKeys: Object.keys(rawData || {}),
            lojasCount: rawData?.lojas?.length || 0,
            firstRaw: rawData?.lojas?.[0],
            totalExibido: rawData?.totalExibido,
            valorTotal: rawData?.valorTotal,
        });

        // Transformar formato do backend para formato do frontend
        // Backend: posicao, loja, nomeLoja, valor, percentualTop
        // Frontend: posicao, codigo, nome, faturamento, percentual
        interface BackendLojaRanking {
            posicao: number;
            loja: string;
            nomeLoja: string;
            valor: number;
            percentualTop: number;
        }

        const lojasRaw = Array.isArray(rawData) ? rawData : (rawData?.lojas || []);

        const lojasTransformadas = lojasRaw.map((l: BackendLojaRanking) => ({
            posicao: l.posicao,
            codigo: l.loja,
            nome: l.nomeLoja,
            faturamento: l.valor,
            percentual: l.percentualTop,
            intensidade: l.percentualTop / 100, // Normalizado 0-1 como React web
        }));

        const totalLojas = rawData?.totalExibido || lojasTransformadas.length;
        const totalFaturamento = rawData?.valorTotal || lojasTransformadas.reduce(
            (sum: number, l: { faturamento: number }) => sum + l.faturamento,
            0
        );

        const result: DadosRankingLojas = {
            lojas: lojasTransformadas,
            totalLojas,
            totalFaturamento,
        };

        console.log('[Dashboard API] RankingLojas transformed:', {
            totalLojas: result.totalLojas,
            totalFaturamento: result.totalFaturamento,
            lojasCount: result.lojas.length,
            firstLoja: result.lojas[0],
        });

        return result;
    } catch (error: any) {
        console.error('[Dashboard API] RankingLojas ERROR:', error?.message);
        throw error;
    }
}

/**
 * GET /api/v1/ranking/rede?loja=...&dtIni=...&dtFim=...
 * Posição de uma loja específica na rede
 */
export async function getRankingRede(
    loja: string,
    dataInicio: Date,
    dataFim: Date
): Promise<MetricaRanking & { faturamento: number }> {
    const params = {
        loja,
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    const response = await apiClient.get(`${BASE_PATH}/ranking/rede`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/dias-uteis?loja=...&ano=...&mes=...
 * Dias úteis do mês para cálculo de projeção
 */
export async function getDiasUteis(
    loja: string,
    ano?: number,
    mes?: number
): Promise<{ diasUteis: number; diasUteisPassados: number; diaAtual: number }> {
    const params = {
        loja,
        ano: ano ?? new Date().getFullYear(),
        mes: mes ?? new Date().getMonth() + 1,
    };

    const response = await apiClient.get(`${BASE_PATH}/dias-uteis`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/passivos-financeiros?lojas=...
 * Passivos financeiros (ROLs em aberto, planos, créditos)
 */
export async function getPassivosFinanceiros(
    lojas: string[]
): Promise<PassivosFinanceiros> {
    const params = {
        lojas: formatLojasParam(lojas),
    };

    const response = await apiClient.get(`${BASE_PATH}/passivos-financeiros`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/prazos-entrega?lojas=...&dtIni=...&dtFim=...
 * Estatísticas de prazos de entrega por faixa
 */
export async function getPrazosEntrega(
    lojas: string[],
    dataInicio: Date,
    dataFim: Date
): Promise<PrazosEntrega> {
    const params = {
        lojas: formatLojasParam(lojas),
        dtIni: formatDateForAPI(dataInicio),
        dtFim: formatDateForAPI(dataFim),
    };

    const response = await apiClient.get(`${BASE_PATH}/prazos-entrega`, { params });
    return extractData(response);
}

/**
 * GET /api/v1/config/semaforos?loja=...
 * Configuração de semáforos/thresholds
 */
export async function getConfigSemaforos(
    loja: string
): Promise<ConfigSemaforos> {
    const params = { loja };
    const response = await apiClient.get(`${BASE_PATH}/config/semaforos`, { params });
    return extractData(response);
}

/**
 * PUT /api/v1/config/semaforos
 * Salvar configuração de semáforos
 */
export async function saveConfigSemaforos(
    config: ConfigSemaforos & { loja: string }
): Promise<{ success: boolean }> {
    const response = await apiClient.put(`${BASE_PATH}/config/semaforos`, config);
    return response.data;
}
