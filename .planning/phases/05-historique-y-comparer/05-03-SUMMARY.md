---
phase: 05-historique-y-comparer
plan: "03"
subsystem: historique-ui
tags: [historique, clear-history, two-step-confirm, timeout, empty-state, svg, i18n]

dependency_graph:
  requires:
    - phase: 05-02
      provides: "Historique.init/render, btn-clear-history, history-empty HTML, .btn-danger CSS"
  provides:
    - "Flujo de 2 pasos para Effacer tout (clearStep mutex + clearTimeout 3s)"
    - "Estado vacío con SVG clipboard inline (opacity 0.4) y CTA a #estimer"
    - "Botón Effacer tout oculto automáticamente cuando historial vacío (via Historique.render)"
  affects: [index.html]

tech-stack:
  added: []
  patterns: [two-step-confirm-no-modal, clearTimeout-pitfall-prevention, clearStep-mutex]

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Flujo 2 pasos implementado con variable clearStep como mutex (0=normal, 1=esperando): previene doble borrado accidental (T-05-03-01)"
  - "clearTimeout(clearTimer) antes del paso 2 para prevenir Pitfall 4 (race condition entre timeout y segundo clic)"
  - "SVG genérico (círculo con +) reemplazado por SVG clipboard con líneas horizontales — más representativo de historial vacío"
  - "Sin window.confirm() ni modal — flujo nativo en DOM conforme a decisión locked del CONTEXT.md"

patterns-established:
  - "two-step-confirm: clearStep (0→1→0) + clearTimeout antes de acción destructiva"
  - "timeout-reset: setTimeout 3s con clearTimer=null en callback para evitar clearTimeout(null) en segundo clic"

requirements-completed: [HIST-04, HIST-05]

duration: 5min
completed: "2026-04-16"
---

# Phase 05 Plan 03: Flujo Effacer tout (2 pasos + timeout 3s) + Estado Vacío Summary

**Botón "Effacer tout" con flujo de confirmación de 2 pasos (clearStep mutex + setTimeout 3s + clearTimeout) y estado vacío de Historique con SVG clipboard y CTA a #estimer.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-16T16:35:00Z
- **Completed:** 2026-04-16T16:40:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Flujo de 2 pasos implementado dentro de `Historique.init()`: primer clic → `.btn-danger` + texto "Confirmer ?", segundo clic → `History.clear()` + `Historique.render()`
- Timeout 3s con `clearTimeout(clearTimer)` previene Pitfall 4 (race condition entre timeout y confirmación)
- Variable `clearStep` actúa como mutex (T-05-03-01): no hay forma de ejecutar `History.clear()` dos veces con un solo clic
- SVG genérico reemplazado por SVG clipboard (rect + 3 lines) con `opacity:0.4` — visualmente representativo de "historial vacío"
- Cero usos de `window.confirm()` en el archivo (verificado)

## Task Commits

1. **Task 1: Flujo 2 pasos Effacer tout + SVG estado vacío** - `9b3dffb` (feat)

**Plan metadata:** pendiente de commit docs

## Flujo del botón (pseudocódigo)

```
clearStep = 0  // mutex inicial

clic en clearBtn:
  si clearStep === 0:
    clearStep = 1
    btn → .btn-danger, texto = I18n.t('historique.confirm_clear')
    clearTimer = setTimeout(reset_a_normal, 3000)

  si clearStep === 1:
    clearTimeout(clearTimer)   // ← Pitfall 4 prevenido
    clearTimer = null
    clearStep = 0
    History.clear()
    btn → .btn-outline-sm, texto = I18n.t('historique.clear')
    Historique.render()        // ← oculta btn si historial vacío
```

## Estados del botón

| Estado | Clase CSS | Texto i18n |
|--------|-----------|------------|
| Normal | `.btn-outline-sm` | `historique.clear` → "Effacer tout" |
| Confirmar | `.btn-danger` | `historique.confirm_clear` → "Confirmer ?" |
| Oculto | `hidden` | — (cuando historial vacío, gestionado por `render()`) |

## Pitfall 4 — clearTimeout

`clearTimeout(clearTimer)` se llama en el paso 2 **antes** de ejecutar `History.clear()`. Esto cancela el setTimeout pendiente de 3s. Si no se cancelara, el timeout dispararía después del borrado y actualizaría el texto del botón innecesariamente (aunque sin daño visible). El patrón `clearTimer = null` después de `clearTimeout` es defensivo — `clearTimeout(null)` es un no-op en todos los navegadores, pero hace explícita la intención.

## Files Created/Modified

- `index.html` — Dos cambios:
  1. Líneas 1950–1982: bloque de lógica `clearStep/clearTimer` dentro de `Historique.init()`
  2. Líneas 903–908: SVG clipboard reemplaza SVG círculo+cruz genérico en `#history-empty`

## Decisions Made

- Insertar la lógica del botón dentro de `Historique.init()` (no como función global) para mantener las variables `clearStep` y `clearTimer` en el scope de closure — sin contaminación del scope global
- SVG clipboard elegido sobre SVG reloj porque el clipboard con líneas vacías comunica mejor "sin entradas registradas"

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito. Las dos modificaciones (lógica JS + SVG) estaban explícitamente especificadas en el plan.

## Known Stubs

None — `Historique.render()` opera sobre `History.getAll()` real (localStorage). El botón CTA navega a `Router.navigate('estimer')` real. No hay datos hardcodeados.

## Threat Flags

None — threats del plan cubiertos:
- T-05-03-01 (Tampering/doble clic): `clearStep` mutex previene doble ejecución de `History.clear()`
- T-05-03-02 (DoS/timeout post-navegación): aceptado — el timeout opera sobre un elemento DOM existente sin errores visibles
- T-05-03-03 (EoP/CTA navigate): aceptado — `Router.navigate('estimer')` es navegación interna segura

## Next Phase Readiness

- HIST-04 (flujo borrado) y HIST-05 (estado vacío) completados
- Plan 05-04 puede proceder: página Comparer con comparación lado a lado de dos estimaciones del historial

---
*Phase: 05-historique-y-comparer*
*Completed: 2026-04-16*
