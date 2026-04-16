---
phase: 05-historique-y-comparer
plan: "05"
subsystem: comparer-winner-bars
tags: [comparer, price-bars, winner-badge, ratio-pricing, animation, xss-prevention, css-logical-properties, tdd]

dependency_graph:
  requires:
    - phase: 05-04
      provides: "var Comparer con renderComparison() placeholder, CSS .compare-winner/.compare-bar/.badge"
    - phase: 05-01
      provides: "I18n.t('comparer.winner_badge'), History.getAll(), formatPrice()"
  provides:
    - "Función determineWinner(entryA, entryB) — lógica de ganador por ratio precio/km"
    - "renderComparison() completo con barras proporcionales animadas y badge Meilleur rapport"
    - "COMP-03 y COMP-04 implementados — Fase 5 completa"
  affects: [index.html]

tech-stack:
  added: []
  patterns: [tdd-inline-tests, requestAnimationFrame-animation, css-logical-properties-rtl, textcontent-xss-prevention]

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "determineWinner como función standalone (no método de Comparer) — disponible antes de la definición del módulo y testeable directamente en el bloque localhost"
  - "requestAnimationFrame para forzar reflow y activar la transición CSS (width 0% → width calculado) — sin setTimeout, sin delays artificiales"
  - "winner.id === entry.id para comparar entries (no referencia de objeto) — robusto frente a búsqueda por lookup en History"
  - "toFixed(2) en widthA/widthB — evita strings de 15 decimales en style.width, suficiente precisión visual"

requirements-completed: [COMP-03, COMP-04]

duration: 1min
completed: "2026-04-16"
---

# Phase 05 Plan 05: Barras proporcionales y lógica de ganador en Comparer Summary

**Función determineWinner con ratio precio/km (mileage=0 y empate manejados) + barras animadas proporcionales + badge "Meilleur rapport" con CSS logical properties para RTL.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-16T16:22:42Z
- **Completed:** 2026-04-16T16:23:42Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 1

## Accomplishments

- Función `determineWinner(entryA, entryB)` añadida como función standalone antes de `var Comparer`:
  - `mileage === 0` en cualquier entry → ganador por precio menor (evita división por cero)
  - `ratio = estimated_price / mileage` → menor ratio gana
  - Empate (ratios iguales) → retorna `null` (ningún ganador)
- `renderComparison()` reemplazado con implementación completa:
  - `maxPrice = Math.max(priceA, priceB)` → coche más caro recibe `width: 100%`
  - `widthA = (priceA / maxPrice * 100).toFixed(2)` → porcentaje proporcional
  - `winner.id === entry.id` → determina si la tarjeta recibe `.compare-winner`
  - Badge `<span class="badge">` con `textContent = I18n.t('comparer.winner_badge')` — solo cuando `isWinner === true`
  - `requestAnimationFrame` activa transición CSS `width 0.3s ease` correctamente
- 4 tests inline añadidos en bloque `location.hostname === 'localhost'`:
  - Test 1: ratio normal (ratioB 0.688 < ratioA 0.791 → entryB gana)
  - Test 2: mileage=0 (→ precio menor gana)
  - Test 3: empate exacto (→ null)
  - Test 4: ratio inverso (entryB con km altos y precio alto pero mejor ratio gana)

## determineWinner — Pseudocódigo y casos edge

```
determineWinner(entryA, entryB):
  SI entryA.mileage === 0 OR entryB.mileage === 0:
    SI priceA < priceB → retorna entryA
    SI priceB < priceA → retorna entryB
    retorna null  // ambos tienen precio igual con mileage=0
  ratioA = priceA / mileageA
  ratioB = priceB / mileageB
  SI ratioA < ratioB → retorna entryA
  SI ratioB < ratioA → retorna entryB
  retorna null  // empate exacto
```

**Fórmula de barras:**
```
maxPrice = Math.max(entryA.estimated_price, entryB.estimated_price)
widthA = (entryA.estimated_price / maxPrice * 100).toFixed(2)  // → "100.00" para el más caro
widthB = (entryB.estimated_price / maxPrice * 100).toFixed(2)  // → "61.58" para 58500/95000
```

## Task Commits

| Task | Fase TDD | Descripción | Commit |
|------|----------|-------------|--------|
| 1 (RED) | Tests | Tests inline de determineWinner (fallan — función no existe) | `3275785` |
| 1 (GREEN) | Implementación | determineWinner + renderComparison completo | `9c16d5e` |

## Tests inline — Resultados esperados

| Test | Entrada | Resultado esperado | Lógica |
|------|---------|-------------------|--------|
| 1 | a={price:95000,km:120000} b={price:58500,km:85000} | entryB gana | ratioB=0.688 < ratioA=0.791 |
| 2 | a={price:95000,km:0} b={price:58500,km:85000} | entryB gana | km=0 → precio menor |
| 3 | a={price:58500,km:85000} b={price:58500,km:85000} | null (empate) | ratios idénticos |
| 4 | a={price:72000,km:25000} b={price:95000,km:120000} | entryB gana | ratioB=0.791 < ratioA=2.88 |

DevTools Console esperada: `=== Tests determineWinner Fase 5: OK ===` sin ningún FAIL.

## Requirements completados — Fase 5 completa

| Requirement | Descripción | Plan | Estado |
|-------------|-------------|------|--------|
| HIST-01 | localStorage save/load para historial | 05-01 | Implementado |
| HIST-02 | Formato de precio marroquí (fr-FR, MAD) | 05-01 | Implementado |
| HIST-03 | i18n fr/ar para todas las claves de Historique y Comparer | 05-01 | Implementado |
| HIST-04 | Página #page-historique con lista de valoraciones | 05-03 | Implementado |
| HIST-05 | Estado vacío orientativo en Historique con CTA | 05-03 | Implementado |
| COMP-01 | Selects poblados desde History.getAll() | 05-04 | Implementado |
| COMP-02 | Layout lado a lado (.compare-card, .compare-grid) | 05-04 | Implementado |
| COMP-03 | Barras proporcionales de precio (100% max, % relativo) | **05-05** | Implementado |
| COMP-04 | Ganador por ratio precio/km con edge cases | **05-05** | Implementado |
| COMP-05 | Estado orientativo en Comparer con CTA a Estimer | 05-04 | Implementado |

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito. Los 3 pasos (A función standalone, B renderComparison, C tests localhost) se implementaron según spec.

## TDD Gate Compliance

- RED gate: commit `3275785` — `test(05-05): add failing tests for determineWinner function`
- GREEN gate: commit `9c16d5e` — `feat(05-05): implement determineWinner() and proportional price bars in Comparer`
- REFACTOR gate: no necesario — código limpio sin refactorización pendiente

## Known Stubs

None — todos los stubs de la Fase 5 han sido resueltos:
- `.compare-bar` con `width='0%'` (stub de 05-04) → reemplazado con widths calculados + animación
- `.compare-winner` CSS definido pero no aplicado (stub de 05-04) → aplicado via `classList` en isWinner

## Threat Flags

None — amenazas del plan cubiertas:
- T-05-05-01 (XSS injection via entry.make/model/year): `title.textContent = entry.make + ...` — textContent escapa HTML
- T-05-05-02 (División por cero mileage=0): `if (entryA.mileage === 0 || entryB.mileage === 0)` — branch explícito antes del cálculo
- T-05-05-03 (maxPrice=0): aceptado — `widthA = widthB = 0` si ambos precios son 0 (imposible en práctica con floor de 8000 DH)

---
*Phase: 05-historique-y-comparer*
*Completed: 2026-04-16*
