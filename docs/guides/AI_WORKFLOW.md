# AI Workflow – Presence Laundry / Presence Remote

> Goal: use AI agents in a **consistent, repeatable** way to document features and design tests,
> without turning the process into bureaucracy.

This document is for **developers and architects**, not for the AI itself.  
It explains _how we want to use our agents in this repo_.

All examples assume:

- Frontend: Presence Laundry (React + TypeScript + DevExtreme)
- Backend: Presence Remote (Delphi / DataSnap REST API – separate repo)
- Docs live mainly under:
  - `docs/features/`
  - `docs/tests/`
  - `docs/tests/guides`

---

## Agents overview

**High-level / orchestration**

- `feature-orchestrator.agent`  
  Creates/updates the **plan**, **feature spec**, and **domain test matrix** for a feature.

**Specialists**

- `feature-planner.agent` – high-level planning and decomposition (can still be used for spikes or bigger initiatives).
- `docs-architect.agent` – deep dive in specs, domain modeling, ADRs.
- `qa-tester.agent` – test strategies and test matrices (domain + component).
- `tests-impl.agent` – Jest / RTL / unit test implementation.
- `dev-impl.agent` – React / UI implementation and refactors.
- `backend-impl.agent` – API and backend logic (when relevant).

The `feature-orchestrator` does **only the first mile** of documentation + domain test matrix.  
Code and concrete tests are still done by the specialist agents.

---

## Flow A – Existing legacy feature (document + domain tests)

Use this flow when:

- You have an existing behavior in the codebase (often complex),
- There is little or no documentation,
- You want to stabilize the behavior with a **spec + domain test matrix**,
- Before or while refactoring/adding new rules.

Typical examples:

- Plan distribution rules (combo + subscription, overflow, manual distribution).
- ROL receiving flow (receiving garments).
- Discount calculation on services.

### Step A1 – Run the Feature Orchestrator

**Agent:** `feature-orchestrator.agent`

**You provide:**

- Feature ID (if known), e.g. `FEATURE-002`.
- Feature name and short description (in PT/EN, the agent will answer in EN).
- Clarify if this is:
  - “Document current behavior as-is”, or
  - “Document current + desired new behavior”.

**You ask something like:**

> I want to document the existing plan distribution behavior for Presence Laundry  
> and prepare domain-level tests.  
> Feature ID: FEATURE-002.  
> Please:
>
> - create or update the plan file,
> - create or update the feature spec,
> - create or update the domain test matrix,
>   following our conventions.

**Expected output:**

- A proposed:
  - `docs/features/Feature-002-<slug>-plan.md`
  - `docs/features/Feature-002-<slug>.md`
  - `docs/tests/FEATURE-002-TEST-MATRIX.md`
- You then **copy/paste** these contents into the corresponding files and commit.

> After this step, the feature has a basic “contract”:
>
> - documented behavior,
> - domain test matrix that covers the rules.

---

### Step A2 – Refine tests and add edge cases (optional)

If the feature is critical or subtle, you can bring `qa-tester.agent` to refine the matrix.

**Agent:** `qa-tester.agent`

**Ask something like:**

> Using `docs/features/Feature-002-<slug>.md` and  
> `docs/tests/FEATURE-002-TEST-MATRIX.md`,  
> review and refine the domain test matrix:
>
> - check if all important rules are covered,
> - add missing edge cases,
> - keep IDs and structure consistent.

Apply the edits suggested by the QA agent to `FEATURE-002-TEST-MATRIX.md`.

---

### Step A3 – Implement / update domain tests (Jest)

**Agent:** `tests-impl.agent`

**Goal:** turn the domain test matrix into **real Jest tests** for a pure module.

**Ask something like:**

> Using `docs/tests/FEATURE-002-TEST-MATRIX.md` and our Jest setup  
> (jest.config.cjs and `.github/testing-guides/*`),  
> implement or update Jest tests for the core plan distribution function, in:
>
> - `src/core/plan/planDistribution.ts`
> - `src/core/plan/planDistribution.spec.ts`
>   The tests must:
> - follow the matrix IDs (TC-002-001, etc.),
> - cover both happy path and edge cases,
> - hit the real implementation (no over-mocking).

You then:

- apply the file content,
- run `yarn test planDistribution.spec.ts` (or equivalent),
- and iterate with the agent if something is off.

---

### Step A4 – Adjust implementation to satisfy tests

**Agent:** `dev-impl.agent` or `backend-impl.agent` / `frontend-impl.agent` (depending on where the logic lives)

**Ask something like:**

> Our domain tests for FEATURE-002 (plan distribution) are failing.  
> Please update `src/core/plan/planDistribution.ts` so all tests in  
> `src/core/plan/planDistribution.spec.ts` pass, while keeping the public behavior aligned  
> with `docs/features/Feature-002-<slug>.md`.

Here you use the agent to support refactors/changes until everything is green.

---

## Flow B – New feature (greenfield) – draft

> This is a placeholder, to be refined after Flow A is stable.

For a new feature, a likely flow will be:

1. `feature-orchestrator.agent`
   - to create initial plan, spec, and domain test matrix.
2. `qa-tester.agent`
   - to refine test coverage if needed.
3. `tests-impl.agent`
   - to create Jest tests from the matrix.
4. `frontend-impl` / `backend-impl` / `dev-impl`
   - to implement the feature in code until tests pass.

When this flow starts being used in practice, update this section with concrete examples.

---

## Principles

- **Docs and tests first (or at least together)** for critical features.
- Use `feature-orchestrator` to create the “first version” of plan/spec/test matrix quickly.
- Use specialist agents to deepen and implement (QA, tests, dev).
- Prefer updating docs/tests as part of the same change that touches rules.
- Keep everything in Git: docs, matrices, and tests are part of the product.
