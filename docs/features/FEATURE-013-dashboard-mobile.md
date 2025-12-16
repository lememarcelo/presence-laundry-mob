---
id: FEATURE-013
title: Dashboard Gerencial - App Mobile React Native
status: planned
owner: Presence Laundry Squad
created_at: 2025-12-15
updated_at: 2025-12-15
links:
  - type: source-frontend-web
    path: ../../src/pages/dashboard/Dashboard.tsx
  - type: source-frontend-web
    path: ../../src/api/dashboard.service.ts
  - type: source-frontend-web
    path: ../../src/hooks/dashboard/use-dashboard-queries.ts
  - type: source-frontend-web
    path: ../../src/models/dashboard.models.ts
  - type: source-backend
    path: Presence Remote (DataSnap) - uSMDashLaundry.pas
  - type: reference-style-mobile
    path: ../../../V2A/TrigraMob/mobile/src/shared/theme/theme.ts
  - type: reference-ux
    path: ../../../V2A/TrigraMob/docs/docs/guides/UI-UX-GUIDELINES.md
  - type: spec
    path: ../specs/Proposta de dashboard revisada.md
---

# FEATURE-013 - Dashboard Gerencial Mobile (React Native)

Este documento especifica a criação de um **aplicativo mobile React Native** que apresenta o **Dashboard Gerencial do Presence Laundry** — os mesmos dados do frontend web, otimizados para visualização em dispositivos móveis.

> **Importante:** O app mobile consome os mesmos endpoints do backend **Presence Remote (DataSnap)** via `TSMDashLaundry`. Não há relação com o Presence Usina.

---

## 1. Objetivo e escopo

### 1.1 O que o app deve fazer

- **Login** de usuário com autenticação Basic Auth (mesmo padrão do web).
- **Exibir os mesmos KPIs e gráficos** do dashboard web: faturamento, tickets, delivery, peças, clientes, ranking, projeção.
- **Navegação por Bottom Tabs** separando os tipos de visualização:
  - Tab 1: KPIs (cards principais)
  - Tab 2: Gráficos (evolução, pizza, barras)
  - Tab 3: Mapas (heatmap temporal, mapa geográfico por UF)
  - Tab 4: Ranking (lojas ordenadas por faturamento)
- **Filtros globais**: seleção de loja(s) e período (data início/fim).
- **Visual moderno** com tema claro/escuro, seguindo padrões do Tigra Mob.

### 1.2 Fora de escopo (neste momento)

- Criar novos endpoints no backend.
- Modificar a lógica de cálculo dos KPIs.
- Funcionalidades operacionais (recepção, produção, etc.).

---

## 2. Fonte de dados (contrato com o backend)

O app mobile consome os **mesmos endpoints** do Presence Remote (`TSMDashLaundry`) que o frontend web já usa.

### 2.1 Backend

- **Servidor:** Presence Remote (DataSnap REST)
- **Módulo:** `uSMDashLaundry.pas`
- **Autenticação:** Basic Auth (usuário/senha configurado no app)

### 2.2 Endpoints Disponíveis (TSMDashLaundry)

> **Fonte:** `uSMDashLaundry.pas` no Presence Remote  
> **Base URL:** `http://{host}:{port}/datasnap/rest/TSMDashLaundry`

#### Endpoints Utilizados pelo Mobile

| Tela         | Endpoint                                        | Método | Descrição                                                 |
| ------------ | ----------------------------------------------- | ------ | --------------------------------------------------------- |
| **KPIs**     | `/MetricasConsolidadas/{lojas}/{dtIni}/{dtFim}` | GET    | KPIs consolidados (faturamento, tickets, peças, clientes) |
| **KPIs**     | `/Faturamento/{lojas}/{dtIni}/{dtFim}`          | GET    | Faturamento com variação                                  |
| **KPIs**     | `/Tickets/{lojas}/{dtIni}/{dtFim}`              | GET    | Quantidade de ROLs                                        |
| **KPIs**     | `/Pecas/{lojas}/{dtIni}/{dtFim}`                | GET    | Quantidade de peças                                       |
| **KPIs**     | `/Clientes/{lojas}/{dtIni}/{dtFim}`             | GET    | Métricas de clientes                                      |
| **KPIs**     | `/Delivery/{lojas}/{dtIni}/{dtFim}`             | GET    | Métricas de delivery                                      |
| **Gráficos** | `/FaturamentoDiario/{lojas}/{mes}/{ano}`        | GET    | Faturamento dia a dia do mês                              |
| **Gráficos** | `/FaturamentoMensal/{lojas}/{ano}`              | GET    | Comparativo mensal (ano atual vs anterior)                |
| **Gráficos** | `/Crescimento12Meses/{lojas}/{metrica}`         | GET    | Linha de crescimento 12 meses                             |
| **Gráficos** | `/DistribuicaoServicos/{lojas}/{dtIni}/{dtFim}` | GET    | Pizza por grupo de serviço                                |
| **Gráficos** | `/EvolucaoPagamentos/{lojas}/{dtIni}/{dtFim}`   | GET    | Evolução por modalidade de pagamento                      |
| **Gráficos** | `/PendenciaProducao/{lojas}`                    | GET    | Backlog de produção por atraso                            |
| **Heatmap**  | `/MapaTemporal/{lojas}/{dtIni}/{dtFim}`         | GET    | Matriz dia×hora                                           |
| **Heatmap**  | `/MapaGeografico/{lojas}/{dtIni}/{dtFim}`       | GET    | Faturamento por UF                                        |
| **Ranking**  | `/RankingLojas/{dtIni}/{dtFim}`                 | GET    | Ranking de todas as lojas                                 |
| **Ranking**  | `/RankingRede/{loja}/{dtIni}/{dtFim}`           | GET    | Posição da loja na rede                                   |
| **Auxiliar** | `/Lojas`                                        | GET    | Lista de lojas disponíveis                                |
| **Auxiliar** | `/DiasUteis/{loja}/{ano}/{mes}`                 | GET    | Dias úteis do mês                                         |
| **Config**   | `/ConfigSemaforos/{loja}`                       | GET    | Thresholds dos semáforos                                  |
| **Config**   | `/updateConfigSemaforos`                        | POST   | Salvar thresholds                                         |

#### Parâmetros Comuns

| Parâmetro | Tipo    | Formato        | Exemplo                                 |
| --------- | ------- | -------------- | --------------------------------------- |
| `lojas`   | string  | CSV de códigos | `"01,02,03"` ou `"--todas--"`           |
| `dtIni`   | string  | YYYY-MM-DD     | `"2025-12-01"`                          |
| `dtFim`   | string  | YYYY-MM-DD     | `"2025-12-15"`                          |
| `mes`     | integer | 1-12           | `12`                                    |
| `ano`     | integer | YYYY           | `2025`                                  |
| `metrica` | string  | enum           | `"faturamento"`, `"pecas"`, `"tickets"` |

#### Exemplo de Responses

<details>
<summary><b>MetricasConsolidadas</b></summary>

```json
{
  "faturamento": {
    "atual": { "valor": 87450.0, "valorRede": 1250000.0, "meta": 100000.0 },
    "anterior": { "valor": 82100.0 },
    "anoAnterior": { "valor": 79500.0 },
    "variacao": { "valor": 5350.0, "percentual": 6.52, "direcao": "up" }
  },
  "tickets": {
    "quantidade": 1276,
    "ticketMedio": 68.53,
    "percentualDelivery": 22.5
  },
  "pecas": {
    "quantidade": 12847,
    "pecasPorAtendimento": 10.07,
    "precoMedioPeca": 6.8
  },
  "clientes": {
    "ativos": 845,
    "novos": 67,
    "inativos": 123,
    "total": 2340
  },
  "ranking": {
    "posicao": 3,
    "totalLojas": 45,
    "variacao": "subiu"
  },
  "projecao": {
    "faturamentoProjetado": 145000.0,
    "diasUteis": 22,
    "diasUteisPassados": 14
  }
}
```

</details>

<details>
<summary><b>FaturamentoDiario</b></summary>

```json
{
  "titulo": "Faturamento Diário - Dezembro 2025",
  "mesAtual": {
    "label": "Dez/2025",
    "valores": [4250, 3890, 5120, 4780, 6340, 7890, 8120, ...]
  },
  "mesAnterior": {
    "label": "Dez/2024",
    "valores": [3900, 4100, 4800, 4500, 5800, 7200, 7800, ...]
  },
  "labels": ["01", "02", "03", "04", "05", "06", "07", ...]
}
```

</details>

<details>
<summary><b>FaturamentoMensal</b></summary>

```json
{
  "titulo": "Faturamento Mensal - 2025 vs 2024",
  "anoAtual": {
    "ano": 2025,
    "valores": [
      78500, 72300, 85200, 91400, 88700, 95600, 102300, 98400, 105800, 112500,
      118200, 87450
    ]
  },
  "anoAnterior": {
    "ano": 2024,
    "valores": [
      65000, 68000, 75000, 82000, 79000, 85000, 92000, 88000, 95000, 100000,
      105000, 110000
    ]
  },
  "labels": [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez"
  ]
}
```

</details>

<details>
<summary><b>RankingLojas</b></summary>

```json
{
  "lojas": [
    {
      "posicao": 1,
      "codigo": "05",
      "nome": "Loja Centro",
      "faturamento": 145000.0,
      "percentual": 11.6
    },
    {
      "posicao": 2,
      "codigo": "12",
      "nome": "Loja Shopping",
      "faturamento": 132000.0,
      "percentual": 10.5
    },
    {
      "posicao": 3,
      "codigo": "01",
      "nome": "Loja Matriz",
      "faturamento": 87450.0,
      "percentual": 7.0
    }
  ],
  "totalLojas": 45,
  "totalFaturamento": 1250000.0
}
```

</details>

<details>
<summary><b>MapaTemporal</b></summary>

```json
{
  "titulo": "Movimento por Dia/Hora",
  "diasSemana": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
  "horas": ["08h", "09h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h", "19h", "20h"],
  "valores": [
    [12, 18, 25, 30, 28, 22, 15],
    [15, 22, 32, 38, 35, 28, 18],
    ...
  ],
  "maxValor": 85,
  "minValor": 5
}
```

</details>

### 2.3 Formato de datas

O backend espera datas no formato **ISO8601**: `YYYY-MM-DD`

```typescript
function formatDateDelphi(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

### 2.4 Autenticação

Todas as requisições devem incluir header de Basic Auth:

```typescript
const authConfig = {
  auth: {
    username: config.user,
    password: config.password,
  },
};
```

---

## 3. Arquitetura do app (React Native)

### 3.1 Stack técnica recomendada

| Tecnologia                               | Versão  | Propósito                           |
| ---------------------------------------- | ------- | ----------------------------------- |
| React Native                             | 0.73+   | Framework mobile                    |
| Expo                                     | SDK 50+ | Tooling e builds                    |
| TypeScript                               | 5+      | Type safety                         |
| React Navigation                         | 6+      | Navegação (bottom tabs + stack)     |
| TanStack Query                           | 5+      | Server state / cache                |
| Zustand                                  | 4+      | State management (filtros, sessão)  |
| Axios                                    | 1+      | HTTP client                         |
| expo-secure-store                        | —       | Armazenamento seguro de credenciais |
| react-native-chart-kit ou Victory Native | —       | Gráficos                            |

### 3.2 Organização de pastas

```text
src/
  app/
    navigation/
      RootNavigator.tsx
      AuthStack.tsx
      MainTabs.tsx
    AppContainer.tsx
    AppProviders.tsx
  features/
    auth/
      screens/LoginScreen.tsx
      api/auth.service.ts
      stores/session.store.ts
    dashboard/
      screens/
        KpisScreen.tsx
        ChartsScreen.tsx
        HeatmapScreen.tsx
        RankingScreen.tsx
      components/
        KpiCard.tsx
        ChartWrapper.tsx
        FilterBar.tsx
      api/dashboard.service.ts
      hooks/use-dashboard-queries.ts
      stores/filters.store.ts
  shared/
    api/axiosClient.ts
    theme/
      ThemeProvider.tsx
      theme.ts
    components/
      Card.tsx
      LoadingState.tsx
      ErrorState.tsx
      EmptyState.tsx
  models/
    dashboard.models.ts
```

### 3.3 Tema (visual moderno)

**Reaproveitar o padrão do Tigra Mob:**

- Tokens: `TrigraMob/mobile/src/shared/theme/theme.ts`
- Provider: `TrigraMob/mobile/src/shared/theme/ThemeProvider.tsx`

**Paleta sugerida:**

```typescript
const lightPalette = {
  background: "#F1F5F9",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#2563EB",
  success: "#16a34a",
  warning: "#f97316",
  danger: "#dc2626",
};

const darkPalette = {
  background: "#020617",
  surface: "#0B1220",
  card: "#0F172A",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#60A5FA",
  // ...
};
```

---

## 4. Navegação (Login + Bottom Tabs)

### 4.1 Estrutura de navegadores

```
RootNavigator
├── AuthStack (sem sessão)
│   └── LoginScreen
└── MainTabs (com sessão)
    ├── Tab 1: KpisStack
    │   └── KpisScreen
    ├── Tab 2: ChartsStack
    │   ├── ChartsScreen
    │   └── ChartDetailScreen (futuro)
    ├── Tab 3: MapsStack
    │   └── HeatmapScreen
    └── Tab 4: RankingStack
        └── RankingScreen
```

### 4.2 Ícones sugeridos para tabs

| Tab      | Ícone          | Label       |
| -------- | -------------- | ----------- |
| KPIs     | 📊 chart-bar   | Indicadores |
| Gráficos | 📈 trending-up | Evolução    |
| Mapas    | 🗺️ map         | Mapas       |
| Ranking  | 🏆 trophy      | Ranking     |

### 4.3 Regras de acesso

- **Sem credenciais salvas:** Exibe `LoginScreen`
- **Com credenciais:** Faz requisição de teste para validar → sucesso: `MainTabs`, falha: limpa e volta para `LoginScreen`

---

## 5. Telas e componentes

### 5.1 LoginScreen

**Layout:**

- Logo Presence Laundry
- Campo usuário
- Campo senha (com toggle de visibilidade)
- Botão "Entrar"
- Feedback de erro inline
- Loading state no botão

**Validações:**

- Campos obrigatórios
- Ao submeter: tenta chamada `GET /TSMDashLaundry/Lojas` com Basic Auth
  - Sucesso: salva credenciais (secure store), navega para MainTabs
  - Erro: exibe mensagem

---

### 5.2 Tab 1 — KPIs (`KpisScreen`)

**Componentes de filtro (header ou barra superior):**

- Seletor de loja (picker/modal com lista)
- Seletor de período (data início e fim)
- Botão refresh

**KPI Cards a exibir:**

| Card           | Valor principal                           | Subtítulo               | Variação              | Semáforo |
| -------------- | ----------------------------------------- | ----------------------- | --------------------- | -------- |
| Faturamento    | `formatCurrency(faturamento.atual.valor)` | Meta: R$ X              | % vs período anterior | Sim      |
| Tickets (ROLs) | `quantidade`                              | Ticket médio: R$ X      | % vs anterior         | Sim      |
| Delivery       | `percentualDelivery%`                     | dos tickets com entrega | pp vs anterior        | Sim      |
| Peças          | `quantidade`                              | X peças/atend.          | % vs anterior         | Sim      |
| Clientes       | `ativos`                                  | X novos este mês        | —                     | —        |
| Ranking        | `#posição` de N lojas                     | —                       | subiu/desceu/manteve  | —        |
| Projeção       | Projetado: R$ X                           | Meta: R$ X              | % da meta             | —        |

**Fonte:** `GET /TSMDashLaundry/MetricasConsolidadas/{lojas}/{dtIni}/{dtFim}`

**Estados:**

- Loading: skeleton cards
- Erro: mensagem com botão "Tentar novamente"
- Vazio: mensagem informativa

---

### 5.3 Tab 2 — Gráficos (`ChartsScreen`)

**Gráficos a implementar (ScrollView vertical):**

1. **Crescimento 12 meses** (linha)

   - Fonte: `/Crescimento12Meses/{lojas}/faturamento`
   - Ano atual vs anterior

2. **Faturamento diário** (barras)

   - Fonte: `/FaturamentoDiario/{lojas}/{mes}/{ano}`
   - Mês atual, dia a dia

3. **Faturamento mensal** (barras agrupadas)

   - Fonte: `/FaturamentoMensal/{lojas}/{ano}`
   - Jan–Dez, ano atual vs anterior

4. **Distribuição por serviço** (pizza/donut)

   - Fonte: `/DistribuicaoServicos/{lojas}/{dtIni}/{dtFim}`

5. **Evolução de pagamentos** (donut ou stacked bar)

   - Fonte: `/EvolucaoPagamentos/{lojas}/{dtIni}/{dtFim}`

6. **Pendência de produção** (barras horizontais)

   - Fonte: `/PendenciaProducao/{lojas}`
   - Cores por faixa de atraso

7. **Prazos de entrega** (barras)
   - Fonte: `/PrazosEntrega/{lojas}/{dtIni}/{dtFim}`

**Bibliotecas sugeridas:**

- `react-native-chart-kit` (simples)
- `victory-native` (mais customizável)
- `react-native-gifted-charts` (moderno)

---

### 5.4 Tab 3 — Mapas (`HeatmapScreen`)

**Visualizações:**

1. **Heatmap Temporal** (dia da semana × hora)

   - Fonte: `/MapaTemporal/{lojas}/{dtIni}/{dtFim}`
   - Grid 7×24 com intensidade de cor
   - Útil para identificar picos de demanda

2. **Mapa Geográfico** (por UF)
   - Fonte: `/MapaGeografico/{lojas}/{dtIni}/{dtFim}`
   - Opções de implementação:
     - **Simples:** Lista de UFs ordenada por faturamento com barra de intensidade
     - **Completa:** Mapa do Brasil com estados coloridos por intensidade
   - Se mapa real: considerar `react-native-maps` + SVG ou biblioteca de mapas coroplético

---

### 5.5 Tab 4 — Ranking (`RankingScreen`)

**Fonte:** `GET /TSMDashLaundry/RankingLojas/{dtIni}/{dtFim}`

**Layout:**

- Header com totais:
  - Total de lojas
  - Faturamento total da rede
- Lista ordenada por faturamento:
  - Posição (#1, #2, ...)
  - Nome/código da loja
  - Faturamento (R$)
  - Percentual do total
  - Barra de intensidade visual

**Interações:**

- Pull-to-refresh
- Tap em loja: futuro drill-down para detalhes

---

## 6. Contratos de dados (tipos TypeScript)

Copiar/compartilhar os tipos de `presence-laundry/src/models/dashboard.models.ts`.

### 6.1 Principais interfaces

```typescript
// KPIs consolidados
export interface DashboardKPIs {
  faturamento: ComparativoTemporal<MetricaFaturamento>;
  tickets: ComparativoTemporal<MetricaTickets>;
  pecas: ComparativoTemporal<MetricaPecas>;
  clientes: MetricaClientes;
  ranking: MetricaRanking;
  projecao: MetricaProjecao;
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
  valorAtual: number;
  valorProjetado: number;
  meta: number;
  diasUteisPassados: number;
  diasUteisTotais: number;
  percentualMeta: number;
}
```

### 6.2 Gráficos

```typescript
export interface DadosGraficoLinha {
  titulo: string;
  metrica: "faturamento" | "pecas" | "tickets";
  pontos: Array<{ label: string; valor: number; valorComparativo?: number }>;
}

export interface DadosGraficoPizza {
  titulo: string;
  segmentos: Array<{
    grupo: string;
    valor: number;
    percentual: number;
    cor: string;
  }>;
  total: number;
}

export interface DadosHeatmapTemporal {
  celulas: Array<{
    dia: number;
    hora: number;
    valor: number;
    intensidade: number;
  }>;
  maxValor: number;
  minValor: number;
}

export interface DadosRankingLojas {
  lojas: Array<{
    posicao: number;
    codigo: string;
    nome: string;
    faturamento: number;
    percentual: number;
    intensidade: number;
  }>;
  totalLojas: number;
  totalFaturamento: number;
}
```

---

## 7. Data layer (hooks e cache)

### 7.1 Store de filtros (Zustand)

```typescript
interface DashboardFiltersState {
  lojasSelecionadas: string[];
  dataInicio: Date;
  dataFim: Date;
  lojas: Loja[];
  setLojasSelecionadas: (lojas: string[]) => void;
  setDataInicio: (date: Date) => void;
  setDataFim: (date: Date) => void;
  setLojas: (lojas: Loja[]) => void;
}
```

### 7.2 Hooks com TanStack Query

```typescript
// Query keys
const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  lojas: () => [...dashboardQueryKeys.all, "lojas"] as const,
  kpis: (lojas: string[], dtIni: Date, dtFim: Date) =>
    [...dashboardQueryKeys.all, "kpis", { lojas, dtIni, dtFim }] as const,
  crescimento: (lojas: string[], metrica: string) =>
    [...dashboardQueryKeys.all, "crescimento", { lojas, metrica }] as const,
  // ... outros
};

// Hooks
export function useDashboardKPIs() {
  const { lojasSelecionadas, dataInicio, dataFim } = useDashboardFiltersStore();
  return useQuery({
    queryKey: dashboardQueryKeys.kpis(lojasSelecionadas, dataInicio, dataFim),
    queryFn: () =>
      getMetricasConsolidadas(lojasSelecionadas, dataInicio, dataFim),
    staleTime: 30 * 1000, // 30s
  });
}
```

### 7.3 Cache e refresh

- `staleTime`: 30s (dados mudam com frequência média)
- `gcTime`: 5 min
- Pull-to-refresh: `refetch()` manual
- Invalidar ao mudar filtros: TanStack Query faz automaticamente via query key

---

## 8. Semáforos (status visual)

Os KPIs usam sistema de semáforo (verde/amarelo/vermelho) baseado em thresholds configuráveis.

### 8.1 Lógica

```typescript
type StatusSemaforo = "success" | "warning" | "danger" | "neutral";

function getStatus(
  kpi: string,
  valor: number,
  referencia: number
): StatusSemaforo {
  const percentual = (valor / referencia) * 100;
  const thresholds = getThresholdsForKpi(kpi);

  if (percentual >= thresholds.verde) return "success";
  if (percentual >= thresholds.amarelo) return "warning";
  return "danger";
}
```

### 8.2 Representação visual

- Verde: borda/fundo com cor `success`
- Amarelo: borda/fundo com cor `warning`
- Vermelho: borda/fundo com cor `danger`

---

## 9. Checklist de implementação

### 9.1 Infraestrutura ✅

- [x] Setup projeto Expo/React Native (SDK 54)
- [x] Configurar TypeScript (5.9+)
- [x] Configurar React Navigation (bottom tabs + stacks)
- [x] Implementar ThemeProvider (light/dark)
- [x] Configurar Axios com Basic Auth
- [x] Configurar TanStack Query
- [x] Implementar store de sessão (Zustand)
- [x] Implementar store de filtros

### 9.2 Autenticação ✅

- [x] Tela de login com campos usuário/senha
- [x] Validação e feedback de erro
- [x] Persistência de credenciais (baseUrl configurável)
- [x] Interceptor HTTP com auth
- [ ] Tratamento de erro 401 (TODO: redirect para login)

### 9.3 Dashboard - Telas ✅

- [x] KpisScreen com cards (6 KPIs)
- [x] Componente KpiCard reutilizável
- [ ] FilterBar (loja + período) — TODO
- [x] ChartsScreen com gráficos (3 tabs)
- [x] HeatmapScreen (temporal com grid)
- [x] RankingScreen (lojas + funcionários)
- [x] Pull-to-refresh em todas as telas
- [x] Estados de loading/erro/vazio (estrutura)

### 9.4 Gráficos ✅ (usando react-native-gifted-charts)

- [x] Gráfico de linha (faturamento diário)
- [x] Gráfico de barras (faturamento mensal, peças)
- [ ] Gráfico de pizza (serviços) — TODO
- [ ] Gráfico donut (pagamentos) — TODO
- [x] Heatmap temporal (grid customizado)
- [ ] Mapa por UF — TODO (versão lista)

### 9.5 Integração com API Real ✅ (SERVICE IMPLEMENTADO)

- [x] Atualizar `dashboard.service.ts` com endpoints reais
- [x] Mapear responses do TSMDashLaundry para tipos locais
- [x] Criar hooks TanStack Query para cada endpoint
- [ ] Implementar fallback para mock data em dev
- [ ] Testar conexão com Presence Remote real
- [ ] Conectar telas aos hooks (substituir mock data)

#### Endpoints implementados no service:

| Endpoint                 | Tela     | Service                    | Hook                       |
| ------------------------ | -------- | -------------------------- | -------------------------- |
| `/Lojas`                 | Filtros  | ✅ getLojas                | ✅ useLojas                |
| `/MetricasConsolidadas`  | KPIs     | ✅ getMetricasConsolidadas | ✅ useMetricasConsolidadas |
| `/FaturamentoDiario`     | Gráficos | ✅ getFaturamentoDiario    | ✅ useFaturamentoDiario    |
| `/FaturamentoMensal`     | Gráficos | ✅ getFaturamentoMensal    | ✅ useFaturamentoMensal    |
| `/Crescimento12Meses`    | Gráficos | ✅ getCrescimento12Meses   | ✅ useCrescimento12Meses   |
| `/DistribuicaoServicos`  | Gráficos | ✅ getDistribuicaoServicos | ✅ useDistribuicaoServicos |
| `/EvolucaoPagamentos`    | Gráficos | ✅ getEvolucaoPagamentos   | ✅ useEvolucaoPagamentos   |
| `/PendenciaProducao`     | Gráficos | ✅ getPendenciaProducao    | ✅ usePendenciaProducao    |
| `/MapaTemporal`          | Heatmap  | ✅ getMapaTemporal         | ✅ useMapaTemporal         |
| `/MapaGeografico`        | Heatmap  | ✅ getMapaGeografico       | ✅ useMapaGeografico       |
| `/RankingLojas`          | Ranking  | ✅ getRankingLojas         | ✅ useRankingLojas         |
| `/RankingRede`           | Ranking  | ✅ getRankingRede          | ✅ useRankingRede          |
| `/DiasUteis`             | KPIs     | ✅ getDiasUteis            | ✅ useDiasUteis            |
| `/PassivosFinanceiros`   | KPIs     | ✅ getPassivosFinanceiros  | ✅ usePassivosFinanceiros  |
| `/PrazosEntrega`         | Gráficos | ✅ getPrazosEntrega        | ✅ usePrazosEntrega        |
| `/ConfigSemaforos`       | Config   | ✅ getConfigSemaforos      | ✅ useConfigSemaforos      |
| `/updateConfigSemaforos` | Config   | ✅ saveConfigSemaforos     | — (mutação)                |

---

## 10. Referências

### 10.1 Implementação web (fonte de verdade)

- Dashboard: [src/pages/dashboard/Dashboard.tsx](../../src/pages/dashboard/Dashboard.tsx)
- Componentes: [src/pages/dashboard/components/](../../src/pages/dashboard/components/)
- API service: [src/api/dashboard.service.ts](../../src/api/dashboard.service.ts)
- Hooks: [src/hooks/dashboard/](../../src/hooks/dashboard/)
- Models: [src/models/dashboard.models.ts](../../src/models/dashboard.models.ts)

### 10.2 Design reference (Tigra Mob)

- Tema: `TrigraMob/mobile/src/shared/theme/theme.ts`
- ThemeProvider: `TrigraMob/mobile/src/shared/theme/ThemeProvider.tsx`
- UI Guidelines: `TrigraMob/docs/docs/guides/UI-UX-GUIDELINES.md`
- Design System: `TrigraMob/docs/docs/guides/DESIGN-SYSTEM.md`

### 10.3 Spec original

- [Proposta de dashboard revisada.md](../specs/Proposta%20de%20dashboard%20revisada.md)
