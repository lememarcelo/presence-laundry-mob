# Dashboard Gerencial Mobile - Backlog de Tarefas

> **Documento de Controle de Implementação Mobile**  
> Última atualização: 2025-12-24  
> Regras de negócio: [FEATURE-013-dashboard-mobile-spec.md](../features/FEATURE-013-dashboard-mobile-spec.md)

---

## Resumo Executivo

| Onda       | Descrição                | Progresso          |
| ---------- | ------------------------ | ------------------ |
| **Onda 1** | Dashboard Base Mobile    | 🔄 **29/44** (66%) |
| **Onda 2** | Indicadores Estratégicos | 🔲 **0/22** (0%)   |

---

## Legenda

| Símbolo | Status                     |
| ------- | -------------------------- |
| ✅      | Concluído                  |
| 🔄      | Em Progresso               |
| 🔲      | Pendente                   |
| ⚠️      | Bloqueado                  |
| ⏸️      | Pausado (decisão pendente) |

---

# ONDA 1 — Dashboard Base Mobile 🔄

> **Status:** 66% concluído. Estrutura base funcional, pendente refinamentos de UX e alguns gráficos.

## Fase 1A — Infraestrutura ✅ (8/8)

| ID       | Tarefa                                        | Status |
| -------- | --------------------------------------------- | ------ |
| M1-A-001 | Setup projeto Expo SDK 54 + TypeScript        | ✅     |
| M1-A-002 | Configurar React Navigation (tabs + stacks)   | ✅     |
| M1-A-003 | Implementar ThemeProvider (light/dark)        | ✅     |
| M1-A-004 | Configurar Axios com Basic Auth               | ✅     |
| M1-A-005 | Configurar TanStack Query                     | ✅     |
| M1-A-006 | Implementar store de sessão (Zustand)         | ✅     |
| M1-A-007 | Implementar store de filtros                  | ✅     |
| M1-A-008 | Configurar expo-secure-store para credenciais | ✅     |

## Fase 1B — Autenticação ✅ (4/5)

| ID       | Tarefa                                     | Status |
| -------- | ------------------------------------------ | ------ |
| M1-B-001 | Tela de login com campos usuário/senha     | ✅     |
| M1-B-002 | Validação de formulário                    | ✅     |
| M1-B-003 | Persistência de credenciais (secure store) | ✅     |
| M1-B-004 | Interceptor HTTP com auth                  | ✅     |
| M1-B-005 | Tratamento de erro 401 → redirect login    | 🔲     |

## Fase 1C — Tela de KPIs 🔄 (8/10)

| ID       | Tarefa                          | Status |
| -------- | ------------------------------- | ------ |
| M1-C-001 | Componente KPICard reutilizável | ✅     |
| M1-C-002 | Card Faturamento                | ✅     |
| M1-C-003 | Card Atendimentos (tickets)     | ✅     |
| M1-C-004 | Card Ticket Médio               | ✅     |
| M1-C-005 | Card Peças                      | ✅     |
| M1-C-006 | Card Delivery                   | ✅     |
| M1-C-007 | Card Clientes                   | ✅     |
| M1-C-008 | Card Ranking + Projeção         | ✅     |
| M1-C-009 | Semáforos visuais nos cards     | 🔲     |
| M1-C-010 | Skeleton loading nos cards      | 🔲     |

## Fase 1D — Tela de Gráficos 🔄 (4/7)

| ID       | Tarefa                                     | Status |
| -------- | ------------------------------------------ | ------ |
| M1-D-001 | Gráfico linha Faturamento Diário           | ✅     |
| M1-D-002 | Gráfico barras Faturamento Mensal          | ✅     |
| M1-D-003 | Gráfico barras Peças por Período           | ✅     |
| M1-D-004 | Tabs internas (Faturamento/Peças/Clientes) | ✅     |
| M1-D-005 | Gráfico pizza Distribuição por Serviço     | 🔲     |
| M1-D-006 | Gráfico donut Evolução de Pagamentos       | 🔲     |
| M1-D-007 | Gráfico barras Pendência de Produção       | 🔲     |

## Fase 1E — Tela de Mapas/Heatmap 🔄 (2/4)

| ID       | Tarefa                                  | Status |
| -------- | --------------------------------------- | ------ |
| M1-E-001 | Heatmap Temporal (grid dia × hora)      | ✅     |
| M1-E-002 | Legenda de intensidade                  | ✅     |
| M1-E-003 | Tooltip ao tocar em célula              | 🔲     |
| M1-E-004 | Mapa Geográfico por UF (lista ordenada) | 🔲     |

## Fase 1F — Tela de Ranking ✅ (5/6)

| ID       | Tarefa                                   | Status |
| -------- | ---------------------------------------- | ------ |
| M1-F-001 | Lista de lojas ordenadas por faturamento | ✅     |
| M1-F-002 | Header com totais da rede                | ✅     |
| M1-F-003 | Barra de intensidade visual por loja     | ✅     |
| M1-F-004 | Tabs Lojas vs Funcionários               | ✅     |
| M1-F-005 | Pull-to-refresh                          | ✅     |
| M1-F-006 | Destaque visual da loja do usuário       | 🔲     |

## Fase 1G — Filtros Globais 🔲 (1/4)

| ID       | Tarefa                                 | Status |
| -------- | -------------------------------------- | ------ |
| M1-G-001 | Componente FilterBar no header         | 🔄     |
| M1-G-002 | Modal/Picker de seleção de lojas       | 🔲     |
| M1-G-003 | DateRangePicker para período           | 🔲     |
| M1-G-004 | Presets de período (Hoje, Semana, Mês) | 🔲     |

## Fase 1H — Estados e UX 🔄 (3/6)

| ID       | Tarefa                             | Status |
| -------- | ---------------------------------- | ------ |
| M1-H-001 | Componente LoadingState            | ✅     |
| M1-H-002 | Componente ErrorState com retry    | ✅     |
| M1-H-003 | Componente EmptyState              | ✅     |
| M1-H-004 | Pull-to-refresh em todas as telas  | ✅     |
| M1-H-005 | Touch targets mínimos 44pt         | 🔲     |
| M1-H-006 | Acessibilidade (labels, contraste) | 🔲     |

---

# ONDA 2 — Indicadores Estratégicos 🔲

## Fase 2A — Indicadores Adicionais 🔲 (0/6)

| ID       | Tarefa                                         | Prioridade | Status |
| -------- | ---------------------------------------------- | ---------- | ------ |
| M2-A-001 | Card Comparativo Loja x Média da Rede          | Alta       | 🔲     |
| M2-A-002 | Card Taxa de Retenção de Clientes              | Alta       | 🔲     |
| M2-A-003 | Card Faturamento por Canal (Balcão x Delivery) | Média      | 🔲     |
| M2-A-004 | Gráfico Faturamento vs Recebimentos            | Alta       | 🔲     |
| M2-A-005 | Gráfico Evolução Mensal por Grupo de Serviço   | Média      | 🔲     |
| M2-A-006 | Gráfico Top 10 Peças mais Faturadas            | Média      | 🔲     |

## Fase 2B — Filtros Avançados 🔲 (0/4)

| ID       | Tarefa                                    | Prioridade | Status |
| -------- | ----------------------------------------- | ---------- | ------ |
| M2-B-001 | Calendário visual para seleção de período | Alta       | 🔲     |
| M2-B-002 | Filtro por categoria de lojas             | Média      | 🔲     |
| M2-B-003 | Multi-seleção de lojas com chips          | Média      | 🔲     |
| M2-B-004 | Histórico de filtros recentes             | Baixa      | 🔲     |

## Fase 2C — UX/UI Avançados 🔲 (0/5)

| ID       | Tarefa                                | Prioridade | Status |
| -------- | ------------------------------------- | ---------- | ------ |
| M2-C-001 | Animações de transição entre telas    | Baixa      | 🔲     |
| M2-C-002 | Gestos de swipe para navegação        | Baixa      | 🔲     |
| M2-C-003 | Modo offline com cache local          | Média      | 🔲     |
| M2-C-004 | Push notifications para alertas       | Baixa      | 🔲     |
| M2-C-005 | Widget para home screen (iOS/Android) | Baixa      | 🔲     |

## Fase 2D — Indicadores Financeiros ⚠️ BLOQUEADO (0/3)

> Aguardando validação de dados de custo no ERP

| ID       | Tarefa                                | Dependência         | Status |
| -------- | ------------------------------------- | ------------------- | ------ |
| M2-D-001 | Card Passivos Financeiros consolidado | Backend pronto      | 🔲     |
| M2-D-002 | Card Crédito de Cabides               | Decisão de negócio  | ⏸️     |
| M2-D-003 | Card Saldo Líquido                    | M2-D-001 + M2-D-002 | ⏸️     |

## Fase 2E — Integração Completa 🔲 (0/4)

| ID       | Tarefa                                  | Status |
| -------- | --------------------------------------- | ------ |
| M2-E-001 | Conectar todas as telas a dados reais   | 🔲     |
| M2-E-002 | Remover mock data                       | 🔲     |
| M2-E-003 | Testar com Presence Remote em produção  | 🔲     |
| M2-E-004 | Validação de paridade com dashboard web | 🔲     |

---

# PRIORIZAÇÃO

## 🔴 Alta Prioridade (Próximos Sprints)

| ID       | Descrição                           | Razão               |
| -------- | ----------------------------------- | ------------------- |
| M1-G-002 | Modal de seleção de lojas           | Funcionalidade core |
| M1-G-003 | DateRangePicker para período        | Funcionalidade core |
| M1-B-005 | Tratamento de erro 401              | Segurança/UX        |
| M1-D-005 | Gráfico pizza Distribuição Serviços | Paridade com web    |
| M1-E-004 | Mapa Geográfico por UF              | Paridade com web    |

## 🟡 Média Prioridade

| ID       | Descrição                     |
| -------- | ----------------------------- |
| M1-C-009 | Semáforos visuais nos cards   |
| M1-C-010 | Skeleton loading nos cards    |
| M1-D-006 | Gráfico donut Pagamentos      |
| M1-D-007 | Gráfico Pendência de Produção |
| M1-F-006 | Destaque da loja do usuário   |

## 🟢 Baixa Prioridade

| ID       | Descrição             |
| -------- | --------------------- |
| M1-H-005 | Touch targets mínimos |
| M1-H-006 | Acessibilidade        |
| M1-E-003 | Tooltip no heatmap    |

## ❓ Aguardando Decisão

| ID       | Questão                                  |
| -------- | ---------------------------------------- |
| M2-D-002 | Dados de crédito de cabides disponíveis? |
| M2-D-003 | Fórmula de saldo líquido validada?       |
| M2-C-004 | Push notifications necessárias para MVP? |

---

# DEPENDÊNCIAS ENTRE ONDAS

```
┌─────────────────────────────────────────────────────────────┐
│                     ONDA 1 (Base)                           │
│                                                             │
│  M1-A (Infra)  ──▶  M1-B (Auth)  ──▶  M1-G (Filtros)       │
│       │                                    │                │
│       ▼                                    ▼                │
│  M1-C (KPIs)  ◀─────────────────────────────               │
│       │                                                     │
│       ├──▶  M1-D (Gráficos)                                │
│       ├──▶  M1-E (Heatmap)                                 │
│       └──▶  M1-F (Ranking)                                 │
│                     │                                       │
│                     ▼                                       │
│              M1-H (Estados/UX)                              │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    ONDA 2 (Evolução)                        │
│                                                             │
│  M2-A (Indicadores)  ◀── M2-B (Filtros Avançados)          │
│       │                                                     │
│       ├──▶  M2-C (UX Avançado)                             │
│       └──▶  M2-D (Financeiros) ⚠️ Bloqueado                │
│                     │                                       │
│                     ▼                                       │
│              M2-E (Integração Final)                        │
└─────────────────────────────────────────────────────────────┘
```

---

# COMPONENTES PENDENTES

## Componentes de UI

| Componente           | Descrição                         | Prioridade | Tarefa Relacionada |
| -------------------- | --------------------------------- | ---------- | ------------------ |
| `DateRangePicker`    | Seletor de período com calendário | Alta       | M1-G-003           |
| `LojaPicker`         | Modal de seleção de lojas         | Alta       | M1-G-002           |
| `PieChart`           | Gráfico de pizza para serviços    | Média      | M1-D-005           |
| `DonutChart`         | Gráfico donut para pagamentos     | Média      | M1-D-006           |
| `ComparisonCard`     | Card comparativo loja vs rede     | Média      | M2-A-001           |
| `SemaforoIndicator`  | Indicador visual de semáforo      | Média      | M1-C-009           |
| `SkeletonCard`       | Skeleton loading para cards       | Baixa      | M1-C-010           |
| `BarChartHorizontal` | Barras horizontais (produção)     | Média      | M1-D-007           |

## Hooks Pendentes

| Hook                           | Endpoint                     | Tarefa Relacionada |
| ------------------------------ | ---------------------------- | ------------------ |
| `useTaxaRetencao`              | `/TaxaRetencao`              | M2-A-002           |
| `useFaturamentoPorCanal`       | `/FaturamentoPorCanal`       | M2-A-003           |
| `useFaturamentoVsRecebimentos` | `/FaturamentoVsRecebimentos` | M2-A-004           |
| `useEvolucaoServicosMensal`    | `/EvolucaoServicosMensal`    | M2-A-005           |
| `useTop10Pecas`                | `/Top10Pecas`                | M2-A-006           |

---

# TESTES PENDENTES

| Área          | Tipo de Teste           | Status |
| ------------- | ----------------------- | ------ |
| Auth          | Teste de fluxo de login | 🔲     |
| KPIsScreen    | Teste de renderização   | 🔲     |
| ChartsScreen  | Teste de gráficos       | 🔲     |
| HeatmapScreen | Teste de grid           | 🔲     |
| RankingScreen | Teste de lista          | 🔲     |
| Hooks         | Testes unitários        | 🔲     |
| Services      | Testes de integração    | 🔲     |
| E2E           | Fluxo completo          | 🔲     |

---

# HISTÓRICO

| Data       | Mudança                                       |
| ---------- | --------------------------------------------- |
| 2025-12-15 | Criação do FEATURE-013 original               |
| 2025-12-24 | Criação deste backlog consolidado             |
| 2025-12-24 | Inventário de tarefas concluídas vs pendentes |
| 2025-12-24 | Definição de prioridades e dependências       |
