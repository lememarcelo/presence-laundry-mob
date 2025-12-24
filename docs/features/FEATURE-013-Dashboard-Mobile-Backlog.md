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
| M1-G-007 | Substituir FilterBar antigo pelo novo            | 🔲     | -           | Atualizar imports nas screens                |
| M1-G-008 | Testar comportamento de filtros entre telas      | 🔲     | -           | Validar state global                         |

**Progresso M1-G:** 6/8 (75%)

---

## Milestone 2: Melhorias de KPIs (M2-K)

| ID       | Tarefa                                    | Status | Responsável | Notas                               |
| -------- | ----------------------------------------- | ------ | ----------- | ----------------------------------- |
| M2-K-001 | Implementar semáforos nos cards de KPI    | 🔲     | -           | Verde/Amarelo/Vermelho baseado em % |
| M2-K-002 | Criar componente SkeletonCard             | 🔲     | -           | Loading elegante para cards         |
| M2-K-003 | Adicionar tooltip/detail ao tocar em card | 🔲     | -           | Modal com breakdown do cálculo      |
| M2-K-004 | Implementar card Comparativo Loja x Rede  | 🔲     | -           | Novo tipo de card                   |
| M2-K-005 | Melhorar layout responsivo dos cards      | 🔲     | -           | Grid adaptativo para tablets        |
| M2-K-006 | Adicionar mini-gráfico inline nos cards   | 🔲     | -           | Sparkline dos últimos 7 dias        |

**Progresso M2-K:** 0/6 (0%)

---

## Milestone 3: Melhorias de Gráficos (M3-C)

| ID       | Tarefa                                      | Status | Responsável | Notas                         |
| -------- | ------------------------------------------- | ------ | ----------- | ----------------------------- |
| M3-C-001 | Implementar gráfico de pizza (Serviços)     | 🔲     | -           | DistribuicaoServicos endpoint |
| M3-C-002 | Implementar gráfico donut (Pagamentos)      | 🔲     | -           | EvolucaoPagamentos endpoint   |
| M3-C-003 | Implementar gráfico barras (Produção)       | 🔲     | -           | PendenciaProducao endpoint    |
| M3-C-004 | Adicionar zoom/pinch em gráficos longos     | 🔲     | -           | Melhorar interação touch      |
| M3-C-005 | Implementar legendas interativas            | 🔲     | -           | Toggle de séries              |
| M3-C-006 | Adicionar animações de entrada nos gráficos | 🔲     | -           | UX polish                     |

**Progresso M3-C:** 0/6 (0%)

---

## Milestone 4: Heatmap e Mapas (M4-H)

| ID       | Tarefa                                     | Status | Responsável | Notas                       |
| -------- | ------------------------------------------ | ------ | ----------- | --------------------------- |
| M4-H-001 | Adicionar tooltip ao tocar em célula       | 🔲     | -           | Mostrar valor exato         |
| M4-H-002 | Implementar mapa geográfico por UF (lista) | 🔲     | -           | Lista ordenada por região   |
| M4-H-003 | Implementar mapa geográfico visual         | 🔲     | -           | SVG do Brasil com cores     |
| M4-H-004 | Melhorar responsividade do grid heatmap    | 🔲     | -           | Ajustar tamanho das células |

**Progresso M4-H:** 0/4 (0%)

---

## Milestone 5: Ranking (M5-R)

| ID       | Tarefa                                    | Status | Responsável | Notas                       |
| -------- | ----------------------------------------- | ------ | ----------- | --------------------------- |
| M5-R-001 | Destacar visualmente a loja do usuário    | 🔲     | -           | Highlight na lista          |
| M5-R-002 | Adicionar filtro por região/categoria     | 🔲     | -           | Opcional para redes grandes |
| M5-R-003 | Implementar ordenação por outras métricas | 🔲     | -           | Tickets, peças, etc         |
| M5-R-004 | Adicionar animações de posição no ranking | 🔲     | -           | Setas up/down               |

**Progresso M5-R:** 0/4 (0%)

---

## Milestone 6: UX/UI Avançado (M6-U)

| ID       | Tarefa                                     | Status | Responsável | Notas                  |
| -------- | ------------------------------------------ | ------ | ----------- | ---------------------- |
| M6-U-001 | Garantir touch targets ≥ 44pt              | 🔲     | -           | Acessibilidade         |
| M6-U-002 | Adicionar labels de acessibilidade         | 🔲     | -           | VoiceOver/TalkBack     |
| M6-U-003 | Implementar modo offline com cache         | 🔲     | -           | Mostrar dados em cache |
| M6-U-004 | Otimizar tempo de carregamento inicial     | 🔲     | -           | Target < 3s            |
| M6-U-005 | Adicionar onboarding/tutorial primeira vez | 🔲     | -           | Tour pelos recursos    |

**Progresso M6-U:** 0/5 (0%)

---

## Milestone 7: Autenticação (M7-A)

| ID       | Tarefa                                        | Status | Responsável | Notas                       |
| -------- | --------------------------------------------- | ------ | ----------- | --------------------------- |
| M7-A-001 | Implementar tratamento de erro 401            | 🔲     | -           | Redirect para login         |
| M7-A-002 | Adicionar refresh token (se backend suportar) | 🔲     | -           | Opcional                    |
| M7-A-003 | Implementar logout com limpeza de cache       | 🔲     | -           | Limpar TanStack Query cache |

**Progresso M7-A:** 0/3 (0%)

---

## Resumo Geral

| Milestone           | Total  | Concluído | Progresso |
| ------------------- | ------ | --------- | --------- |
| M1: Filtros Globais | 8      | 6         | 75%       |
| M2: KPIs            | 6      | 0         | 0%        |
| M3: Gráficos        | 6      | 0         | 0%        |
| M4: Heatmap/Mapas   | 4      | 0         | 0%        |
| M5: Ranking         | 4      | 0         | 0%        |
| M6: UX/UI           | 5      | 0         | 0%        |
| M7: Autenticação    | 3      | 0         | 0%        |
| **Total**           | **36** | **6**     | **17%**   |

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

## Próximos Passos

1. **M1-G-007**: Substituir imports do FilterBar antigo pelo FilterBarNew nas screens
2. **M1-G-008**: Testar navegação entre telas mantendo estado dos filtros
3. **M2-K-001**: Iniciar implementação de semáforos nos KPIs

---

## Histórico de Atualizações

| Data       | Alterações                                                           |
| ---------- | -------------------------------------------------------------------- |
| 2025-12-24 | Criação do backlog                                                   |
| 2025-12-24 | M1-G-001 a M1-G-006 concluídos (componentes de filtros)              |
| 2025-12-24 | Atualização de endpoints para Presence Dashboard API (`/api/v1/...`) |
| 2025-12-24 | Correção de baseUrl no SessionStore (porta 8003)                     |
