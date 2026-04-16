---
phase: 05-historique-y-comparer
plan: "04"
subsystem: comparer-ui
tags: [comparer, selects, history, two-cards, xss-prevention, hashchange, pitfall-7, empty-state, css-logical-properties]

dependency_graph:
  requires:
    - phase: 05-01
      provides: "History.getAll(), claves i18n comparer.*, módulo formatPrice"
    - phase: 05-03
      provides: "Patrón de init/render en Historique, estilos .form-group select, .btn-primary, .empty-state"
  provides:
    - "Página #page-comparer funcional con dos selects poblados desde History.getAll()"
    - "Módulo var Comparer con init(), render(), _onSelectChange(), renderComparison()"
    - "CSS .compare-card, .compare-winner, .compare-bar-track, .compare-bar, .badge"
    - "Re-población automática de selects en hashchange (Pitfall 7 prevenido)"
  affects: [index.html]

tech-stack:
  added: []
  patterns: [select-repopulate-on-hashchange, textcontent-xss-prevention, same-id-guard, empty-state-with-cta]

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "textContent en lugar de innerHTML para poblar opciones de los selects — previene XSS con datos de usuario (make, model, year) almacenados en localStorage"
  - "Guard idA === idB en _onSelectChange() previene renderizar comparación cuando el mismo coche se selecciona en ambos selects"
  - "Comparer.render() re-pobla los selects en cada hashchange — Pitfall 7 prevenido (selects desincronizados con historial real)"
  - "renderComparison() usa createElement/textContent exclusivamente — cero innerHTML con datos de usuario en el módulo Comparer"
  - "barras de precio (.compare-bar) insertadas con width=0% como placeholder — la lógica de relación precio/km se implementa en 05-05"

requirements-completed: [COMP-01, COMP-02, COMP-05]

duration: 8min
completed: "2026-04-16"
---

# Phase 05 Plan 04: Página Comparer — Selects + módulo var Comparer + CSS compare-card Summary

**Página #page-comparer completa con dos selects poblados desde History.getAll(), estado orientativo cuando hay menos de 2 valoraciones, módulo var Comparer con init/render/renderComparison, y CSS de tarjetas de comparación con CSS logical properties.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-16T16:12:00Z
- **Completed:** 2026-04-16T16:20:53Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Stub `#page-comparer` (2 líneas) reemplazado por estructura completa: estado vacío con SVG + CTA, bloque de selects con labels i18n, div `#comparer-result`
- Módulo `var Comparer` con 4 métodos: `init()` (listeners + render inicial), `render()` (lógica de estado vacío vs. selects + re-población), `_onSelectChange()` (validación y lookup), `renderComparison()` (layout de 2 tarjetas)
- CSS `=== Comparer ===` añadido: `.compare-grid`, `.compare-card`, `.compare-winner`, `.compare-card__label`, `.compare-card__title`, `.compare-card__price`, `.compare-card__meta`, `.compare-bar-track`, `.compare-bar`, `.badge`
- `Comparer.init()` añadido en DOMContentLoaded junto a los demás módulos
- Re-render de Comparer en `hashchange` cuando `location.hash === '#comparer'` — Pitfall 7 prevenido

## Task Commits

1. **Task 1: HTML #page-comparer + módulo var Comparer + CSS compare-card** - `9c42511` (feat)

## HTML insertado en #page-comparer (líneas ~995–1032)

| Elemento | ID | Función |
|----------|-----|---------|
| `div#comparer-empty` | `comparer-empty` | Estado vacío (hidden por defecto), con SVG columnas, texto i18n, botón CTA |
| `button#btn-comparer-cta` | `btn-comparer-cta` | Navega a `#estimer` desde estado vacío |
| `div#comparer-controls` | `comparer-controls` | Wrapper de los dos selects (hidden por defecto) |
| `select#select-car-a` | `select-car-a` | Select vehículo A — primer hijo `<option value="">` (placeholder) |
| `select#select-car-b` | `select-car-b` | Select vehículo B — primer hijo `<option value="">` (placeholder) |
| `div#comparer-result` | `comparer-result` | Área donde se inyectan las tarjetas de comparación |

## Clases CSS creadas (líneas 750–819)

| Clase | Propósito clave |
|-------|----------------|
| `.compare-grid` | `display:flex; flex-wrap:wrap; gap:var(--sp-md)` — contenedor de las dos tarjetas |
| `.compare-card` | `flex:1; position:relative; border:2px solid var(--border)` — tarjeta base |
| `.compare-winner` | `border-color: var(--accent)` — aplica al ganador (lógica en 05-05) |
| `.compare-card__label` | Etiqueta "A" / "B" en mayúsculas con `letter-spacing` |
| `.compare-card__title` | Nombre del coche (`font-size-lg; font-weight:600`) |
| `.compare-card__price` | Precio estimado (`font-size-2xl; color:var(--primary)`) |
| `.compare-card__meta` | Kilometraje en `fr-FR` format |
| `.compare-bar-track` | Track gris de la barra de precio (`height:12px; overflow:hidden`) |
| `.compare-bar` | Barra de precio con `transition:width 0.3s ease` (width calculado en 05-05) |
| `.badge` | Badge verde "Meilleur rapport" con `inset-inline-end` (CSS logical property) |

## Módulo var Comparer — 4 métodos (líneas 2172–2344)

| Método | Descripción |
|--------|-------------|
| `init()` | Registra listener CTA, listeners change en ambos selects, llama `render()` |
| `render()` | Evalúa `History.getAll().length < 2` → empty/controls; re-puebla selects; restaura selección previa; llama `_onSelectChange()` |
| `_onSelectChange()` | Valida `idA && idB && idA !== idB`; hace lookup en History; llama `renderComparison()` |
| `renderComparison(entryA, entryB)` | Crea `.compare-grid` con 2 `.compare-card` usando createElement/textContent; inserta barras placeholder |

## Líneas exactas en index.html

- CSS `.compare-*` y `.badge`: líneas 743–819
- HTML `#page-comparer`: líneas 993–1032
- Módulo `var Comparer`: líneas 2169–2344
- `Comparer.init()` en DOMContentLoaded: línea 2430
- Re-render en hashchange: líneas 2404–2407

## Decisions Made

- `textContent` para labels de opciones (`entry.make + entry.model + year + precio`) — los datos provienen de localStorage (entrada de usuario) y deben escaparse para prevenir XSS
- Guard `idA === idB` implementado en `_onSelectChange()` — evita comparar un coche consigo mismo
- `Comparer.render()` re-pobla siempre al llamar (no cachea) — garantiza sincronización con historial real al navegar
- Barras de precio con `width='0%'` y `data-price` attribute — interface contract para 05-05 que leerá ese atributo para calcular porcentajes relativos

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito. Los 5 pasos (A HTML, B CSS, C módulo, D DOMContentLoaded, E hashchange) se implementaron según spec.

## Known Stubs

- `.compare-bar` insertado con `width='0%'` — las barras proporcionales se calculan en 05-05 (plan siguiente). El stub es intencional y explícito en el plan: `// Se calculará en 05-05`
- `.compare-winner` CSS definido pero no aplicado en este plan — la lógica de ganador (precio/km) es responsabilidad de 05-05

## Threat Flags

None — threats del plan cubiertos:
- T-05-04-01 (XSS injection via entry.make/model): `optA.textContent = label` — textContent escapa HTML automáticamente
- T-05-04-02 (Tampering via select.value): `String(e.id) === String(idA)` — comparación segura de strings
- T-05-04-03 (Spoofing/desincronización de selects): `Comparer.render()` en hashchange re-pobla siempre desde localStorage actual

## Next Phase Readiness

- COMP-01 (selects poblados desde historial) completado
- COMP-02 (layout lado a lado) completado — layout base sin barras funcionales
- COMP-05 (estado orientativo con CTA) completado
- Plan 05-05 puede proceder: lógica de barras de precio relativas y badge "Meilleur rapport" al ganador

---
*Phase: 05-historique-y-comparer*
*Completed: 2026-04-16*
