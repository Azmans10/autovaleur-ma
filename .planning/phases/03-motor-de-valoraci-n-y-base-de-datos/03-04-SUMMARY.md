---
phase: 03-motor-de-valoracion-y-base-de-datos
plan: "04"
subsystem: tests
tags: [javascript, vanilla, inline-tests, console, iife, valuation-engine]
dependency_graph:
  requires:
    - "var Engine con estimate(params) (plan 03-03)"
    - "CAR_DB con 14 marcas (plan 03-01)"
    - "DEPRECIATION con factores calibrados (plan 03-02)"
  provides:
    - "Bloque IIFE de 5 tests inline auto-ejecutable al cargar index.html"
    - "Verificacion del caso critico T1 Logan 2019 (50k-70k DH)"
    - "Verificacion del floor minimo 8000 DH via T5"
  affects:
    - "Plan 03-05 (Marketplaces — complementario, misma capa de script)"
    - "index.html — bloque insertado entre Engine y ROUTER"
tech_stack:
  added: []
  patterns:
    - "IIFE (Immediately Invoked Function Expression) para auto-ejecucion al parsear"
    - "Pattern test(name, params, checks) con acumulador passed/failed"
    - "Verificacion de breakdown.length === 7 por cada test case"
    - "Verificacion de price_range coherente (redondeo a centenas)"
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "IIFE sin DOMContentLoaded — los tests no acceden al DOM, solo a Engine.estimate()"
  - "Rangos priceMin/priceMax intencionalmente amplios para absorber variaciones de anno actual"
  - "Arrow → en console.log usando unicode \\u2192 — evita problemas de encoding en archivos HTML"
metrics:
  duration: "5min"
  completed_date: "2026-04-12"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 3 Plan 4: Tests inline en consola — 5 casos representativos del mercado MA

## One-liner

Bloque IIFE de 5 tests auto-ejecutables que verifican Engine.estimate() con casos reales del mercado MA — T1 Logan 2019 confirma el caso critico del ROADMAP (53800 DH, dentro de 50k-70k).

## What Was Built

Se inserto el bloque IIFE de tests en `index.html` entre `var Engine` y el comentario `// ROUTER`. El bloque:

1. **Se auto-ejecuta** al parsear el script — sin DOMContentLoaded
2. **Llama Engine.estimate()** con parametros reales de cada test case
3. **Verifica 3 condiciones** por test: precio en rango, `breakdown.length === 7`, `price_range` coherente
4. **Imprime resultado** `[PASS]` o `[FAIL]` con precio estimado
5. **Resume** con `=== Resultados: N PASS, N FAIL ===`

### Los 5 casos de test

| Test | Vehiculo | Resultado | Rango esperado | Estado |
|------|----------|-----------|----------------|--------|
| T1 | Dacia Logan 2019, 85k km, diesel, bon, Casablanca | 53.800 DH | 50.000-70.000 DH | PASS |
| T2 | BMW Serie 3 2018, 120k km, diesel, moyen, Rabat | 107.300 DH | 50.000-120.000 DH | PASS |
| T3 | Kia Picanto 2022, 25k km, essence, excellent, Marrakech | 63.900 DH | 50.000-100.000 DH | PASS |
| T4 | Hyundai Tucson 2020, 60k km, diesel, bon, Tanger | 128.500 DH | 80.000-180.000 DH | PASS |
| T5 | Fiat Punto 2012, 250k km, mauvais, essence, Oujda | 16.200 DH | 8.000-25.000 DH | PASS |

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 03-04-T1 | Implementar bloque IIFE de 5 test cases inline en index.html | a7a0e55 | index.html |

## Verification Results

Verificado con Node.js evaluando los bloques CAR_DB + DEPRECIATION + Engine + TESTS extraidos de index.html:

- `=== AutoValeur Tests (2026) ===` — impreso al inicio
- T1 Logan 2019: `53800 DH` — PASS (dentro de 50000-70000)
- T2 BMW Serie 3 2018: `107300 DH` — PASS (dentro de 50000-120000)
- T3 Kia Picanto 2022: `63900 DH` — PASS (dentro de 50000-100000)
- T4 Hyundai Tucson 2020: `128500 DH` — PASS (dentro de 80000-180000)
- T5 Fiat Punto 2012 (floor): `16200 DH` — PASS (>= 8000 DH)
- `=== Resultados: 5 PASS, 0 FAIL ===` — confirmado
- `breakdown.length === 7` para todos los tests — PASS
- `price_range` coherente (min = ~90%, max = ~110% del precio estimado) — PASS

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito. Los 5 tests pasan con los mismos valores que el trace de RESEARCH.md predijo para T1.

## Known Stubs

None — los tests llaman Engine.estimate() con datos reales de CAR_DB y DEPRECIATION. No hay placeholders ni mocks.

## Threat Flags

None — el bloque es de solo lectura sobre datos locales, no introduce nuevas trust boundaries (confirmado por threat_model del plan: T-03-05 con disposition "accept").

## Self-Check: PASSED

- index.html modificado con bloque IIFE tests: FOUND (entre lineas Engine y ROUTER)
- Commit a7a0e55 existe: CONFIRMED
- 5 PASS, 0 FAIL verificado con Node.js: CONFIRMED
- T1 Logan 2019 => 53800 DH (50000-70000): PASS
- T5 Fiat Punto => 16200 DH (>= 8000): PASS
- breakdown.length === 7 para todos: PASS
