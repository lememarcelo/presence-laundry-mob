# Presence Laundry Mobile - Scaffold Completo ✅

## 📱 Visão Geral

Scaffold inicial do aplicativo React Native/Expo para visualização do Dashboard Gerencial do Presence Laundry em formato mobile. Consumirá o backend Presence Remote (DataSnap) via Basic Auth.

## ✅ O que foi implementado (Iteração 1 - Scaffold)

### 1. Configuração do Projeto

- ✅ `package.json` com todas as dependências necessárias
- ✅ `app.json` configurado para Expo
- ✅ `tsconfig.json` com paths aliases (@/, @features/, @shared/, @models/)
- ✅ `babel.config.js` com module-resolver
- ✅ `.gitignore` apropriado

### 2. Sistema de Tema

- ✅ `src/shared/theme/theme.ts` - Paletas light/dark baseadas no Tigra Mob
- ✅ `src/shared/theme/ThemeProvider.tsx` - Context com toggle de tema
- ✅ Tokens de cores, espaçamento, tipografia e bordas
- ✅ Suporte a modo escuro completo

### 3. Modelos TypeScript

- ✅ `src/models/dashboard.models.ts` - Tipos para KPIs, gráficos, ranking
- ✅ Interfaces para métricas (Faturamento, Tickets, Peças, Clientes)
- ✅ Tipos para variação temporal e comparativos

### 4. Gerenciamento de Estado (Zustand)

- ✅ `src/features/auth/stores/useSessionStore.ts` - Autenticação + expo-secure-store
- ✅ `src/features/dashboard/stores/useFiltersStore.ts` - Filtros (período, lojas)
- ✅ Persist seguro de credenciais
- ✅ Estado de loading e erro

### 5. API Client

- ✅ `src/shared/api/axios-client.ts` - Axios com Basic Auth
- ✅ Interceptor para adicionar credenciais automaticamente
- ✅ Tratamento de erros 401 (logout automático)
- ✅ Helper `getErrorMessage`

### 6. Componentes Base

- ✅ `src/shared/components/Card.tsx` - Card reutilizável
- ✅ `src/shared/components/LoadingState.tsx` - Estado de carregamento
- ✅ `src/shared/components/ErrorState.tsx` - Estado de erro
- ✅ `src/shared/components/EmptyState.tsx` - Estado vazio

### 7. Navegação (React Navigation)

- ✅ `src/navigation/types.ts` - Tipos tipados para rotas
- ✅ `src/navigation/AuthStack.tsx` - Stack de autenticação
- ✅ `src/navigation/MainTabs.tsx` - Bottom Tabs com 4 abas
- ✅ `src/navigation/RootNavigator.tsx` - Navegador raiz (decide Auth vs Main)
- ✅ Ícones do @expo/vector-icons (MaterialCommunityIcons)

### 8. Tela de Login

- ✅ `src/features/auth/screens/LoginScreen.tsx` - Completa e funcional
- ✅ Campos: URL do servidor, Usuário, Senha
- ✅ Validação de formulário
- ✅ Toggle show/hide password
- ✅ Loading state durante autenticação
- ✅ Tratamento de erros
- ✅ Botão de toggle dark/light mode

### 9. Telas Placeholder do Dashboard

- ✅ `src/features/dashboard/screens/KPIsScreen.tsx` - Cards de indicadores
- ✅ `src/features/dashboard/screens/ChartsScreen.tsx` - Placeholder para gráficos
- ✅ `src/features/dashboard/screens/HeatmapScreen.tsx` - Placeholder para mapas
- ✅ `src/features/dashboard/screens/RankingScreen.tsx` - Placeholder para rankings
- ✅ Todas com pull-to-refresh
- ✅ Exibição dos filtros atuais
- ✅ Mensagens informativas sobre próximas implementações

### 10. App Principal

- ✅ `App.tsx` - Integra QueryClientProvider + ThemeProvider + RootNavigator
- ✅ Configuração do QueryClient (retry, staleTime, etc.)
- ✅ SafeAreaProvider para áreas seguras

## 📁 Estrutura de Pastas

```
presence-laundry-mob/
├── App.tsx                           # Ponto de entrada
├── app.json                          # Config Expo
├── package.json                      # Dependências
├── tsconfig.json                     # TypeScript config
├── babel.config.js                   # Babel + module resolver
├── docs/
│   └── features/
│       └── FEATURE-013-dashboard-mobile.md
└── src/
    ├── features/
    │   ├── auth/
    │   │   ├── screens/
    │   │   │   └── LoginScreen.tsx
    │   │   └── stores/
    │   │       └── useSessionStore.ts
    │   └── dashboard/
    │       ├── screens/
    │       │   ├── KPIsScreen.tsx
    │       │   ├── ChartsScreen.tsx
    │       │   ├── HeatmapScreen.tsx
    │       │   └── RankingScreen.tsx
    │       └── stores/
    │           └── useFiltersStore.ts
    ├── models/
    │   ├── dashboard.models.ts
    │   └── index.ts
    ├── navigation/
    │   ├── types.ts
    │   ├── AuthStack.tsx
    │   ├── MainTabs.tsx
    │   ├── RootNavigator.tsx
    │   └── index.ts
    └── shared/
        ├── api/
        │   └── axios-client.ts
        ├── components/
        │   ├── Card.tsx
        │   ├── LoadingState.tsx
        │   ├── ErrorState.tsx
        │   ├── EmptyState.tsx
        │   └── index.ts
        └── theme/
            ├── theme.ts
            ├── ThemeProvider.tsx
            └── index.ts
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Dispositivo físico com Expo Go ou emulador

### Instalação

```bash
cd presence-laundry-mob
npm install
# ou
yarn install
```

### Rodar o App

```bash
npm start
# ou
yarn start
```

### Testar em Dispositivo

1. Instale o **Expo Go** no seu celular (Android/iOS)
2. Escaneie o QR Code exibido no terminal
3. O app será carregado no dispositivo

## 🎨 Funcionalidades Atuais

### Login

- [x] Tela de login com validação
- [x] Conexão com servidor via Basic Auth
- [x] Persist seguro de credenciais (expo-secure-store)
- [x] Toggle dark/light mode

### Dashboard (Placeholder)

- [x] 4 abas navegáveis (KPIs, Gráficos, Mapas, Ranking)
- [x] Exibição de filtros (período, lojas)
- [x] Pull-to-refresh em todas as telas
- [x] Mensagens indicando próximas implementações

## 📋 Próximos Passos (Iteração 2)

### 1. Implementar Hooks de Dados (TanStack Query)

- [ ] `src/features/dashboard/hooks/useDashboardKPIs.ts`
- [ ] `src/features/dashboard/hooks/useDashboardCharts.ts`
- [ ] `src/features/dashboard/hooks/useDashboardRanking.ts`
- [ ] Queries com invalidação automática
- [ ] Loading e error states

### 2. Implementar Services

- [ ] `src/shared/api/dashboard.service.ts`
- [ ] Endpoints reais do Presence Remote
- [ ] DTOs conforme backend DataSnap
- [ ] Transformação de dados

### 3. KPI Cards Reais

- [ ] Componentes `FaturamentoCard`, `TicketsCard`, `PecasCard`
- [ ] Formatação de números e moedas
- [ ] Indicadores visuais (setas, cores)
- [ ] Variação percentual

### 4. Implementar Gráficos

- [ ] Adicionar biblioteca de gráficos (`react-native-chart-kit` ou `victory-native`)
- [ ] Gráfico de linha (evolução temporal)
- [ ] Gráfico de barras (atendimentos por dia)
- [ ] Gráfico de pizza (composição de receita)

### 5. Filtros Avançados

- [ ] Componente `FilterModal`
- [ ] Seletor de período (date picker)
- [ ] Seletor de lojas (multi-select)
- [ ] Aplicação de filtros com refetch

### 6. Mapas e Heatmaps

- [ ] Integração com mapas (react-native-maps?)
- [ ] Heatmap temporal (calendário)
- [ ] Distribuição geográfica

### 7. Testes

- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Testes E2E (Detox?)

## 🔧 Tecnologias Utilizadas

| Tecnologia         | Versão | Uso                 |
| ------------------ | ------ | ------------------- |
| Expo               | ~52.0  | Framework mobile    |
| React              | 18.3   | UI Library          |
| React Native       | 0.76   | Mobile runtime      |
| TypeScript         | ~5.3   | Tipagem             |
| React Navigation   | 7+     | Navegação           |
| TanStack Query     | 5+     | Server state        |
| Zustand            | 5+     | Client state        |
| Axios              | 1+     | HTTP client         |
| expo-secure-store  | 15+    | Credenciais seguras |
| @expo/vector-icons | 15+    | Ícones              |

## 📝 Padrões de Código

### Imports

- Usar path aliases (`@/`, `@features/`, `@shared/`, `@models/`)
- Ordenar imports: externos → internos → relativos

### Componentes

- Functional components com hooks
- Props interface tipada
- StyleSheet.create() para estilos
- Usar tokens do tema (colors, spacing, typography)

### Estado

- Server state → TanStack Query
- Client state → Zustand stores
- Local UI state → useState/useReducer

### Nomenclatura

- Componentes: PascalCase (`LoginScreen.tsx`)
- Hooks: camelCase com prefixo `use` (`useSessionStore.ts`)
- Arquivos: kebab-case ou camelCase
- Constantes: UPPER_SNAKE_CASE

## 🐛 Problemas Conhecidos

- ⚠️ Endpoint `/api/test-connection` no LoginScreen é placeholder - ajustar conforme backend real
- ⚠️ Dados das telas são mock - aguardando integração com API
- ⚠️ Gráficos não implementados ainda

## 📞 Contato

Dúvidas ou sugestões? Consulte a especificação completa em `docs/features/FEATURE-013-dashboard-mobile.md`

---

**Status**: ✅ Scaffold Completo (Iteração 1)  
**Data**: 15/12/2025  
**Próxima Iteração**: Implementação de KPI Cards e Hooks de Dados
