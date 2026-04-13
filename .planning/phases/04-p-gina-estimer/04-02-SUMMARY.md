---
phase: 04-p-gina-estimer
plan: "02"
subsystem: frontend-spa
tags: [history, localStorage, submit, validacion, renderResult, estimer]
dependency_graph:
  requires:
    - 04-01: formulario #estimer-form, #mileage-error, #result-section, var EstimerForm
    - 03: Engine.estimate(), var Engine
    - 03: Marketplaces.getLinks()
    - 02: I18n.currentLang, formatPrice()
  provides:
    - index.html: var History con save() y getAll() — global accesible desde consola
    - index.html: submit handler en #estimer-form (validación km + Engine + History + render)
    - index.html: function renderResult() — orquesta visualización del resultado
    - index.html: click handler en #btn-new-estimate — resetea formulario y oculta resultado
  affects:
    - 04-03: renderResult() ya llama getElementById('result-price') y getElementById('result-range') — Plan 04-03 debe crear esos IDs
    - 04-04: renderResult() ya invoca renderBreakdown() si existe — Plan 04-04 define esa función
    - 04-05: renderResult() ya invoca renderMarketplaces() si existe — Plan 04-05 define esa función
tech_stack:
  added: []
  patterns:
    - localStorage con try/catch para tolerancia a errores de cuota/corrupción
    - Reflow forzado (element.offsetHeight) para activar CSS transitions desde JS
    - Guard checks (typeof renderBreakdown === 'function') para integración progresiva entre planes
key_files:
  modified:
    - index.html
decisions:
  - "var History insertado después de var EstimerForm y antes de const ROUTES — orden correcto de inicialización"
  - "Llamadas al botón btn-new-estimate usan EstimerForm._populateModels/._populateYears/._updateSubmitState (métodos del objeto, no funciones globales standalone)"
  - "renderResult() usa guards typeof === 'function' para renderBreakdown y renderMarketplaces — permite que planes 04-03/04/05 se integren sin cambiar este código"
metrics:
  duration: "8min"
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_modified: 1
---

# Phase 4 Plan 02: History + Submit Handler — Summary

**One-liner:** Módulo var History con localStorage (save/getAll), submit handler del formulario Estimer con validación de km y llamada a Engine, y función renderResult() con animación CSS reflow.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Añadir var History al script de index.html | 8bbf9ce | index.html |
| 2 | Submit handler, renderResult() y botón "Nouvelle estimation" | 8a7c090 | index.html |

## What Was Built

### Task 1 — var History (8bbf9ce)

Inserción del módulo `var History` entre `var EstimerForm` y `const ROUTES`:

- `History._KEY = 'autoValeur_history'` — clave localStorage
- `History.save(entry)` — genera registro con 13 campos (id via Date.now(), todos los campos del formulario + resultado + date ISO), hace unshift al array existente, persiste via `localStorage.setItem` con `try/catch` (T-04-02-02)
- `History.getAll()` — lee y parsea localStorage con `try/catch`, retorna `[]` si vacío o JSON corrompido (T-04-02-03)

### Task 2 — Submit Handler + renderResult() + btn-new-estimate (8a7c090)

Tres bloques insertados dentro del DOMContentLoaded, después de `EstimerForm.init()`:

**Submit handler en `#estimer-form`:**
- Recoge los 8 valores del formulario
- Valida km: `!mileageRaw || isNaN(mileage) || mileage <= 0` → muestra `#mileage-error` y hace focus (T-04-02-01)
- Llama `Engine.estimate()` con los 8 parámetros; si retorna null, `console.warn` y return
- Llama `History.save()` con todos los campos del formulario + resultado
- Llama `renderResult()` y hace scroll suave a `#result-section`

**Función `renderResult(result, make, model, year)`:**
- Rellena `#result-price` y `#result-range` si existen (integración progresiva con Plan 04-03)
- Llama `renderBreakdown()` y `renderMarketplaces()` solo si están definidas (guard `typeof === 'function'`)
- Activa animación: `hidden = false` → `offsetHeight` (reflow) → `classList.add('visible')`

**Click handler en `#btn-new-estimate`:**
- Llama `form.reset()` + `EstimerForm._populateModels('')` + `EstimerForm._populateYears('', '')` + `EstimerForm._updateSubmitState()`
- Oculta `#result-section`: quita `.visible`, espera 250ms transición CSS, pone `hidden = true`
- Scroll suave a `#page-estimer`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corregidas llamadas a funciones inexistentes en btn-new-estimate**
- **Found during:** Task 2, verificación post-inserción
- **Issue:** El plan especificaba llamadas a `populateModels('')`, `populateYears('', '')` y `_updateSubmitState()` como funciones globales, pero en el archivo estas son métodos del objeto `EstimerForm` (`EstimerForm._populateModels`, `EstimerForm._populateYears`, `EstimerForm._updateSubmitState`). Las llamadas globales habrían lanzado `ReferenceError` en runtime.
- **Fix:** Reemplazadas por las referencias correctas a los métodos del objeto.
- **Files modified:** index.html
- **Commit:** 8a7c090

## Known Stubs

- `renderResult()` usa `getElementById('result-price')` y `getElementById('result-range')` que retornarán `null` hasta que Plan 04-03 cree esos elementos. Los guards `if (priceEl)` y `if (rangeEl)` evitan errores; el precio no se mostrará hasta 04-03.
- `renderBreakdown` y `renderMarketplaces` no se invocan hasta que Planes 04-04 y 04-05 las definan. El guard `typeof === 'function'` lo maneja sin error.

## Threat Flags

Ninguno. Todas las mitigaciones del threat model están implementadas:
- T-04-02-01 (validación km): `!mileageRaw || isNaN(mileage) || mileage <= 0` en submit handler
- T-04-02-02 (localStorage.setItem DoS): `try/catch` con `console.warn` en History.save()
- T-04-02-03 (getAll JSON corrompido): `try/catch` en JSON.parse retorna `[]`
- T-04-02-04 (Information Disclosure localStorage): aceptado — sin PII ni credenciales

## Self-Check

Files:
- [x] index.html modificado

Commits:
- [x] 8bbf9ce — var History module
- [x] 8a7c090 — submit handler + renderResult + btn-new-estimate

## Self-Check: PASSED
