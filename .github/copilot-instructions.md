# Presence Laundry – Copilot Instructions

## Architecture Snapshot

- Single-page front-end built with Vite + React 18 + TypeScript (see `vite.config.mjs`, `src/main.jsx`).
- Domain code lives under `src/api` (REST clients), `src/hooks` (React Query/Zustand glue), and `src/components`/`src/pages` (DevExtreme UI). Keep the “service → hook → component” layering as in `src/api/delivery.service.ts` + `src/hooks/use-delivery-queries.ts` + `src/components/delivery`.
- Global configuration, store selection, and employee identity are read from Zustand stores (`src/hooks/use-configuration-store.tsx`, `src/hooks/use-user-store.ts`). Always respect `storeId`, `databasePath`, and employee context when calling APIs.

## Data & State Patterns

- API calls use plain axios helpers per domain. If headers depend on the active database path, call `setInterceptor` from `src/api/axiosClient.ts` before firing requests.
- Server state is cached with TanStack Query; prefer colocated hooks (`useDeliveryGroupsQuery`, `useSaleQueries`, etc.) so components never import services directly. When mutating, invalidate or update the relevant query keys (observe how `use-delivery-queries.ts` builds stable keys and invalidators).
- Local UI toggle/state should stay in component hooks; app-wide state belongs in the appropriate Zustand store file rather than ad-hoc contexts.

## UI Conventions

- All new views should be functional components using DevExtreme widgets. Favor `DataGrid` for tabular data with explicit columns, `selection` mode, and `Toolbar` buttons similar to `src/components/delivery` and `src/components/stock`.
- Keep typography/layout inside the existing SCSS/Tailwind layers (`src/styles`, `tailwind.css`). Reuse helper components (e.g., `grid-view-template`, `form-popup`) before introducing new primitives.
- When fetching data in a component, wire loading and empty states the same way `src/components/received` and `src/components/production` do: guard on `isLoading`/`isFetching`, show DevExtreme loaders, and avoid triggering queries while a required filter (store, date, etc.) is missing.

## Build, Run, and Test

- Install dependencies with `yarn` (or `npm install`). Postinstall runs `npm run build-themes` to compile DevExtreme themes; run it manually if you edit `devextreme.json`.
- Development server: `yarn dev` (opens Vite on port 3000). Production build: `yarn build`. Tests: `yarn test` / `yarn test:watch`. Linting: `yarn lint` (auto-fix via `yarn lint:fix`).
- Jest is configured via `jest.config.js` with `setupTests.ts`; colocate component tests under `__tests__` or `tests/` mirroring existing folders.

## Project-Specific Guidance

- Multi-tenant awareness is critical: most API payloads need `storeId`/`terminal`/employee IDs from the stores above. Never hardcode these values.
- When extending API contracts, update both the TypeScript types under `src/api` and any derived models in `src/models` so downstream hooks/components receive typed data.
- Prefer explicit TypeScript types; avoid `any` and keep enums/constants close to their models (see `src/models/*`).
- Keep DevExtreme interactions accessible: provide `hint`/`aria-label` props on icon-only buttons and expose `data-testid` where automated tests need hooks.

## Git & Workflow

- Branch naming: `feature/<short-description>` or `bugfix/<ticket>`. Avoid force-pushing shared branches.
- Run lint + unit tests before submitting PRs touching critical flows (cash operations, delivery, production). Document backend dependencies or mock data requirements in the PR description to help reviewers.

Questions or unclear areas? Let us know so we can expand these guidelines.
