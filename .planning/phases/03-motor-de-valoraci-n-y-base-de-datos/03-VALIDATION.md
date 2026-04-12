---
phase: 3
slug: motor-de-valoraci-n-y-base-de-datos
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Tests inline en consola — vanilla JS, single HTML file, no external framework |
| **Config file** | none — tests embebidos en el `<script>` de index.html |
| **Quick run command** | Abrir index.html en browser, ver consola DevTools |
| **Full suite command** | Igual — todos los tests corren en DOMContentLoaded |
| **Estimated runtime** | ~2 seconds (browser load + console output) |

---

## Sampling Rate

- **After every task commit:** Abrir index.html, verificar consola DevTools sin errores JS
- **After every plan wave:** Ejecutar los 5 test cases T1–T5 y verificar PASS en todos
- **Before `/gsd-verify-work`:** Los 5 tests muestran `[PASS]` en consola y breakdown tiene exactamente 7 líneas
- **Max feedback latency:** ~2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-T1 | 01 | 1 | DB-01 | — | N/A | console | `Object.keys(CAR_DB).length === 14` | ❌ W0 | ⬜ pending |
| 03-01-T2 | 01 | 1 | DB-02 | — | N/A | console | Loop marcas: cada una ≥ 3 modelos | ❌ W0 | ⬜ pending |
| 03-01-T3 | 01 | 1 | DB-03 | — | N/A | console | Cada modelo tiene base_price, years, fuel_types | ❌ W0 | ⬜ pending |
| 03-01-T4 | 01 | 1 | DB-04 | — | N/A | smoke | `typeof CAR_DB !== 'undefined'` en consola | ❌ W0 | ⬜ pending |
| 03-02-T1 | 02 | 1 | ALG-02 | — | N/A | console | `DEPRECIATION.age_factors[7] === 0.43` | ❌ W0 | ⬜ pending |
| 03-02-T2 | 02 | 1 | ALG-04 | — | N/A | console | `DEPRECIATION.fuel.diesel === 1.06` | ❌ W0 | ⬜ pending |
| 03-02-T3 | 02 | 1 | ALG-05 | — | N/A | console | `DEPRECIATION.city.casablanca === 1.08` | ❌ W0 | ⬜ pending |
| 03-03-T1 | 03 | 2 | ALG-01 | — | N/A | console | Engine.estimate() retorna { estimated_price, price_range, breakdown } | ❌ W0 | ⬜ pending |
| 03-03-T2 | 03 | 2 | ALG-03 | — | N/A | console | T1 Logan 85k km: f_km < 1 (más km que media) | ❌ W0 | ⬜ pending |
| 03-03-T3 | 03 | 2 | ALG-06 | — | N/A | console | T5 coche muy antiguo: estimated_price >= 8000 | ❌ W0 | ⬜ pending |
| 03-03-T4 | 03 | 2 | ALG-07 | — | N/A | console | price_range.min = estimated*0.9, max = estimated*1.1 | ❌ W0 | ⬜ pending |
| 03-04-T1 | 04 | 2 | ALG-01..07 | — | N/A | console | T1 Logan 2019: resultado entre 50.000-70.000 DH | ❌ W0 | ⬜ pending |
| 03-04-T2 | 04 | 2 | ALG-01..07 | — | N/A | console | breakdown.length === 7 | ❌ W0 | ⬜ pending |
| 03-05-T1 | 05 | 3 | — | — | N/A | console | Marketplaces.getLinks() retorna 3 URLs no vacías | ❌ W0 | ⬜ pending |
| 03-05-T2 | 05 | 3 | — | — | N/A | console | URLs contienen marca y modelo encodeados | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Bloque de tests inline IIFE en index.html (plan 03-04) — cubre ALG-01 a ALG-07, DB-01 a DB-04
- [ ] `console.assert()` checks para estructura CAR_DB (14 marcas, ≥3 modelos, base_price)
- [ ] Verificación de Marketplaces.getLinks() — 3 URLs bien formadas

*No hay framework externo que instalar — Wave 0 es el propio bloque de tests del plan 03-04.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| URLs de Avito/Moteur/Wandaloo abren búsqueda correcta en browser | — | Requiere verificar que los resultados del sitio web corresponden al coche buscado | Ejecutar Marketplaces.getLinks('Dacia','Logan',2019), abrir cada URL en browser |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
