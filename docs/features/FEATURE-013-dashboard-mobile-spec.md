# Dashboard Gerencial Mobile - Especificação Consolidada

> **Documento Master de Regras de Negócio e Requisitos Mobile**  
> Criado em: 2025-12-24  
> Última atualização: 2025-12-24  
> Status: Onda 1 (🔄 65%) | Onda 2 (🔲 0%)

**Documentos Relacionados:**

- [FEATURE-013 - Dashboard Mobile](./FEATURE-013-dashboard-mobile.md) - Especificação técnica original
- [Backlog de Tarefas Mobile](../specs/FEATURE-013-Dashboard-Mobile-Backlog.md) - Controle de implementação
- [Feature-012 - Dashboard Web](../../../presence-laundry/docs/features/Feature-012-dashboard.md) - Especificação do frontend web

---

## 1. Visão Geral

### 1.1 Objetivo

Disponibilizar o **Dashboard Gerencial do Presence Laundry** em formato mobile (React Native + Expo), permitindo que franqueados e gerentes monitorem a performance da rede diretamente de seus smartphones, com a mesma qualidade de dados do frontend web.

### 1.2 Usuários Impactados

| Perfil          | Acesso             | Necessidade Principal                    |
| --------------- | ------------------ | ---------------------------------------- |
| Franqueado      | Própria(s) loja(s) | Acompanhamento rápido fora do escritório |
| Gerente de Loja | Própria loja       | Verificação de indicadores em campo      |
| Supervisor      | Lojas sob gestão   | Comparativo entre lojas na rua           |

### 1.3 Critérios de Sucesso

- App carrega KPIs em menos de 3 segundos com conexão 4G
- Suporte a iOS e Android
- Paridade de dados com o dashboard web
- Interface otimizada para telas menores (touch-first)
- Suporte a modo claro/escuro

---

## 2. Arquitetura

### 2.1 Stack Tecnológica

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| Framework      | React Native + Expo SDK 54   |
| Linguagem      | TypeScript 5.x (strict mode) |
| Navegação      | React Navigation 6.x         |
| State (Global) | Zustand 4.x                  |
| State (Server) | TanStack Query 5.x           |
| HTTP           | Axios + Basic Auth           |
| Gráficos       | react-native-gifted-charts   |
| Tema           | ThemeProvider customizado    |
| Storage Seguro | expo-secure-store            |

### 2.2 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                 App Mobile (React Native)                    │
│                  presence-laundry-mob                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Screens: KPIsScreen, ChartsScreen, HeatmapScreen,    │    │
│  │          RankingScreen, LoginScreen                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Hooks: useDashboardQueries, useFiltersStore         │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Services: dashboard.service.ts (axios + auth)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST + Basic Auth
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Presence Dashboard API (Delphi + Horse)           │
│                   TSMDashLaundry                             │
└─────────────────────────────────────────────────────────────┘
                            │ FireDAC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Banco Firebird (ERP Laundry)                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Estrutura de Pastas

```
src/
├── features/
│   ├── auth/
│   │   ├── screens/LoginScreen.tsx
│   │   └── stores/useAuthStore.ts
│   └── dashboard/
│       ├── api/dashboard.service.ts
│       ├── components/
│       │   ├── FilterBar.tsx
│       │   └── KPICard.tsx
│       ├── hooks/useDashboardQueries.ts
│       ├── screens/
│       │   ├── KPIsScreen.tsx
│       │   ├── ChartsScreen.tsx
│       │   ├── HeatmapScreen.tsx
│       │   └── RankingScreen.tsx
│       └── stores/useFiltersStore.ts
├── models/
│   └── dashboard.models.ts
├── navigation/
│   ├── RootNavigator.tsx
│   └── DashboardTabs.tsx
└── shared/
    ├── api/axios-client.ts
    ├── components/
    └── theme/
        ├── ThemeProvider.tsx
        └── theme.ts
```

---

## 3. Requisitos Funcionais - Onda 1 (Base Mobile)

### 3.1 Autenticação

| ID    | Requisito                                                 | Status |
| ----- | --------------------------------------------------------- | ------ |
| M-FR1 | Tela de login com usuário e senha                         | ✅     |
| M-FR2 | Autenticação via Basic Auth contra Presence Dashboard API | ✅     |
| M-FR3 | Persistência segura de credenciais (expo-secure-store)    | ✅     |
| M-FR4 | Tratamento de erro 401 com redirect para login            | 🔲     |
| M-FR5 | Configuração de URL do servidor (host/porta)              | ✅     |

### 3.2 Navegação

| ID    | Requisito                                               | Status |
| ----- | ------------------------------------------------------- | ------ |
| M-FR6 | Bottom Tabs com 4 abas (KPIs, Gráficos, Mapas, Ranking) | ✅     |
| M-FR7 | Stack Navigator para fluxo de auth                      | ✅     |
| M-FR8 | Header com título e ações por tela                      | ✅     |
| M-FR9 | Safe Area respeitada em iOS e Android                   | ✅     |

### 3.3 Filtros Globais

| ID     | Requisito                                      | Status |
| ------ | ---------------------------------------------- | ------ |
| M-FR10 | Seleção de loja(s) via picker/modal            | 🔄     |
| M-FR11 | Seleção de período (data início e fim)         | 🔲     |
| M-FR12 | Presets de período (Hoje, Semana, Mês)         | 🔲     |
| M-FR13 | Persistência de filtros na sessão              | 🔲     |
| M-FR14 | FilterBar visível no header ou como barra fixa | 🔄     |

### 3.4 Tela de KPIs

| ID     | Requisito                                         | Status |
| ------ | ------------------------------------------------- | ------ |
| M-FR15 | Card **Faturamento** com valor e variação %       | ✅     |
| M-FR16 | Card **Atendimentos** (tickets/ROLs)              | ✅     |
| M-FR17 | Card **Ticket Médio**                             | ✅     |
| M-FR18 | Card **Peças** com quantidade e peças/atendimento | ✅     |
| M-FR19 | Card **Delivery** com % de tickets delivery       | ✅     |
| M-FR20 | Card **Clientes** (ativos, novos, inativos)       | ✅     |
| M-FR21 | Card **Ranking** com posição na rede              | ✅     |
| M-FR22 | Card **Projeção** do mês                          | ✅     |
| M-FR23 | Semáforos (verde/amarelo/vermelho) nos cards      | 🔲     |
| M-FR24 | Pull-to-refresh para atualizar dados              | ✅     |
| M-FR25 | Skeleton loading enquanto carrega                 | 🔲     |

#### Regras de Cálculo - KPIs Mobile

| Campo                 | Fórmula                                                        |
| --------------------- | -------------------------------------------------------------- |
| Ticket Médio          | `Faturamento / Qtd. ROLs`                                      |
| Peças por Atendimento | `Qtd. Peças / Qtd. ROLs`                                       |
| Preço Médio por Peça  | `Faturamento / Qtd. Peças`                                     |
| % Variação            | `(Atual - Anterior) / Anterior × 100`                          |
| Projeção do Mês       | `(Faturamento atual / Dias úteis passados) × Total dias úteis` |
| Posição no Ranking    | `ORDER BY faturamento DESC, RANK()`                            |

### 3.5 Tela de Gráficos

| ID     | Requisito                                                        | Status |
| ------ | ---------------------------------------------------------------- | ------ |
| M-FR26 | Gráfico de linha **Faturamento Diário**                          | ✅     |
| M-FR27 | Gráfico de barras **Faturamento Mensal** (ano atual vs anterior) | ✅     |
| M-FR28 | Gráfico de barras **Peças por Período**                          | ✅     |
| M-FR29 | Gráfico de pizza **Distribuição por Serviço**                    | 🔲     |
| M-FR30 | Gráfico donut **Evolução de Pagamentos**                         | 🔲     |
| M-FR31 | Gráfico de barras **Pendência de Produção**                      | 🔲     |
| M-FR32 | Tabs internas para alternar entre tipos de gráfico               | ✅     |
| M-FR33 | Scroll horizontal para gráficos longos                           | ✅     |

### 3.6 Tela de Mapas/Heatmap

| ID     | Requisito                                      | Status |
| ------ | ---------------------------------------------- | ------ |
| M-FR34 | Heatmap temporal **Dia × Hora**                | ✅     |
| M-FR35 | Legenda de intensidade de cores                | ✅     |
| M-FR36 | Tooltip ao tocar em célula                     | 🔲     |
| M-FR37 | Mapa geográfico por UF (versão lista ordenada) | 🔲     |
| M-FR38 | Mapa geográfico por UF (versão visual)         | 🔲     |

### 3.7 Tela de Ranking

| ID     | Requisito                                  | Status |
| ------ | ------------------------------------------ | ------ |
| M-FR39 | Lista de lojas ordenadas por faturamento   | ✅     |
| M-FR40 | Header com totais da rede                  | ✅     |
| M-FR41 | Barra de intensidade visual por loja       | ✅     |
| M-FR42 | Tabs para Ranking de Lojas vs Funcionários | ✅     |
| M-FR43 | Destaque visual da loja do usuário         | 🔲     |
| M-FR44 | Pull-to-refresh                            | ✅     |

---

## 4. Requisitos Funcionais - Onda 2 (Evolução Mobile)

### 4.1 Indicadores Adicionais

| ID      | Requisito                                          | Prioridade |
| ------- | -------------------------------------------------- | ---------- |
| M-FR-45 | Card **Comparativo Loja x Média da Rede**          | Alta       |
| M-FR-46 | Card **Taxa de Retenção de Clientes**              | Alta       |
| M-FR-47 | Card **Faturamento por Canal** (Balcão x Delivery) | Média      |
| M-FR-48 | Card **Faturamento vs Recebimentos**               | Alta       |
| M-FR-49 | Gráfico **Evolução Mensal por Grupo de Serviço**   | Média      |
| M-FR-50 | Gráfico **Top 10 Peças mais Faturadas**            | Média      |

### 4.2 Filtros Avançados

| ID      | Requisito                                | Prioridade |
| ------- | ---------------------------------------- | ---------- |
| M-FR-51 | Presets de período com calendário visual | Alta       |
| M-FR-52 | Filtro por categoria de lojas            | Média      |
| M-FR-53 | Multi-seleção de lojas com chips         | Média      |
| M-FR-54 | Histórico de filtros recentes            | Baixa      |

### 4.3 UX/UI Avançados

| ID      | Requisito                               | Prioridade |
| ------- | --------------------------------------- | ---------- |
| M-FR-55 | Animações de transição entre telas      | Baixa      |
| M-FR-56 | Gestos de swipe para navegação          | Baixa      |
| M-FR-57 | Modo offline com cache local            | Média      |
| M-FR-58 | Push notifications para alertas de KPIs | Baixa      |
| M-FR-59 | Widget para home screen (iOS/Android)   | Baixa      |

### 4.4 Indicadores Financeiros

| ID      | Requisito                                 | Dependência        |
| ------- | ----------------------------------------- | ------------------ |
| M-FR-60 | Card **Passivos Financeiros** consolidado | Backend pronto     |
| M-FR-61 | Card **Crédito de Cabides**               | Aguardando decisão |
| M-FR-62 | Card **Saldo Líquido**                    | Aguardando decisão |

---

## 5. Requisitos Não Funcionais

| ID    | Requisito                                       | Status |
| ----- | ----------------------------------------------- | ------ |
| NFR-1 | Tempo de carregamento inicial < 3 segundos (4G) | 🔲     |
| NFR-2 | Suporte a iOS 14+ e Android 10+                 | ✅     |
| NFR-3 | Suporte a modo claro e escuro                   | ✅     |
| NFR-4 | Touch targets mínimos de 44pt                   | 🔲     |
| NFR-5 | Acessibilidade (labels, contraste)              | 🔲     |
| NFR-6 | Cache com TanStack Query (staleTime 30s)        | ✅     |
| NFR-7 | Tratamento de estados: loading, erro, vazio     | 🔄     |
| NFR-8 | Paridade de dados com dashboard web             | ✅     |
| NFR-9 | Persistência de sessão entre fechamentos do app | ✅     |

---

## 6. API - Endpoints Utilizados

### 6.1 Endpoints Implementados no Service Mobile

| Endpoint                                        | Tela     | Status no Service |
| ----------------------------------------------- | -------- | ----------------- |
| `/Lojas`                                        | Filtros  | ✅                |
| `/MetricasConsolidadas/{lojas}/{dtIni}/{dtFim}` | KPIs     | ✅                |
| `/Faturamento/{lojas}/{dtIni}/{dtFim}`          | KPIs     | ✅                |
| `/Tickets/{lojas}/{dtIni}/{dtFim}`              | KPIs     | ✅                |
| `/Pecas/{lojas}/{dtIni}/{dtFim}`                | KPIs     | ✅                |
| `/Clientes/{lojas}/{dtIni}/{dtFim}`             | KPIs     | ✅                |
| `/Delivery/{lojas}/{dtIni}/{dtFim}`             | KPIs     | ✅                |
| `/FaturamentoDiario/{lojas}/{mes}/{ano}`        | Gráficos | ✅                |
| `/FaturamentoMensal/{lojas}/{ano}`              | Gráficos | ✅                |
| `/Crescimento12Meses/{lojas}/{metrica}`         | Gráficos | ✅                |
| `/DistribuicaoServicos/{lojas}/{dtIni}/{dtFim}` | Gráficos | ✅                |
| `/EvolucaoPagamentos/{lojas}/{dtIni}/{dtFim}`   | Gráficos | ✅                |
| `/PendenciaProducao/{lojas}`                    | Gráficos | ✅                |
| `/PrazosEntrega/{lojas}/{dtIni}/{dtFim}`        | Gráficos | ✅                |
| `/MapaTemporal/{lojas}/{dtIni}/{dtFim}`         | Heatmap  | ✅                |
| `/MapaGeografico/{lojas}/{dtIni}/{dtFim}`       | Heatmap  | ✅                |
| `/RankingLojas/{dtIni}/{dtFim}`                 | Ranking  | ✅                |
| `/RankingRede/{loja}/{dtIni}/{dtFim}`           | Ranking  | ✅                |
| `/DiasUteis/{loja}/{ano}/{mes}`                 | KPIs     | ✅                |
| `/PassivosFinanceiros/{lojas}/{dtIni}/{dtFim}`  | KPIs     | ✅                |
| `/ConfigSemaforos/{loja}`                       | Config   | ✅                |

### 6.2 Endpoints Pendentes (Onda 2)

| Endpoint                                       | Tela     | Status |
| ---------------------------------------------- | -------- | ------ |
| `/TaxaRetencao/{lojas}/{dtIni}/{dtFim}`        | KPIs     | 🔲     |
| `/FaturamentoPorCanal/{lojas}/{dtIni}/{dtFim}` | Gráficos | 🔲     |
| `/FaturamentoVsRecebimentos/{lojas}/{ano}`     | Gráficos | 🔲     |
| `/EvolucaoServicosMensal/{lojas}/{ano}`        | Gráficos | 🔲     |
| `/Top10Pecas/{lojas}/{dtIni}/{dtFim}`          | Gráficos | 🔲     |

---

## 7. Componentes Mobile

### 7.1 Componentes Implementados

| Componente     | Descrição                              | Status |
| -------------- | -------------------------------------- | ------ |
| `KPICard`      | Card de métrica com valor e variação   | ✅     |
| `FilterBar`    | Barra de filtros (loja + período)      | 🔄     |
| `HeatmapGrid`  | Grid customizado para heatmap temporal | ✅     |
| `RankingList`  | Lista de ranking com barras            | ✅     |
| `LoadingState` | Componente de loading                  | ✅     |
| `ErrorState`   | Componente de erro com retry           | ✅     |
| `EmptyState`   | Componente de estado vazio             | ✅     |

### 7.2 Componentes Pendentes

| Componente          | Descrição                         | Prioridade |
| ------------------- | --------------------------------- | ---------- |
| `DateRangePicker`   | Seletor de período com calendário | Alta       |
| `LojaPicker`        | Modal de seleção de lojas         | Alta       |
| `PieChart`          | Gráfico de pizza para serviços    | Média      |
| `DonutChart`        | Gráfico donut para pagamentos     | Média      |
| `ComparisonCard`    | Card de comparativo loja vs rede  | Média      |
| `SemaforoIndicator` | Indicador visual de semáforo      | Média      |
| `SkeletonCard`      | Skeleton loading para cards       | Baixa      |

---

## 8. Paleta de Cores (Tema)

### 8.1 Light Mode

```typescript
const lightPalette = {
  background: "#F1F5F9",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  accent: "#2563EB",
  success: "#16A34A",
  warning: "#F97316",
  danger: "#DC2626",
};
```

### 8.2 Dark Mode

```typescript
const darkPalette = {
  background: "#020617",
  surface: "#0B1220",
  card: "#0F172A",
  cardBorder: "#1E293B",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#60A5FA",
  success: "#22C55E",
  warning: "#FB923C",
  danger: "#EF4444",
};
```

### 8.3 Cores dos KPIs

| KPI          | Cor     | Hex       |
| ------------ | ------- | --------- |
| Faturamento  | Verde   | `#10B981` |
| Atendimentos | Azul    | `#3B82F6` |
| Ticket Médio | Amarelo | `#F59E0B` |
| Peças        | Roxo    | `#8B5CF6` |
| Delivery     | Ciano   | `#06B6D4` |
| Clientes     | Rosa    | `#EC4899` |
| Ranking      | Laranja | `#F97316` |
| Projeção     | Índigo  | `#6366F1` |

---

## 9. Semáforos (Thresholds)

### 9.1 Configuração Padrão

| Indicador  | Verde   | Amarelo   | Vermelho |
| ---------- | ------- | --------- | -------- |
| Variação % | ≥ 0%    | -10% a 0% | < -10%   |
| Retenção   | ≥ 80%   | 60% a 79% | < 60%    |
| Ranking    | Top 25% | 25% a 50% | > 50%    |
| Projeção   | ≥ 100%  | 80% a 99% | < 80%    |

### 9.2 Representação Visual

- **Verde**: Borda/badge com cor `success`
- **Amarelo**: Borda/badge com cor `warning`
- **Vermelho**: Borda/badge com cor `danger`
- **Neutro**: Sem borda destacada

---

## 10. Referências

### 10.1 Implementação Web (Fonte de Verdade)

- Dashboard: `presence-laundry/src/pages/dashboard/Dashboard.tsx`
- Componentes: `presence-laundry/src/pages/dashboard/components/`
- API service: `presence-laundry/src/api/dashboard.service.ts`
- Hooks: `presence-laundry/src/hooks/dashboard/`
- Models: `presence-laundry/src/models/dashboard.models.ts`

### 10.2 Backend (Presence Dashboard API)

- Projeto: `presence-dashboard-api`
- Framework: Delphi + Horse
- Controllers: `uMetricasController.pas`, `uGraficosController.pas`, `uRankingController.pas`
- Base URL: `http://{host}:{port}/api/v1`

### 10.3 Design Reference

- Tema: `presence-laundry-mob/src/shared/theme/theme.ts`

---

## Histórico de Revisões

| Data       | Versão | Descrição                               |
| ---------- | ------ | --------------------------------------- |
| 2025-12-24 | 1.0    | Criação do documento consolidado mobile |
