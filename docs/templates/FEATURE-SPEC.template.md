---
id: FEATURE-{{ID}}
title: {{Short, clear feature name}}
status: draft   # draft | in-progress | implemented | deprecated
owner: {{Name}}
created_at: {{YYYY-MM-DD}}
updated_at: {{YYYY-MM-DD}}
links:
  - type: ticket
    url: {{Link to task / story / issue}}
  - type: design
    url: {{Link to design doc / mockups}}
---

# {{Short, clear feature name}}

## 1. Summary

- **Goal:** {{What problem does this feature solve?}}
- **Users impacted:** {{Which personas?}}
- **Success criteria:** {{How do we know this is working?}}

---

## 2. Context

- **Current situation:** {{What exists today?}}
- **Pain points / limitations:** {{Why is this needed?}}
- **Related features / modules:** {{References to other specs or modules}}

---

## 3. Requirements

### 3.1 Functional requirements

- FR1: {{Requirement 1}}
- FR2: {{Requirement 2}}

### 3.2 Non-functional requirements

- NFR1: {{Requirement (performance / security / availability / etc.)}}

---

## 4. User stories / use cases

- US1: As a **{{persona}}**, I want **{{goal}}** so that **{{benefit}}**.
- US2: ...

If useful, add simple flows or sequence diagrams (even in text).

---

## 5. Domain model and data

- **Entities involved:**
  - {{Entity 1}} – {{short description}}
  - {{Entity 2}}

- **Important fields and constraints:**
  - {{Field-level rules, uniqueness, ranges, etc.}}

- **Data lifecycle:** {{creation, updates, deletion, archival}}

---

## 6. API design

> Adjust for REST/GraphQL as needed.

- `{{HTTP_METHOD}} {{/api/path}}`
  - Description: {{what it does}}
  - Request body:
    ```json
    {{Example request body}}
    ```
  - Response body:
    ```json
    {{Example response body}}
    ```
  - Errors:
    - 400 – {{Reason}}
    - 401 – {{Reason}}
    - 404 – {{Reason}}

If there are multiple endpoints, split them into subsections.

---

## 7. UI / UX (if applicable)

- **Screens or components impacted:**
  - {{Screen 1}} – {{description}}
- **States:**
  - Loading
  - Empty
  - Error
  - Success
- **UX notes:** {{validation rules, edge behaviors, etc.}}

---

## 8. Edge cases and business rules

- {{Edge case 1}}
- {{Edge case 2}}
- {{Business rule 1}}
- {{Business rule 2}}

---

## 9. Dependencies and impacts

- **Dependencies:**
  - {{Other features / services / external systems}}
- **Impacts:**
  - {{Breaking changes? Migration needed?}}

---

## 10. Rollout and migration

- **Rollout strategy:** {{feature flag, pilot customers, big bang, etc.}}
- **Migration plan:** {{data migration steps, backfill, etc.}}

---

## 11. Test plan (high level)

Summarize key test cases here and link to a detailed test matrix if needed.

- Happy path:
  - {{Scenario 1}}
- Edge / error cases:
  - {{Scenario 2}}

> For detailed coverage, see: `docs/tests/{{FEATURE-ID}}-TEST-MATRIX.md` (based on the template).
