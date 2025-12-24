# Dashboard Mobile - Backlog de Implementação

> Controle de tarefas para implementação do Dashboard Mobile  
> Criado em: 2025-12-24  
> Última atualização: 2025-12-24

**Especificação Master:** [FEATURE-013-dashboard-mobile-spec.md](./FEATURE-013-dashboard-mobile-spec.md)

---

## Legenda de Status

- ✅ Concluído
- 🔄 Em andamento
- 🔲 Pendente
- ⏸️ Bloqueado/Aguardando

---

## Milestone 1: Filtros Globais (M1-G)

| ID       | Tarefa                                           | Status | Responsável | Notas                                        |
| -------- | ------------------------------------------------ | ------ | ----------- | -------------------------------------------- |
| M1-G-001 | Criar store de filtros com Zustand               | ✅     | AI          | `useFiltersStore.ts` com persistência        |
| M1-G-002 | Implementar LojaPicker (modal de seleção)        | ✅     | AI          | `LojaPicker.tsx` - multi-select com busca    |
| M1-G-003 | Implementar DateRangePicker (seletor de período) | ✅     | AI          | `DateRangePicker.tsx` - calendário nativo    |
| M1-G-004 | Implementar PeriodPresets (Hoje, Semana, Mês)    | ✅     | AI          | `PeriodPresets.tsx` + `PeriodPresetsInline`  |
| M1-G-005 | Integrar componentes no FilterBar                | ✅     | AI          | `FilterBarNew.tsx` integra todos componentes |
| M1-G-006 | Persistir filtros com AsyncStorage               | ✅     | AI          | Via zustand/middleware persist               |
| M1-G-007 | Substituir FilterBar antigo pelo novo            | ✅     | AI          | FilterBarNew integrado em todas screens      |
| M1-G-008 | Testar comportamento de filtros entre telas      | ✅     | AI          | Filtros globais Zustand - validado           |

**Progresso M1-G:** 8/8 (100%)

---

## Milestone 2: Melhorias de KPIs (M2-K)

| ID       | Tarefa                                    | Status | Responsável | Notas                                  |
| -------- | ----------------------------------------- | ------ | ----------- | -------------------------------------- |
| M2-K-001 | Implementar semáforos nos cards de KPI    | ✅     | AI          | `SemaforoIndicator.tsx` com pulse anim |
| M2-K-002 | Criar componente SkeletonCard             | ✅     | AI          | `SkeletonCard.tsx` com variantes       |
| M2-K-003 | Adicionar tooltip/detail ao tocar em card | ✅     | AI          | KPIDetailModal + TouchableOpacity      |
| M2-K-004 | Implementar card Comparativo Loja x Rede  | ✅     | AI          | ComparativoLojaRedeCard.tsx            |
| M2-K-005 | Melhorar layout responsivo dos cards      | 🔲     | -           | Grid adaptativo para tablets           |
| M2-K-006 | Adicionar mini-gráfico inline nos cards   | ✅     | AI          | SparklineChart.tsx com SVG             |

**Progresso M2-K:** 5/6 (83%)

---

## Milestone 3: Melhorias de Gráficos (M3-C)

| ID       | Tarefa                                      | Status | Responsável | Notas                               |
| -------- | ------------------------------------------- | ------ | ----------- | ----------------------------------- |
| M3-C-001 | Implementar gráfico de pizza (Serviços)     | ✅     | AI          | PieChart em ChartsScreen            |
| M3-C-002 | Implementar gráfico donut (Pagamentos)      | ✅     | AI          | PieChart donut em ChartsScreen      |
| M3-C-003 | Implementar gráfico barras (Produção)       | ✅     | AI          | BarChart pendência em ChartsScreen  |
| M3-C-004 | Adicionar zoom/pinch em gráficos longos     | ✅     | AI          | ZoomableChartWrapper + scroll horiz |
| M3-C-005 | Implementar legendas interativas            | ✅     | AI          | InteractiveLegend.tsx + hook        |
| M3-C-006 | Adicionar animações de entrada nos gráficos | ✅     | AI          | Via gifted-charts animateOnLoad     |

**Progresso M3-C:** 6/6 (100%)

---

## Milestone 4: Heatmap e Mapas (M4-H)

| ID       | Tarefa                                     | Status | Responsável | Notas                          |
| -------- | ------------------------------------------ | ------ | ----------- | ------------------------------ |
| M4-H-001 | Adicionar tooltip ao tocar em célula       | ✅     | AI          | `tooltipCell` state            |
| M4-H-002 | Implementar mapa geográfico por UF (lista) | ✅     | AI          | Lista ordenada por faturamento |
| M4-H-003 | Implementar mapa geográfico visual         | ✅     | AI          | BrasilMapSVG.tsx integrado     |
| M4-H-004 | Melhorar responsividade do grid heatmap    | ✅     | AI          | isTablet + min/max cellSize    |

**Progresso M4-H:** 4/4 (100%)

---

## Milestone 5: Ranking (M5-R)

| ID       | Tarefa                                    | Status | Responsável | Notas                              |
| -------- | ----------------------------------------- | ------ | ----------- | ---------------------------------- |
| M5-R-001 | Destacar visualmente a loja do usuário    | ✅     | AI          | Highlight com accent border        |
| M5-R-002 | Adicionar filtro por região/categoria     | ✅     | AI          | Chips de região com filtro local   |
| M5-R-003 | Implementar ordenação por outras métricas | ✅     | AI          | Sort by Faturamento/Tickets/Peças  |
| M5-R-004 | Adicionar animações de posição no ranking | ✅     | AI          | Stagger anim + position indicators |

**Progresso M5-R:** 4/4 (100%)

---

## Milestone 6: UX/UI Avançado (M6-U)

| ID       | Tarefa                                     | Status | Responsável | Notas                            |
| -------- | ------------------------------------------ | ------ | ----------- | -------------------------------- |
| M6-U-001 | Garantir touch targets ≥ 44pt              | ✅     | AI          | minHeight: 44 nos componentes    |
| M6-U-002 | Adicionar labels de acessibilidade         | ✅     | AI          | accessibilityRole/Label/Hint     |
| M6-U-003 | Implementar modo offline com cache         | ✅     | AI          | useOfflineStatus + OfflineBanner |
| M6-U-004 | Otimizar tempo de carregamento inicial     | 🔲     | -           | Target < 3s                      |
| M6-U-005 | Adicionar onboarding/tutorial primeira vez | ✅     | AI          | OnboardingTour.tsx 6 steps       |

**Progresso M6-U:** 4/5 (80%)

---

## Milestone 7: Autenticação (M7-A)

| ID       | Tarefa                                        | Status | Responsável | Notas                         |
| -------- | --------------------------------------------- | ------ | ----------- | ----------------------------- |
| M7-A-001 | Implementar tratamento de erro 401            | ✅     | AI          | axiosClient + logout callback |
| M7-A-002 | Adicionar refresh token (se backend suportar) | 🔲     | -           | Opcional                      |
| M7-A-003 | Implementar logout com limpeza de cache       | 🔲     | -           | Limpar TanStack Query cache   |

**Progresso M7-A:** 1/3 (33%)

---

## Resumo Geral

| Milestone           | Total  | Concluído | Progresso |
| ------------------- | ------ | --------- | --------- |
| M1: Filtros Globais | 8      | 8         | 100%      |
| M2: KPIs            | 6      | 5         | 83%       |
| M3: Gráficos        | 6      | 6         | 100%      |
| M4: Heatmap/Mapas   | 4      | 4         | 100%      |
| M5: Ranking         | 4      | 4         | 100%      |
| M6: UX/UI           | 5      | 4         | 80%       |
| M7: Autenticação    | 3      | 1         | 33%       |
| **Total**           | **36** | **32**    | **89%**   |

---

## Componentes Criados

### Novos Componentes (M1-G)

| Arquivo                 | Descrição                                   | Linhas |
| ----------------------- | ------------------------------------------- | ------ |
| `LojaPicker.tsx`        | Modal de seleção multi-lojas com busca      | ~380   |
| `DateRangePicker.tsx`   | Modal de período com presets e calendário   | ~420   |
| `PeriodPresets.tsx`     | Presets horizontais + versão inline         | ~300   |
| `FilterBarNew.tsx`      | FilterBar refatorado usando componentes     | ~230   |
| `useFiltersStore.ts`    | Store Zustand com persistência AsyncStorage | ~150   |
| `index.ts` (components) | Barrel export dos componentes               | ~20    |

### Localização

```
src/features/dashboard/
├── components/
│   ├── index.ts              ← Barrel export
│   ├── FilterBarNew.tsx      ← FilterBar refatorado
│   ├── LojaPicker.tsx        ← Modal de lojas
│   ├── DateRangePicker.tsx   ← Modal de período
│   └── PeriodPresets.tsx     ← Presets de período
└── stores/
    └── useFiltersStore.ts    ← Store com persistência
```

---

## Próximos Passos Recomendados

### Alta Prioridade

1. **M1-G-008**: Testar comportamento de filtros entre telas
2. **M2-K-003**: Tooltip/detail ao tocar em KPI card (modal com breakdown)
3. **M7-A-001**: Tratamento de erro 401 (redirect para login)

### Média Prioridade

4. **M2-K-005**: Layout responsivo dos cards (grid adaptativo para tablets)
5. **M3-C-004**: Zoom/pinch em gráficos longos
6. **M4-H-004**: Responsividade do grid heatmap

### Baixa Prioridade

7. **M5-R-002**: Filtro por região/categoria no ranking
8. **M5-R-003**: Ordenação por outras métricas no ranking
9. **M6-U-005**: Onboarding/tutorial primeira vez

---

## Histórico de Atualizações

| Data       | Alterações                                                           |
| ---------- | -------------------------------------------------------------------- |
| 2025-12-24 | Criação do backlog                                                   |
| 2025-12-24 | M1-G-001 a M1-G-006 concluídos (componentes de filtros)              |
| 2025-12-24 | Atualização de endpoints para Presence Dashboard API (`/api/v1/...`) |
| 2025-12-24 | Correção de baseUrl no SessionStore (porta 8003)                     |
| 2025-12-24 | M1-G-007 concluído (FilterBarNew em todas as screens)                |
| 2025-12-24 | M2-K-004 concluído (ComparativoLojaRedeCard)                         |
| 2025-12-24 | M2-K-006 concluído (SparklineChart nos KPI cards)                    |
| 2025-12-24 | M3-C-005 concluído (InteractiveLegend com toggle)                    |
| 2025-12-24 | M4-H-003 concluído (BrasilMapSVG integrado)                          |
| 2025-12-24 | M6-U-003 concluído (useOfflineStatus + OfflineBanner)                |
| 2025-12-24 | M1-G-008 concluído (filtros globais validados)                       |
| 2025-12-24 | M2-K-003 concluído (KPIDetailModal com breakdown)                    |
| 2025-12-24 | M7-A-001 concluído (erro 401 com logout automático)                  |
