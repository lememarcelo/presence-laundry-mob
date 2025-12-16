/**
 * Dashboard Gerencial - Modelos TypeScript
 * Tipos e interfaces para o dashboard de KPIs e métricas
 * Espelho dos tipos do frontend web (presence-laundry)
 */

// ========================================
// Tipos base para variações temporais
// ========================================

export interface VariacaoTemporal {
  valor: number;
  percentual: number;
  direcao: 'up' | 'down' | 'stable';
}

export interface ComparativoTemporal<T> {
  atual: T;
  anterior: T;
  anoAnterior?: T;
  variacao: VariacaoTemporal;
  variacaoAnoAnterior?: VariacaoTemporal;
}

// ========================================
// KPI Cards - Métricas principais
// ========================================

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
  variacao: 'subiu' | 'desceu' | 'manteve';
  posicaoAnterior?: number;
}

export interface MetricaProjecao {
  valorAtual: number;
  valorProjetado: number;
  meta: number;
  diasUteisPassados: number;
  diasUteisTotais: number;
  percentualMeta: number;
}

// ========================================
// Dados consolidados do Dashboard
// ========================================

export interface DashboardKPIs {
  faturamento: ComparativoTemporal<MetricaFaturamento>;
  tickets: ComparativoTemporal<MetricaTickets>;
  pecas: ComparativoTemporal<MetricaPecas>;
  clientes: MetricaClientes;
  ranking: MetricaRanking;
  projecao: MetricaProjecao;
}

// ========================================
// Dados para gráficos
// ========================================

export type TipoMetricaEvolucao = 'faturamento' | 'pecas' | 'tickets' | 'ticketMedio' | 'clientes';

export interface PontoGrafico {
  label: string;
  valor: number;
  valorComparativo?: number;
}

export interface DadosGraficoLinha {
  titulo: string;
  metrica: TipoMetricaEvolucao;
  pontos: PontoGrafico[];
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

export interface DadosGraficoBarras {
  titulo: string;
  categorias: string[];
  serieAtual: number[];
  serieAnterior?: number[];
}

// ========================================
// Mapa de calor temporal
// ========================================

export interface CelulaHeatmap {
  dia: number; // 0-6 (Domingo-Sábado)
  hora: number; // 0-23
  valor: number;
  intensidade: number; // 0-1 normalizado
}

export interface DadosHeatmapTemporal {
  celulas: CelulaHeatmap[];
  maxValor: number;
  minValor: number;
}

// ========================================
// Ranking de Lojas
// ========================================

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

// ========================================
// Evolução de pagamentos
// ========================================

export interface DadosPagamento {
  modalidade: string;
  valor: number;
  percentual: number;
  cor: string;
}

export interface EvolucaoPagamentos {
  periodo: string;
  pagamentos: DadosPagamento[];
}

// ========================================
// Pendência de produção
// ========================================

export interface FaixaAtraso {
  faixa: string;
  dias: number;
  quantidade: number;
  cor: string;
}

export interface DadosPendenciaProducao {
  faixas: FaixaAtraso[];
  totalPendente: number;
}

// ========================================
// Filtros do Dashboard
// ========================================

export interface FiltrosDashboard {
  lojas: string[];
  dataInicio: Date;
  dataFim: Date;
  metricaSelecionada?: 'faturamento' | 'pecas' | 'tickets';
}

export interface Loja {
  codigo: string;
  nome: string;
  cidade?: string;
  estado?: string;
}

// ========================================
// Configuração de Semáforos
// ========================================

export type StatusSemaforo = 'verde' | 'amarelo' | 'vermelho';

export interface ThresholdSemaforo {
  verde: number;
  amarelo: number;
  vermelho: number;
}

export interface ConfigSemaforos {
  faturamento: ThresholdSemaforo;
  tickets: ThresholdSemaforo;
  pecas: ThresholdSemaforo;
  ticketMedio: ThresholdSemaforo;
}

// ========================================
// Passivos Financeiros
// ========================================

export interface PassivosFinanceiros {
  rolsEmAberto: {
    quantidade: number;
    valor: number;
  };
  passivoPlanos: {
    quantidade: number;
    valor: number;
  };
  passivoCreditos: {
    quantidade: number;
    valor: number;
  };
}

// ========================================
// Faturamento Mensal Comparativo
// ========================================

export interface ValorMensal {
  mes: number;
  valor: number;
}

export interface FaturamentoMensalComparativo {
  anoAtual: number;
  anoAnterior: number;
  dadosAnoAtual: ValorMensal[];
  dadosAnoAnterior: ValorMensal[];
}

// ========================================
// Prazos de Entrega
// ========================================

export interface FaixaPrazoEntrega {
  faixa: string;
  dias: number;
  quantidade: number;
  percentual: number;
  cor: string;
}

export interface PrazosEntrega {
  faixas: FaixaPrazoEntrega[];
  totalEntregas: number;
  prazoMedio: number;
}

// ========================================
// Mapa Geográfico
// ========================================

export interface RegiaoGeografica {
  uf: string;
  lojas: number;
  faturamento: number;
  percentual: number;
  intensidade: number; // 0-1 normalizado
}

export interface DadosMapaGeografico {
  regioes: RegiaoGeografica[];
  totalLojas: number;
  totalFaturamento: number;
}

// ========================================
// Response da API
// ========================================

export interface DashboardResponse {
  success: boolean;
  data: DashboardKPIs;
  timestamp: string;
}

export interface GraficosResponse {
  success: boolean;
  data: {
    crescimento12Meses: DadosGraficoLinha;
    distribuicaoServicos: DadosGraficoPizza;
    faturamentoDiario: DadosGraficoBarras;
    faturamentoMensal: DadosGraficoBarras;
    evolucaoPagamentos: EvolucaoPagamentos[];
    pendenciaProducao: DadosPendenciaProducao;
    heatmapTemporal: DadosHeatmapTemporal;
    passivosFinanceiros: PassivosFinanceiros;
    prazosEntrega: PrazosEntrega;
  };
  timestamp: string;
}

// ========================================
// Tipos para Mock Data (compatibilidade)
// ========================================

export interface KPICard {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  percentChange?: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  x: string;
  y: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  type: 'line' | 'bar' | 'area';
  color: string;
  data: ChartDataPoint[];
}

export interface HeatmapData {
  id: string;
  title: string;
  xLabels: string[];
  yLabels: string[];
  values: number[][];
  minValue: number;
  maxValue: number;
  colorScale: string[];
}

export interface RankingItem {
  id: string;
  position: number;
  name: string;
  value: number;
  formattedValue: string;
  previousPosition?: number;
  trend?: 'up' | 'down' | 'stable';
  avatar?: string;
  badge?: string;
  percentOfTotal?: number;
  metadata?: Record<string, unknown>;
}

export interface DashboardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  lojaId?: number;
  funcionarioId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  lojasSelecionadas?: string[];
}
