# {{MODULE_NAME}} – Module Overview

- **Context / bounded context:** {{Domain / bounded context name}}
- **Owner:** {{Team / person}}
- **Last updated:** {{YYYY-MM-DD}}

---

## 1. Purpose

Explain what this module is responsible for and what problems it solves.

---

## 2. Boundaries and responsibilities

- **Handles:**
  - {{Responsibility 1}}
  - {{Responsibility 2}}
- **Does NOT handle:**
  - {{Out-of-scope concern 1}}
  - {{Out-of-scope concern 2}}

---

## 3. Main concepts and entities

- **Entity 1:** {{Name}} – {{short description}}
- **Entity 2:** {{Name}} – {{short description}}

Include any important invariants or business rules tied to these entities.

---

## 4. Main flows

Describe key flows (step-by-step, diagrams, or pseudo-sequence):

- **Flow 1:** {{Name}}
  1. {{Step 1}}
  2. {{Step 2}}

- **Flow 2:** {{Name}}

---

## 5. Public APIs / interfaces

- **Controllers / endpoints / messages exposed by this module:**
  - {{Endpoint or message 1}} – {{description}}
  - {{Endpoint or message 2}}

- **Events / messages published:**
  - {{Event 1}} – {{when it's emitted}}

- **Events / messages consumed:**
  - {{Event 2}} – {{who emits it}}

---

## 6. Dependencies

- **Internal modules:**
  - {{Module A}} – {{why it is used}}

- **External systems:**
  - {{System X}} – {{integration description}}

---

## 7. Configuration

- **Environment variables:**
  - `{{VAR_NAME}}` – {{description}}

- **Feature flags:** {{List any relevant flags}}

---

## 8. Observability

- **Metrics:** {{Which metrics are important for this module?}}
- **Logs:** {{Logging strategy and important log messages}}
- **Traces:** {{Any tracing conventions}}

---

## 9. TODO / future improvements

- {{Idea 1}}
- {{Idea 2}}
