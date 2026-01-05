# FEATURE-013.1 - Ranking com Agrupamento Geográfico

> **Documento de Especificação**  
> Módulo: Dashboard Mobile - Aba Ranking  
> Criado em: 2025-01-05  
> Última atualização: 2025-01-06  
> Status: ✅ Implementado (Backend + Frontend Web)

**Documentos Relacionados:**

- [FEATURE-013 - Dashboard Mobile Spec](./FEATURE-013-dashboard-mobile-spec.md)
- [FEATURE-013 - Dashboard Mobile](./FEATURE-013-dashboard-mobile.md)
- [Backlog de Tarefas Mobile](./FEATURE-013-Dashboard-Mobile-Backlog.md)
- [Guia do Franqueado](../../../presence-laundry/docs/guides/GUIA-DASHBOARD-FRANQUEADO.md)

---

## 1. Visão Geral

### 1.1 Objetivo

Estender a aba de **Ranking** do Dashboard Mobile para permitir visualização dos dados agrupados por diferentes dimensões geográficas: **Região**, **Estado** e **Cidade**. Atualmente, o ranking exibe apenas a lista de lojas individuais. Com esta evolução, o usuário poderá analisar a performance agregada por diferentes níveis geográficos.

### 1.2 Situação Atual

**Componente existente:** `RankingScreen.tsx`

O ranking atual oferece:
- **Tabs primárias:** Lojas | Funcionários
- **Filtro de região:** Todas, Sudeste, Sul, Nordeste, Norte, Centro-Oeste (filtra lojas, não agrupa)
- **Ordenação:** Faturamento | Tickets | Peças

### 1.3 Nova Funcionalidade

Adicionar um **novo grupo de seleção** que define a **dimensão de agrupamento**:

| Dimensão | Descrição                                      | Exemplo de Exibição              |
| -------- | ---------------------------------------------- | -------------------------------- |
| Região   | Agrupa por macrorregião geográfica             | Sudeste: R$ 1.500.000 (45%)      |
| Estado   | Agrupa por Unidade Federativa (UF)             | SP: R$ 800.000 (25%), MG: R$ ... |
| Cidade   | Agrupa por município                           | São Paulo: R$ 500.000, BH: ...   |

Uma vez selecionada a dimensão de agrupamento, o usuário poderá ainda escolher a **métrica de visualização**:
- **Faturamento** (R$)
- **Lojas** (quantidade)

---

## 2. Requisitos Funcionais

### 2.1 Novo Seletor de Agrupamento Geográfico

| ID       | Requisito                                                                     | Prioridade |
| -------- | ----------------------------------------------------------------------------- | ---------- |
| M-RG-001 | Adicionar toggle/segmented control para dimensão: Região \| Estado \| Cidade | Alta       |
| M-RG-002 | O seletor de dimensão deve ficar **acima** do seletor de métrica              | Alta       |
| M-RG-003 | Estado padrão inicial: **Estado** (UF) - nível intermediário                  | Média      |
| M-RG-004 | Persistir seleção na sessão (Zustand store)                                   | Baixa      |

### 2.2 Seletor de Métrica (existente, adaptado)

| ID       | Requisito                                                          | Prioridade |
| -------- | ------------------------------------------------------------------ | ---------- |
| M-RG-005 | Manter opções: Faturamento \| Lojas                                | Alta       |
| M-RG-006 | Quando dimensão = Cidade e métrica = Lojas, mostrar contagem de 1  | Média      |
| M-RG-007 | Formatar valores adequadamente (R$ ou número inteiro)              | Alta       |

### 2.3 Exibição dos Dados Agregados

| ID       | Requisito                                                                               | Prioridade |
| -------- | --------------------------------------------------------------------------------------- | ---------- |
| M-RG-008 | Exibir lista ranqueada pela métrica selecionada (descendente)                           | Alta       |
| M-RG-009 | Cada item deve mostrar: nome, valor absoluto, percentual do total, barra de intensidade | Alta       |
| M-RG-010 | Card de "Líder" no topo destacando o primeiro colocado                                  | Média      |
| M-RG-011 | Total consolidado no rodapé                                                             | Alta       |
| M-RG-012 | Pull-to-refresh deve respeitar o agrupamento selecionado                                | Alta       |

### 2.4 Interação e Drill-Down (Futuro)

| ID       | Requisito                                                              | Prioridade |
| -------- | ---------------------------------------------------------------------- | ---------- |
| M-RG-013 | (Futuro) Ao tocar em Região, navegar para Estados dessa região         | Baixa      |
| M-RG-014 | (Futuro) Ao tocar em Estado, navegar para Cidades desse estado         | Baixa      |
| M-RG-015 | (Futuro) Ao tocar em Cidade, navegar para Lojas dessa cidade           | Baixa      |

---

## 3. Mapeamento de Regiões

### 3.1 Macrorregião → Estados

| Região       | Estados (UF)                                   |
| ------------ | ---------------------------------------------- |
| Sudeste      | SP, RJ, MG, ES                                 |
| Sul          | PR, SC, RS                                     |
| Nordeste     | BA, PE, CE, MA, PI, RN, PB, AL, SE             |
| Norte        | AM, PA, AC, RO, RR, AP, TO                     |
| Centro-Oeste | DF, GO, MT, MS                                 |

### 3.2 Dados Necessários do Backend

Para suportar esta funcionalidade, cada loja deve ter os seguintes campos:

```typescript
interface DadosLojaGeografico {
  codigo: string;
  nome: string;
  faturamento: number;
  // Dados geográficos
  regiao: 'sudeste' | 'sul' | 'nordeste' | 'norte' | 'centro-oeste';
  uf: string; // Sigla do estado: SP, RJ, MG, etc.
  cidade: string; // Nome do município
}
```

**Endpoint existente a verificar:** `/ranking/lojas` ou `/mapas/geografico`

---

## 4. Fluxo de Dados

### 4.1 Agregação no Frontend vs Backend

**Opção A - Agregação no Frontend (recomendada inicialmente):**
- Reutilizar dados de `/ranking/lojas` que já traz todas as lojas
- Agregar por regiao/uf/cidade no useMemo do componente
- Vantagem: sem alteração no backend
- Desvantagem: menos performático para redes com muitas lojas

**Opção B - Agregação no Backend (ideal para escala):**
- Novo endpoint ou parâmetro: `/ranking/lojas?groupBy=regiao|estado|cidade`
- Backend retorna dados já agregados
- Vantagem: melhor performance
- Desvantagem: requer desenvolvimento no backend

### 4.2 Lógica de Agregação (Frontend)

```typescript
type AgrupamentoDimensao = 'regiao' | 'estado' | 'cidade';
type MetricaVisualizacao = 'faturamento' | 'lojas';

interface ItemRankingAgregado {
  id: string;
  nome: string;       // Nome da região/estado/cidade
  faturamento: number;
  quantidadeLojas: number;
  percentual: number;
}

function agregarPorDimensao(
  lojas: DadosLojaGeografico[],
  dimensao: AgrupamentoDimensao
): ItemRankingAgregado[] {
  const grupos = new Map<string, { faturamento: number; lojas: number }>();
  
  for (const loja of lojas) {
    const chave = dimensao === 'regiao' 
      ? loja.regiao 
      : dimensao === 'estado' 
        ? loja.uf 
        : loja.cidade;
    
    const atual = grupos.get(chave) || { faturamento: 0, lojas: 0 };
    grupos.set(chave, {
      faturamento: atual.faturamento + loja.faturamento,
      lojas: atual.lojas + 1,
    });
  }
  
  const totalFaturamento = lojas.reduce((s, l) => s + l.faturamento, 0);
  
  return Array.from(grupos.entries())
    .map(([nome, { faturamento, lojas }]) => ({
      id: nome,
      nome: formatarNomeDimensao(nome, dimensao),
      faturamento,
      quantidadeLojas: lojas,
      percentual: totalFaturamento > 0 
        ? (faturamento / totalFaturamento) * 100 
        : 0,
    }))
    .sort((a, b) => b.faturamento - a.faturamento);
}
```

---

## 5. Design da Interface

### 5.1 Layout dos Seletores

```
┌─────────────────────────────────────────────┐
│  [Filtros Globais: Loja + Período]          │
├─────────────────────────────────────────────┤
│  Tabs: [Lojas] [Funcionários]               │
├─────────────────────────────────────────────┤
│  Agrupar por:                               │
│  ┌─────────┬─────────┬─────────┐            │
│  │ Região  │ Estado  │ Cidade  │  ← NOVO    │
│  └─────────┴─────────┴─────────┘            │
├─────────────────────────────────────────────┤
│  Visualizar:                                │
│  ┌──────────────┬─────────┐                 │
│  │ Faturamento  │  Lojas  │                 │
│  └──────────────┴─────────┘                 │
├─────────────────────────────────────────────┤
│                                             │
│  [Card Líder do Ranking]                    │
│                                             │
│  Lista de Itens Ranqueados                  │
│  1º Sudeste     R$ 1.500.000    45%  ████   │
│  2º Sul         R$ 800.000      24%  ███    │
│  3º Nordeste    R$ 600.000      18%  ██     │
│  ...                                        │
│                                             │
│  ─────────────────────────────              │
│  Total          R$ 3.300.000                │
└─────────────────────────────────────────────┘
```

### 5.2 Componentes de UI

| Componente             | Descrição                                    | Tipo               |
| ---------------------- | -------------------------------------------- | ------------------ |
| `DimensaoSelector`     | Segmented control Região/Estado/Cidade       | Novo               |
| `MetricaSelector`      | Segmented control Faturamento/Lojas          | Existente (adaptar)|
| `RankingAgregadoList`  | Lista com itens agregados                    | Adaptar existente  |
| `RankingAgregadoItem`  | Item individual com barra de intensidade     | Adaptar existente  |

### 5.3 Cores e Ícones por Dimensão

| Dimensão | Ícone                   | Cor Badge  |
| -------- | ----------------------- | ---------- |
| Região   | `earth`                 | `#6366F1`  |
| Estado   | `map-marker`            | `#3B82F6`  |
| Cidade   | `city`                  | `#10B981`  |

---

## 6. Alterações de Código

### 6.1 Arquivos a Modificar

| Arquivo                                               | Alteração                                       |
| ----------------------------------------------------- | ----------------------------------------------- |
| `src/features/dashboard/screens/RankingScreen.tsx`    | Adicionar seletores e lógica de agregação       |
| `src/features/dashboard/stores/useFiltersStore.ts`    | Adicionar estados: dimensao, metricaVisualizacao|
| `src/features/dashboard/api/dashboard.service.ts`     | (Opcional) Novo endpoint/parâmetros             |
| `src/features/dashboard/hooks/useDashboardQueries.ts` | (Opcional) Hook para dados agregados            |
| `src/models/dashboard.models.ts`                      | Tipos para agregação geográfica                 |

### 6.2 Novo Estado no Store

```typescript
// useFiltersStore.ts (adicionar)
interface DashboardFiltersState {
  // ... existentes
  
  // Novos para ranking geográfico
  rankingDimensao: 'regiao' | 'estado' | 'cidade';
  rankingMetrica: 'faturamento' | 'lojas';
  setRankingDimensao: (d: 'regiao' | 'estado' | 'cidade') => void;
  setRankingMetrica: (m: 'faturamento' | 'lojas') => void;
}
```

### 6.3 Novos Componentes (Sugestão)

```typescript
// src/features/dashboard/components/DimensaoSelector.tsx
interface DimensaoSelectorProps {
  value: 'regiao' | 'estado' | 'cidade';
  onChange: (d: 'regiao' | 'estado' | 'cidade') => void;
}

// src/features/dashboard/components/MetricaVisualizacaoSelector.tsx
interface MetricaVisualizacaoSelectorProps {
  value: 'faturamento' | 'lojas';
  onChange: (m: 'faturamento' | 'lojas') => void;
}
```

---

## 7. Dependências e Requisitos de Backend

### 7.1 Dados Geográficos das Lojas

Para que a agregação funcione, é necessário que o backend retorne os dados geográficos de cada loja:

| Campo    | Tipo   | Obrigatório | Fonte              |
| -------- | ------ | ----------- | ------------------ |
| `regiao` | string | Sim         | Derivado da UF     |
| `uf`     | string | Sim         | Cadastro da loja   |
| `cidade` | string | Sim         | Cadastro da loja   |

### 7.2 Verificação de Endpoints

**Verificar se `/ranking/lojas` já retorna:**
- [ ] Código da loja
- [ ] UF da loja
- [ ] Cidade da loja

**Se não retornar, opções:**
1. Alterar endpoint existente para incluir dados geográficos
2. Fazer JOIN com dados de `/lojas` que pode ter essas informações
3. Criar endpoint específico: `/ranking/geografico?groupBy=regiao|estado|cidade`

### 7.3 Endpoint Sugerido (Backend)

```
GET /api/v1/ranking/geografico?groupBy={regiao|estado|cidade}&dtIni=YYYY-MM-DD&dtFim=YYYY-MM-DD

Response:
{
  "data": {
    "itens": [
      { "id": "sudeste", "nome": "Sudeste", "faturamento": 1500000, "lojas": 15, "percentual": 45 },
      { "id": "sul", "nome": "Sul", "faturamento": 800000, "lojas": 8, "percentual": 24 },
      ...
    ],
    "totalFaturamento": 3300000,
    "totalLojas": 35
  },
  "metadata": { "query_time_ms": 45 }
}
```

---

## 8. Critérios de Aceite

### 8.1 Funcionais

- [ ] Usuário pode selecionar dimensão de agrupamento: Região, Estado, Cidade
- [ ] Usuário pode selecionar métrica de visualização: Faturamento, Lojas
- [ ] Lista exibe itens agregados ordenados pela métrica selecionada
- [ ] Percentuais são calculados corretamente
- [ ] Barras de intensidade refletem proporcionalmente os valores
- [ ] Pull-to-refresh atualiza dados mantendo seleções
- [ ] Totais são exibidos corretamente no rodapé

### 8.2 Não Funcionais

- [ ] Transição suave ao trocar dimensão/métrica
- [ ] Loading state enquanto recalcula agregação
- [ ] Performance aceitável (< 100ms) para agregação de até 100 lojas

---

## 9. Tarefas de Implementação

| ID       | Tarefa                                                      | Estimativa | Dependência |
| -------- | ----------------------------------------------------------- | ---------- | ----------- |
| RG-001   | Adicionar tipos/interfaces no models                        | 0.5h       | -           |
| RG-002   | Criar lógica de agregação (hook ou util)                    | 2h         | RG-001      |
| RG-003   | Criar componente DimensaoSelector                           | 1h         | -           |
| RG-004   | Adaptar MetricaSelector (renomear de SORT_OPTIONS)          | 0.5h       | -           |
| RG-005   | Integrar seletores no RankingScreen                         | 2h         | RG-002,003  |
| RG-006   | Adaptar lista de ranking para dados agregados               | 2h         | RG-005      |
| RG-007   | Atualizar store com novos estados                           | 0.5h       | -           |
| RG-008   | Testes manuais com dados reais                              | 1h         | RG-006      |
| RG-009   | (Opcional) Criar endpoint backend para agregação            | 4h         | -           |

**Total estimado (sem backend):** ~10h

---

## 10. Mockup de Dados

### 10.1 Agrupado por Região

```json
[
  { "id": "sudeste", "nome": "Sudeste", "faturamento": 1500000, "lojas": 15, "percentual": 45.5 },
  { "id": "sul", "nome": "Sul", "faturamento": 800000, "lojas": 8, "percentual": 24.2 },
  { "id": "nordeste", "nome": "Nordeste", "faturamento": 600000, "lojas": 7, "percentual": 18.2 },
  { "id": "centro-oeste", "nome": "Centro-Oeste", "faturamento": 250000, "lojas": 3, "percentual": 7.6 },
  { "id": "norte", "nome": "Norte", "faturamento": 150000, "lojas": 2, "percentual": 4.5 }
]
```

### 10.2 Agrupado por Estado

```json
[
  { "id": "SP", "nome": "São Paulo", "faturamento": 900000, "lojas": 10, "percentual": 27.3 },
  { "id": "RJ", "nome": "Rio de Janeiro", "faturamento": 400000, "lojas": 3, "percentual": 12.1 },
  { "id": "MG", "nome": "Minas Gerais", "faturamento": 200000, "lojas": 2, "percentual": 6.1 },
  { "id": "PR", "nome": "Paraná", "faturamento": 350000, "lojas": 4, "percentual": 10.6 },
  { "id": "RS", "nome": "Rio Grande do Sul", "faturamento": 300000, "lojas": 3, "percentual": 9.1 }
]
```

---

## 11. Referências

### 11.1 Componente Similar no Frontend Web

- [GeographicChart.tsx](../../../presence-laundry/src/pages/dashboard/components/Charts/GeographicChart.tsx)
  - Toggle existente: Faturamento | Lojas
  - Exibe regiões com barras de intensidade

### 11.2 Imagem de Referência

A imagem anexada mostra o componente "Distribuição por Região" do dashboard web:
- Toggle: Faturamento | Lojas
- Resumo: quantidade de lojas + faturamento total
- Lista de regiões com barras proporcionais

---

## 12. Implementação Realizada

### 12.1 Resumo

A feature foi implementada com agregação **no backend** (Opção B da seção 4.1), proporcionando melhor performance e reutilização entre plataformas.

| Componente       | Status | Detalhes                                        |
| ---------------- | ------ | ----------------------------------------------- |
| **Backend API**  | ✅     | Endpoint `/ranking/geografico` implementado    |
| **Frontend Web** | ✅     | `GeographicChart.tsx` com dual selectors       |
| **Frontend Mob** | 🔲     | Pendente implementação                         |

### 12.2 Backend Implementado

#### Arquivos Modificados

| Arquivo                      | Alteração                                          |
| ---------------------------- | -------------------------------------------------- |
| `uRankingRepository.pas`     | `TRankingGroupBy` enum, `FetchRankingGeografico`   |
| `uRankingService.pas`        | `GetRankingGeografico` com cache 5min              |
| `uRankingController.pas`     | Handler HTTP `RankingGeografico`                   |
| `uRoutes.pas`                | Registro da rota `/ranking/geografico`             |

#### Endpoint Final

```
GET /api/v1/ranking/geografico?dtIni=YYYY-MM-DD&dtFim=YYYY-MM-DD&groupBy={regiao|estado|cidade}&metrica={faturamento|lojas}
```

#### Response Schema

```json
{
  "success": true,
  "data": {
    "titulo": "Ranking por Estado",
    "groupBy": "estado",
    "metrica": "faturamento",
    "periodo": {
      "inicio": "2024-01-01",
      "fim": "2024-12-31"
    },
    "totalItens": 12,
    "totalLojas": 85,
    "totalFaturamento": 2500000.00,
    "itens": [
      {
        "id": "SP",
        "nome": "Sao Paulo",
        "posicao": 1,
        "faturamento": 800000.00,
        "lojas": 25,
        "percentual": 32.0,
        "percentualTop": 100.0
      }
    ]
  },
  "_source": "cache|database",
  "timestamp": "2024-01-15T10:30:00"
}
```

#### Funções Auxiliares Implementadas

- `UFToRegiao(UF)` - Mapeia UF para macrorregião
- `GetNomeRegiao(regiao)` - Retorna nome da região
- `GetNomeEstado(UF)` - Retorna nome do estado (sem acentos)
- `FormatNomeCidade(cidade)` - Formata cidade em title case
- `RemoveAcentos(texto)` - Normaliza texto removendo acentos

#### Normalização de Dados

Para evitar duplicatas causadas por acentuação inconsistente no banco de dados:
- Chaves de agregação são normalizadas: `UpperCase(RemoveAcentos(Trim(CIDADE)))`
- Nomes são formatados para exibição com `FormatNomeCidade`
- Estados retornam nomes sem acentos; frontend mapeia para nomes corretos

### 12.3 Frontend Web Implementado

#### Arquivos Modificados

| Arquivo                    | Alteração                                     |
| -------------------------- | --------------------------------------------- |
| `dashboard.models.ts`      | Tipos `RankingGroupBy`, `ItemRankingGeografico`, etc. |
| `dashboard.service.ts`     | Função `getRankingGeografico()`               |
| `GeographicChart.tsx`      | Dual selectors, integração API, correção nomes |
| `GeographicChart.scss`     | Estilos para seletores                        |
| `Dashboard.tsx`            | Props `dataInicio`/`dataFim` para chart       |

#### Novos Tipos TypeScript

```typescript
type RankingGroupBy = 'regiao' | 'estado' | 'cidade';
type RankingMetrica = 'faturamento' | 'lojas';

interface ItemRankingGeografico {
  id: string;
  nome: string;
  posicao: number;
  faturamento: number;
  lojas: number;
  percentual: number;
  percentualTop: number;
}

interface DadosRankingGeografico {
  titulo: string;
  groupBy: RankingGroupBy;
  metrica: RankingMetrica;
  periodo: { inicio: string; fim: string };
  totalItens: number;
  totalLojas: number;
  totalFaturamento: number;
  itens: ItemRankingGeografico[];
}
```

#### UI Implementada

```
┌─────────────────────────────────────────────┐
│  Distribuição por Região                    │
├─────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┐            │
│  │ Região  │ Estado  │ Cidade  │  ← Roxo    │
│  └─────────┴─────────┴─────────┘            │
│                                             │
│  ┌──────────────┬─────────┐                 │
│  │ Faturamento  │  Lojas  │   ← Azul       │
│  └──────────────┴─────────┘                 │
├─────────────────────────────────────────────┤
│  12 estados • R$ 2.500.000,00               │
│                                             │
│  SP São Paulo     R$ 800.000   32%  ████████│
│  RJ Rio de Janeiro R$ 400.000  16%  ████    │
│  ...                                        │
└─────────────────────────────────────────────┘
```

#### Correção de Nomes de Estados

Frontend implementa mapeamento para corrigir nomes que chegam sem acento:

```typescript
const NOMES_ESTADOS: Record<string, string> = {
  'Sao Paulo': 'São Paulo',
  'Espirito Santo': 'Espírito Santo',
  'Goias': 'Goiás',
  // ...
};
```

### 12.4 Bug Fixes Aplicados

| Bug | Causa | Solução |
| --- | ----- | ------- |
| Nomes de estados com encoding quebrado | Acentos UTF-8 não tratados | Backend retorna sem acentos; frontend mapeia |
| Cidades duplicadas (São Paulo 2x) | Inconsistência no banco | Normalização com `RemoveAcentos + UpperCase` |
| Erro de compilação Delphi | Char array com `StringReplace` | Reescrita usando calls sequenciais de `StringReplace` |

---

## Histórico de Revisões

| Data       | Versão | Descrição                                   |
| ---------- | ------ | ------------------------------------------- |
| 2025-01-05 | 1.0    | Criação do documento de especificação       |
| 2025-01-06 | 2.0    | Implementação backend + frontend web concluída |
