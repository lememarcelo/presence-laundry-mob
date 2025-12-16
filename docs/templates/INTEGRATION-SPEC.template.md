# {{SYSTEM_NAME}} – Integration Spec

- **System:** {{System name (e.g. Zoho Sprints, Pagar.me, WhatsApp API)}}
- **Type:** {{API / Webhook / File / Other}}
- **Owner:** {{Team / person}}
- **Last updated:** {{YYYY-MM-DD}}

---

## 1. Purpose

- Why do we integrate with this system?
- What business value does this integration deliver?

---

## 2. Overview

- **Data direction:** {{Inbound, Outbound, Bidirectional}}
- **Main flows:**
  - {{Flow 1}} – {{short description}}
  - {{Flow 2}}

---

## 3. Authentication and authorization

- **Mechanism:** {{OAuth2, API key, JWT, etc.}}
- **Token / secret storage:** {{Where and how secrets are stored}}
- **Scopes / permissions:** {{Required scopes/permissions}}

---

## 4. Endpoints / contracts

> Document the most important endpoints, payloads, and constraints.

- `{{HTTP_METHOD}} {{/path}}` – {{Description}}
  - Request:
    ```json
    {{Example request}}
    ```
  - Response:
    ```json
    {{Example response}}
    ```
  - Notes: {{Rate limits, pagination, filters, etc.}}

Repeat for other key endpoints.

---

## 5. Webhooks / events (if applicable)

- **Events we receive:**
  - {{Event 1}} – {{when it's fired, payload shape}}
  - {{Event 2}}

- **Events we send (if any):**
  - {{Event 3}} – {{who consumes it and why}}

---

## 6. Data mapping

- **Local entity:** {{e.g. Task, Customer, Payment}}
  - **Remote object:** {{e.g. Zoho Item, Pagar.me customer}}
  - **Field mapping:**
    - Local `{{fieldA}}` ↔ Remote `{{fieldX}}`
    - Local `{{fieldB}}` ↔ Remote `{{fieldY}}`

---

## 7. Error handling and retries

- **Error categories:**
  - {{Client errors, server errors, rate limits, network issues}}

- **Retry strategy:**
  - {{When to retry, backoff strategy, idempotency keys, etc.}}

- **Dead-letter / failure handling:**
  - {{What happens when retries are exhausted}}

---

## 8. Environments

- **Sandbox / staging:**
  - Base URL: `{{...}}`
  - Credentials: {{where they are stored}}

- **Production:**
  - Base URL: `{{...}}`
  - Credentials: {{where they are stored}}

---

## 9. Testing and validation

- **How to manually test this integration:**
  - {{Step 1}}
  - {{Step 2}}

- **Automated tests:**
  - {{Types of tests, mocked vs real calls, etc.}}

---

## 10. Maintenance and monitoring

- **Dashboards / alerts:** {{Where to monitor this integration}}
- **Known limitations:** {{Any constraints or open issues}}
