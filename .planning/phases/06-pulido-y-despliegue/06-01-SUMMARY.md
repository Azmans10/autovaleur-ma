---
phase: 06-pulido-y-despliegue
plan: "01"
subsystem: ui
tags: [css, typography, pwa, ios, tokens]

# Dependency graph
requires: []
provides:
  - "Escala tipografica CSS conforme a UI-SPEC: 5 tokens (sm, base, xl, 2xl, hero), pesos 400/600 unicamente"
  - "Token --font-size-hero: 2.5rem en :root usado en .result-price"
  - "Banner iOS con tap target >= 44px en boton de cierre (PWA-04)"
affects:
  - "06-03-PLAN.md — usa los mismos tokens CSS de tipografia"
  - "06-04-PLAN.md — verifica UI en viewports"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token semantico --font-size-hero para el precio principal del resultado"
    - "Tap targets minimos 44x44px en botones flotantes (min-width + min-height + display:flex)"

key-files:
  created: []
  modified:
    - "index.html"

key-decisions:
  - "Eliminar --font-size-lg completamente (7 usos) en lugar de mantenerlo como alias — elimina confusion futura"
  - "Usar min-width/min-height + display:flex en boton banner iOS para tap target sin alterar layout exterior"

patterns-established:
  - "Tokens CSS: 5 tamanos tipograficos (sm, base, xl, 2xl, hero), 2 pesos (400, 600)"
  - "Botones flotantes/banner: min-width:44px + min-height:44px + display:flex para cumplir PWA tap target"

requirements-completed:
  - PWA-04
  - PWA-05

# Metrics
duration: 18min
completed: "2026-04-17"
---

# Phase 06 Plan 01: Correccion tipografica y auditoria banner iOS — Summary

**Escala tipografica CSS corregida segun UI-SPEC: eliminado --font-size-lg (7 refs), anadido --font-size-hero: 2.5rem, todos los font-weight 700/800 corregidos a 600; boton banner iOS corregido a tap target 44x44px (PWA-04)**

## Performance

- **Duration:** 18 min
- **Started:** 2026-04-17T20:37:00Z
- **Completed:** 2026-04-17T20:55:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Eliminado el token `--font-size-lg` de `:root` y sus 7 referencias en index.html (CSS + inline styles HTML)
- Anadido `--font-size-hero: 2.5rem` en `:root` y aplicado a `.result-price` via `var(--font-size-hero)`
- Corregidos 4 selectores con `font-weight: 700/800` a `600` (.app-title, .page h2, .result-price, .breakdown-table tr:last-child td)
- Banner iOS verificado: posicionado sobre la nav con `bottom: calc(--nav-height + safe-area)`, boton de cierre corregido a `min-width: 44px; min-height: 44px`

## Task Commits

1. **Tasks 1+2: Correccion escala tipografica** — `376ff36` (feat)
2. **Task 3: Tap target boton banner iOS** — `c1a01d9` (fix)

## Files Created/Modified

- `index.html` — Tokens CSS tipograficos corregidos, font-weights normalizados, banner iOS con tap target >= 44px

## Decisions Made

- Eliminar `--font-size-lg` completamente (en lugar de mantener alias a `--font-size-base`) para evitar confusion futura en el CSS
- Usar `display: flex` + `align-items: center` + `justify-content: center` en el boton del banner para que el tap target de 44px sea correcto sin romper el layout del banner

## Deviations from Plan

### Auto-fixed Issues

**1. [Regla 1 - Bug] Tap target del boton de cierre del banner iOS era ~21px (inferior a 44px requerido)**

- **Found during:** Task 3 (auditoria .ios-install-banner)
- **Issue:** El boton tenia solo `padding: var(--sp-xs) var(--sp-sm)` (4px 8px) y `font-size: 0.8rem` — altura total ~21px, muy inferior al minimo de 44px de PWA-04
- **Fix:** Anadidos `min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;` al selector `.ios-install-banner button`
- **Files modified:** index.html
- **Verification:** CSS inspeccionado; con `min-height: 44px` el tap target cumple el requisito
- **Committed in:** c1a01d9 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug de tap target)
**Impact on plan:** Fix necesario para cumplir PWA-04. Sin scope creep.

## Issues Encountered

Ninguno — la auditoria del banner confirmo que el posicionamiento ya era correcto (no solapa la nav). Solo se requirio corregir el tap target del boton de cierre.

## User Setup Required

Ninguno — solo cambios CSS en index.html.

## Next Phase Readiness

- Tipografia de index.html conforme a UI-SPEC — lista para plan 06-02 (manifest + SW)
- Banner iOS (PWA-04) verificado — listo para auditoria de despliegue en plan 06-05
- No hay bloqueadores para los planes siguientes de la fase 06

---
*Phase: 06-pulido-y-despliegue*
*Completed: 2026-04-17*
