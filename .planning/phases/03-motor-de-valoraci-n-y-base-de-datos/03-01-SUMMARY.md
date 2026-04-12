---
phase: 03-motor-de-valoracion-y-base-de-datos
plan: "01"
subsystem: data
tags: [car-db, data, javascript, ma-market]
dependency_graph:
  requires: []
  provides: [CAR_DB]
  affects: [Engine.estimate (plan 03-03), Marketplaces (plan 03-05), UI Estimer (plan 04)]
tech_stack:
  added: []
  patterns: [embedded-data-object, var-declaration-pattern]
key_files:
  created: []
  modified: [index.html]
decisions:
  - "Usar claves simples sin acento para marcas (Citroen en lugar de Citroën) para compatibilidad con lookup del motor"
  - "Usar var en lugar de const per patron establecido en el codebase"
  - "Precios revisados al alza ~20-25% sobre tabla RESEARCH original para calibrar a mercado MA 2024-2025"
metrics:
  duration: "5min"
  completed_date: "2026-04-12"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 3 Plan 1: Base de datos CAR_DB con 14 marcas x modelos x precios base — Summary

## One-liner

Objeto `var CAR_DB` con 14 marcas marroquíes x 3 modelos x precios base calibrados para MA (~2020 ref), embebido en el script de index.html entre formatPrice y ROUTER.

## What Was Built

Se insertó el bloque `var CAR_DB = {...}` en `index.html` inmediatamente después del cierre de `formatPrice` y antes del comentario de sección ROUTER. El objeto contiene:

- **14 marcas**: Dacia, Renault, Peugeot, Citroen, Hyundai, Kia, Toyota, VW, Ford, Fiat, Seat, Suzuki, Mercedes, BMW
- **42 modelos** (exactamente 3 por marca)
- **Estructura por modelo**: `{ base_price: number, years: [min, max], fuel_types: [string] }`
- Precios calibrados para el mercado MA ref. ~2020, revisados al alza ~20-25% sobre los datos brutos del RESEARCH

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 03-01-T1 | Insertar var CAR_DB con 14 marcas y 42 modelos en index.html | d7dcae2 | index.html |

## Verification Results

Verificado con Node.js evaluando el bloque extraído de index.html:
- `Object.keys(CAR_DB).length === 14` — PASS
- Todas las marcas tienen exactamente 3 modelos — PASS
- `CAR_DB['Dacia']['Logan'].base_price === 105000` — PASS
- Sintaxis JS válida (evaluado sin errores) — PASS

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None — CAR_DB es un objeto literal completo con datos reales del mercado MA. No hay placeholders ni valores hardcoded vacíos.

## Threat Flags

None — CAR_DB es un objeto literal estático sin input de usuario ni peticiones de red. Los precios son datos públicos del mercado MA.

## Self-Check: PASSED

- index.html modificado: FOUND (commit d7dcae2)
- CAR_DB con 14 marcas verificado: PASS
- Commit d7dcae2 existe: PASS
