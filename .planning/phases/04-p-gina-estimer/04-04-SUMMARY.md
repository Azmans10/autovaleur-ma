---
phase: 04-p-gina-estimer
plan: "04"
subsystem: frontend-spa
tags: [breakdown, tabla-desglose, i18n, css, factor-colors, renderBreakdown]
dependency_graph:
  requires:
    - 04-01: CSS .breakdown-table, .factor-up, .factor-down, .factor-neutral, custom properties --accent/--danger/--text-muted
    - 04-02: renderResult() con guard typeof renderBreakdown === 'function'
    - 04-03: #result-section con placeholder comentario para 04-04
    - 02: I18n.t(), STRINGS.fr, STRINGS.ar
    - 02: formatPrice()
    - 03: Engine.estimate().breakdown (array de 7 objetos)
  provides:
    - index.html: HTML <table class="breakdown-table"> con <tbody id="breakdown-body"> en #result-section
    - index.html: var BREAKDOWN_KEYS con 7 claves i18n (result.breakdown.base a .transmission)
    - index.html: function renderBreakdown(breakdown) con logica de colores por indice
    - index.html: margin-top: var(--sp-sm) completado en .breakdown-table CSS
  affects:
    - 04-05: marketplace chips se insertaran como siguiente hijo de #result-section (antes del boton)
tech_stack:
  added: []
  patterns:
    - Guard `if (!tbody) return` para robustez ante DOM no listo
    - Mapeo indice→clave i18n via array BREAKDOWN_KEYS en lugar de usar breakdown[i].label
    - Simbolo Unicode U+00D7 (x multiplicacion) para factores
    - Clase de color determinada por indice: [0] siempre neutral, [i>0] up/down segun factor
key_files:
  modified:
    - index.html
decisions:
  - "CSS .breakdown-table y clases .factor-* ya insertados por wave anterior (Plan 04-01) — solo faltaba margin-top: var(--sp-sm) que se completo en Task 1"
  - "Cadenas result.breakdown.* ya existian en STRINGS.fr y STRINGS.ar (insertadas por wave anterior) — Task 2 solo añadio el JS"
  - "BREAKDOWN_KEYS insertado dentro del DOMContentLoaded (no como global) — consistente con el patron de los demas modulos del archivo"
metrics:
  duration: "8min"
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_modified: 1
---

# Phase 4 Plan 04: Tabla de desglose — Summary

**One-liner:** Tabla de desglose de 7 filas con colores factor-up/down/neutral renderizada dinamicamente via renderBreakdown() usando BREAKDOWN_KEYS para i18n FR+AR.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | HTML de la tabla de desglose + CSS de colores factor | d77fef7 | index.html |
| 2 | var BREAKDOWN_KEYS + funcion renderBreakdown() + cadenas i18n result.breakdown.* | 5211926 | index.html |

## What Was Built

### Task 1 — HTML + CSS (d77fef7)

Reemplazado el comentario placeholder `<!-- tabla de desglose: PENDIENTE — lo añade Plan 04-04 -->` por el HTML real:

```html
<div class="card" style="margin-bottom: var(--sp-md);">
  <h3 data-i18n="result.breakdown.title">Détail du calcul</h3>
  <table class="breakdown-table">
    <thead>
      <tr>
        <th data-i18n="result.breakdown.col.label">Facteur</th>
        <th data-i18n="result.breakdown.col.factor">Coeff.</th>
        <th data-i18n="result.breakdown.col.amount">Montant</th>
      </tr>
    </thead>
    <tbody id="breakdown-body"></tbody>
  </table>
</div>
```

CSS completado: añadido `margin-top: var(--sp-sm)` a `.breakdown-table` (el resto del CSS ya existia desde Plan 04-01).

### Task 2 — JS (5211926)

Insertado dentro del DOMContentLoaded, antes del `console.log` de cierre:

- `var BREAKDOWN_KEYS` — array de 7 claves i18n indexadas por posicion del breakdown
- `function renderBreakdown(breakdown)` — itera sobre el array, determina clase de color, inserta filas vía `createElement('tr')` + `innerHTML`
- Las cadenas `result.breakdown.*` en STRINGS.fr y STRINGS.ar ya existian (insertadas por el agente de wave anterior en Plan 04-01)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] margin-top faltante en .breakdown-table**
- **Found during:** Task 1, inspeccion del CSS existente
- **Issue:** El CSS de `.breakdown-table` insertado por wave anterior no incluia `margin-top: var(--sp-sm)` que el plan especificaba. Sin ello, la tabla queda pegada al titulo `<h3>`.
- **Fix:** Añadido `margin-top: var(--sp-sm)` a la regla `.breakdown-table`.
- **Files modified:** index.html
- **Commit:** d77fef7

## Known Stubs

- `<tbody id="breakdown-body"></tbody>` — vacio en el HTML inicial; se rellena dinamicamente por `renderBreakdown()` tras cada submit valido. Este es el comportamiento esperado.

## Threat Flags

Ninguno. Las mitigaciones del threat model estan cubiertas:
- T-04-04-01 (XSS via innerHTML): Los valores insertados son `I18n.t()` (string de STRINGS controlado), `row.factor.toFixed(2)` (numero, no string externo), `formatPrice()` (string numerico formateado). Sin input de usuario directo en el innerHTML.
- T-04-04-02 (breakdown malformado): Guard `if (!tbody) return` al inicio; `breakdown.forEach` solo itera si breakdown es array valido.

## Self-Check

Files:
- [x] index.html modificado

Commits:
- [x] d77fef7 — HTML tabla + CSS margin-top
- [x] 5211926 — BREAKDOWN_KEYS + renderBreakdown()

Verificaciones:
- [x] `id="breakdown-body"` existe en index.html — linea 781
- [x] `.breakdown-table` con `margin-top: var(--sp-sm)` — linea 576
- [x] `.factor-up`, `.factor-down`, `.factor-neutral` con colores correctos — lineas 598-611
- [x] `var BREAKDOWN_KEYS` con 7 claves — linea 1826
- [x] `function renderBreakdown` — linea 1836
- [x] `result.breakdown.base` en STRINGS.fr — linea 924
- [x] `result.breakdown.base` en STRINGS.ar — linea 991 (unicode \u0627\u0644\u0633\u0639\u0631...)

## Self-Check: PASSED
