/**
 * Dados mockados para o Dashboard
 * Simula dados que virão do Presence Remote
 */

import {
    KPICard,
    ChartSeries,
    HeatmapData,
    RankingItem,
    DashboardFilters,
} from "@/models/dashboard.models";

// ============================================
// KPIs - Indicadores principais
// ============================================

export const mockKPIs: KPICard[] = [
    {
        id: "faturamento",
        title: "Faturamento",
        value: 87450.0,
        formattedValue: "R$ 87.450,00",
        previousValue: 82100.0,
        percentChange: 6.52,
        trend: "up",
        icon: "cash-multiple",
        color: "#10B981", // green
    },
    {
        id: "pecas",
        title: "Peças Processadas",
        value: 12847,
        formattedValue: "12.847",
        previousValue: 11920,
        percentChange: 7.78,
        trend: "up",
        icon: "tshirt-crew",
        color: "#3B82F6", // blue
    },
    {
        id: "ticket-medio",
        title: "Ticket Médio",
        value: 68.5,
        formattedValue: "R$ 68,50",
        previousValue: 72.3,
        percentChange: -5.26,
        trend: "down",
        icon: "receipt",
        color: "#F59E0B", // amber
    },
    {
        id: "clientes",
        title: "Clientes Atendidos",
        value: 1276,
        formattedValue: "1.276",
        previousValue: 1134,
        percentChange: 12.52,
        trend: "up",
        icon: "account-group",
        color: "#8B5CF6", // purple
    },
    {
        id: "os-abertas",
        title: "OS em Aberto",
        value: 234,
        formattedValue: "234",
        previousValue: 198,
        percentChange: 18.18,
        trend: "up",
        icon: "clipboard-text-clock",
        color: "#EF4444", // red
    },
    {
        id: "prazo-medio",
        title: "Prazo Médio",
        value: 3.2,
        formattedValue: "3,2 dias",
        previousValue: 3.5,
        percentChange: -8.57,
        trend: "down",
        icon: "clock-fast",
        color: "#06B6D4", // cyan
    },
];

// ============================================
// Gráficos - Séries temporais
// ============================================

export const mockFaturamentoDiario: ChartSeries = {
    id: "faturamento-diario",
    label: "Faturamento Diário",
    type: "line",
    color: "#3B82F6",
    data: [
        { x: "01/12", y: 4250 },
        { x: "02/12", y: 3890 },
        { x: "03/12", y: 5120 },
        { x: "04/12", y: 4780 },
        { x: "05/12", y: 6340 },
        { x: "06/12", y: 7890 },
        { x: "07/12", y: 8120 },
        { x: "08/12", y: 5670 },
        { x: "09/12", y: 4230 },
        { x: "10/12", y: 5890 },
        { x: "11/12", y: 6120 },
        { x: "12/12", y: 7340 },
        { x: "13/12", y: 8560 },
        { x: "14/12", y: 9210 },
        { x: "15/12", y: 4000 },
    ],
};

export const mockFaturamentoMensal: ChartSeries = {
    id: "faturamento-mensal",
    label: "Faturamento Mensal",
    type: "bar",
    color: "#8B5CF6",
    data: [
        { x: "Jan", y: 78500 },
        { x: "Fev", y: 72300 },
        { x: "Mar", y: 85200 },
        { x: "Abr", y: 91400 },
        { x: "Mai", y: 88700 },
        { x: "Jun", y: 95600 },
        { x: "Jul", y: 102300 },
        { x: "Ago", y: 98400 },
        { x: "Set", y: 105800 },
        { x: "Out", y: 112500 },
        { x: "Nov", y: 118200 },
        { x: "Dez", y: 87450 },
    ],
};

export const mockPecasPorDia: ChartSeries = {
    id: "pecas-diario",
    label: "Peças por Dia",
    type: "bar",
    color: "#10B981",
    data: [
        { x: "Seg", y: 1820 },
        { x: "Ter", y: 1650 },
        { x: "Qua", y: 1940 },
        { x: "Qui", y: 2100 },
        { x: "Sex", y: 2450 },
        { x: "Sáb", y: 2780 },
        { x: "Dom", y: 890 },
    ],
};

export const mockComparativoMensal: ChartSeries[] = [
    {
        id: "mes-atual",
        label: "Dezembro 2025",
        type: "bar",
        color: "#3B82F6",
        data: [
            { x: "Semana 1", y: 21500 },
            { x: "Semana 2", y: 24800 },
            { x: "Semana 3", y: 0 },
            { x: "Semana 4", y: 0 },
        ],
    },
    {
        id: "mes-anterior",
        label: "Novembro 2025",
        type: "bar",
        color: "#94A3B8",
        data: [
            { x: "Semana 1", y: 19200 },
            { x: "Semana 2", y: 22100 },
            { x: "Semana 3", y: 23400 },
            { x: "Semana 4", y: 25600 },
        ],
    },
];

// ============================================
// Heatmap - Mapa de calor
// ============================================

export const mockHeatmapData: HeatmapData = {
    id: "movimento-semana",
    title: "Movimento por Dia/Hora",
    xLabels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    yLabels: ["08h", "10h", "12h", "14h", "16h", "18h", "20h"],
    values: [
        // Seg  Ter  Qua  Qui  Sex  Sáb  Dom
        [0.2, 0.3, 0.25, 0.3, 0.4, 0.6, 0.1], // 08h
        [0.4, 0.5, 0.45, 0.5, 0.6, 0.8, 0.2], // 10h
        [0.6, 0.7, 0.65, 0.7, 0.75, 0.9, 0.3], // 12h
        [0.5, 0.55, 0.5, 0.6, 0.65, 0.85, 0.25], // 14h
        [0.7, 0.75, 0.7, 0.8, 0.85, 0.95, 0.35], // 16h
        [0.8, 0.85, 0.8, 0.9, 1.0, 0.7, 0.2], // 18h
        [0.3, 0.35, 0.3, 0.4, 0.45, 0.3, 0.1], // 20h
    ],
    minValue: 0,
    maxValue: 1,
    colorScale: ["#EFF6FF", "#3B82F6", "#1E3A8A"],
};

// ============================================
// Ranking - Lojas e Funcionários
// ============================================

export const mockRankingLojas: RankingItem[] = [
    {
        id: "loja-1",
        position: 1,
        name: "Loja Centro",
        value: 32450.0,
        formattedValue: "R$ 32.450,00",
        percentOfTotal: 37.1,
        trend: "up",
        badge: "gold",
    },
    {
        id: "loja-2",
        position: 2,
        name: "Loja Shopping",
        value: 28900.0,
        formattedValue: "R$ 28.900,00",
        percentOfTotal: 33.0,
        trend: "up",
        badge: "silver",
    },
    {
        id: "loja-3",
        position: 3,
        name: "Loja Bairro Sul",
        value: 15200.0,
        formattedValue: "R$ 15.200,00",
        percentOfTotal: 17.4,
        trend: "stable",
        badge: "bronze",
    },
    {
        id: "loja-4",
        position: 4,
        name: "Loja Norte",
        value: 10900.0,
        formattedValue: "R$ 10.900,00",
        percentOfTotal: 12.5,
        trend: "down",
    },
];

export const mockRankingFuncionarios: RankingItem[] = [
    {
        id: "func-1",
        position: 1,
        name: "Maria Silva",
        value: 156,
        formattedValue: "156 atendimentos",
        percentOfTotal: 22.3,
        trend: "up",
        badge: "gold",
        metadata: { cargo: "Atendente Sênior" },
    },
    {
        id: "func-2",
        position: 2,
        name: "João Santos",
        value: 142,
        formattedValue: "142 atendimentos",
        percentOfTotal: 20.3,
        trend: "up",
        badge: "silver",
        metadata: { cargo: "Atendente" },
    },
    {
        id: "func-3",
        position: 3,
        name: "Ana Costa",
        value: 128,
        formattedValue: "128 atendimentos",
        percentOfTotal: 18.3,
        trend: "stable",
        badge: "bronze",
        metadata: { cargo: "Atendente" },
    },
    {
        id: "func-4",
        position: 4,
        name: "Pedro Oliveira",
        value: 98,
        formattedValue: "98 atendimentos",
        percentOfTotal: 14.0,
        trend: "down",
        metadata: { cargo: "Atendente Jr" },
    },
    {
        id: "func-5",
        position: 5,
        name: "Carla Mendes",
        value: 87,
        formattedValue: "87 atendimentos",
        percentOfTotal: 12.4,
        trend: "up",
        metadata: { cargo: "Atendente Jr" },
    },
    {
        id: "func-6",
        position: 6,
        name: "Lucas Ferreira",
        value: 76,
        formattedValue: "76 atendimentos",
        percentOfTotal: 10.9,
        trend: "stable",
        metadata: { cargo: "Estagiário" },
    },
];

// ============================================
// Filtros padrão
// ============================================

const hoje = new Date();
const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

export const defaultFilters: DashboardFilters = {
    dateRange: {
        start: primeiroDiaMes.toISOString().split('T')[0],
        end: hoje.toISOString().split('T')[0],
    },
    dataInicio: primeiroDiaMes,
    dataFim: hoje,
    lojasSelecionadas: [], // Todas
};
