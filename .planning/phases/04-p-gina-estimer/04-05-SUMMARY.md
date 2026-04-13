---
phase: 04-p-gina-estimer
plan: "05"
subsystem: frontend-spa
tags: [marketplaces, chips, i18n, css-logical-properties, estimer, resultado]
dependency_graph:
  requires:
    - 04-01: CSS .marketplace-chip skeleton, custom properties --primary/--surface-3/--border/--radius-lg
    - 04-02: renderResult() con guard typeof renderMarketplaces === 'function', handler #btn-new-estimate
    - 04-03: #result-section con placeholder para chips
    - 04-04: bloque CSS .factor-neutral como punto de insercion del comentario MARKETPLACE CHIPS
    - 03: Marketplaces.getLinks(make, model, year) — función de Fase 3
    - 02: STRINGS.fr, STRINGS.ar, data-i18n
  provides:
    - index.html: HTML #marketplace-section con 3 anchors (#link-avito, #link-moteur, #link-wandaloo)
    - index.html: CSS .marketplace-section/.marketplace-chips/.marketplace-chip con propiedades logicas
    - index.html: function renderMarketplaces(make, model, year) que llama Marketplaces.getLinks()
    - index.html: ocultamiento de #marketplace-section en handler #btn-new-estimate
    - index.html: cadenas result.marketplace.label en STRINGS.fr y STRINGS.ar (ya existian desde 04-01)
  affects:
    - Fase 4 completada — todos los componentes de #result-section implementados
tech_stack:
  added: []
  patterns:
    - CSS logical properties para internacionalizacion RTL (margin-block, padding-block, padding-inline, min-inline-size)
    - Guard typeof === 'function' para integracion progresiva entre planes
    - hidden attribute nativo para control de visibilidad (consistente con D-15)
    - rel="noopener" en todos los anchors target="_blank" (T-04-05-02)
key_files:
  modified:
    - index.html
decisions:
  - "CSS .marketplace-section actualizado a margin-block (en lugar de margin-top/margin-bottom) y .marketplace-chip a padding-block/padding-inline/min-inline-size — requerido por UI-03 (propiedades logicas)"
  - "Cadenas result.marketplace.label ya existian en STRINGS.fr y STRINGS.ar desde wave anterior (Plan 04-01) — no fue necesario insertar nuevas cadenas"
  - "renderMarketplaces() insertada dentro del DOMContentLoaded consistentemente con el patron de renderBreakdown()"
metrics:
  duration: "6min"
  completed_date: "2026-04-13"
  tasks_completed: 2
  files_modified: 1
requirements:
  - EST-07
  - UI-01
  - UI-03
---

# Phase 4 Plan 05: Chips de Marketplaces — Summary

**One-liner:** Sección #marketplace-section con 3 anchors (Avito/Moteur/Wandaloo) de pills CSS con propiedades lógicas RTL, función renderMarketplaces() conectada a Marketplaces.getLinks(), y reset limpio al pulsar "Nouvelle estimation".

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | HTML de chips de marketplaces + CSS de pills con propiedades lógicas | ca0a5c3 | index.html |
| 2 | función renderMarketplaces() + ocultar marketplace en reset + cadenas i18n | 69ebd31 | index.html |

## What Was Built

### Task 1 — HTML + CSS (ca0a5c3)

Reemplazado el comentario placeholder `<!-- chips de marketplaces: PENDIENTE — lo añade Plan 04-05 -->` por el HTML real:

```html
<div id="marketplace-section" class="marketplace-section" hidden>
  <p class="marketplace-label" data-i18n="result.marketplace.label">Voir les annonces</p>
  <div class="marketplace-chips">
    <a id="link-avito"    class="marketplace-chip" href="#" target="_blank" rel="noopener">Avito</a>
    <a id="link-moteur"   class="marketplace-chip" href="#" target="_blank" rel="noopener">Moteur</a>
    <a id="link-wandaloo" class="marketplace-chip" href="#" target="_blank" rel="noopener">Wandaloo</a>
  </div>
</div>
```

CSS actualizado a propiedades lógicas (UI-03):
- `.marketplace-section`: `margin-block: var(--sp-lg)` (antes: margin-top + margin-bottom separados)
- `.marketplace-chip`: `padding-block: var(--sp-sm)`, `padding-inline: var(--sp-md)`, `min-inline-size: 80px` (antes: padding shorthand + min-width)

### Task 2 — JS + Reset (69ebd31)

Función `renderMarketplaces(make, model, year)` insertada dentro del DOMContentLoaded, después de `renderBreakdown()`:

- Llama `Marketplaces.getLinks(make, model, year)` para obtener URLs de los 3 marketplaces
- Asigna `links.avito`, `links.moteur`, `links.wandaloo` a los atributos `href` de los anchors correspondientes
- Quita `hidden` de `#marketplace-section` para mostrar los chips

Handler de `#btn-new-estimate` actualizado: añadida línea que pone `hidden = true` en `#marketplace-section` antes de la animación de ocultamiento del resultado (D-15).

Las cadenas `result.marketplace.label` en `STRINGS.fr` ('Voir les annonces similaires') y `STRINGS.ar` ('عرض إعلانات مماثلة') ya existían desde el agente de la wave anterior (Plan 04-01) — no fue necesario insertar nuevas cadenas.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] CSS con propiedades lógicas — actualización requerida por UI-03**
- **Found during:** Task 1, inspección del CSS existente de .marketplace-chip
- **Issue:** El CSS skeleton insertado por wave anterior (Plan 04-01) usaba `padding: var(--sp-sm) var(--sp-md)` (shorthand estándar) y `min-width: 80px` — propiedades físicas. El plan 04-05 specifica explícitamente `padding-block`, `padding-inline` y `min-inline-size` (UI-03). Sin el cambio, el diseño no respeta las propiedades lógicas para RTL.
- **Fix:** Reemplazados con `padding-block: var(--sp-sm)`, `padding-inline: var(--sp-md)`, `min-inline-size: 80px`. También `.marketplace-section` actualizada de `margin-top + margin-bottom` a `margin-block`.
- **Files modified:** index.html
- **Commit:** ca0a5c3

## Known Stubs

Ninguno. Los 3 anchors tienen `href="#"` como valor inicial en el HTML estático, pero `renderMarketplaces()` los reemplaza con URLs reales en cada submit. Este es el comportamiento de diseño esperado (datos dinámicos).

## Threat Flags

Ninguno. Todas las mitigaciones del threat model están cubiertas:
- T-04-05-01 (Tampering anchor.href): Las URLs vienen de `Marketplaces.getLinks()` que procesa strings de `CAR_DB` (datos controlados del código) — ningún input de usuario se inyecta directamente sin normalización.
- T-04-05-02 (target="_blank" sin rel): Todos los anchors incluyen `rel="noopener"` — implementado en el HTML (líneas 789-791).
- T-04-05-03 (Open redirect): Los dominios están hardcodeados en `Marketplaces` (avito.ma, moteur.ma, wandaloo.com) — sin parametrización por input.

## Self-Check

Files:
- [x] index.html modificado

Commits:
- [x] ca0a5c3 — HTML #marketplace-section + CSS propiedades lógicas
- [x] 69ebd31 — renderMarketplaces() + reset handler + i18n verificadas

Verificaciones:
- [x] `id="link-avito"` existe en index.html — línea 789
- [x] `id="link-moteur"` existe en index.html — línea 790
- [x] `id="link-wandaloo"` existe en index.html — línea 791
- [x] `#marketplace-section` tiene atributo `hidden` — línea 786
- [x] `rel="noopener"` en todos los anchors — líneas 789-791
- [x] `margin-block: var(--sp-lg)` en .marketplace-section — línea 614
- [x] `padding-block` y `padding-inline` en .marketplace-chip — líneas 633-634
- [x] `function renderMarketplaces` — línea 1869
- [x] `Marketplaces.getLinks` llamado dentro de renderMarketplaces — línea 1870
- [x] `marketplaceSection.hidden = true` en handler reset — línea 1824
- [x] `result.marketplace.label` en STRINGS.fr — línea 939
- [x] `result.marketplace.label` en STRINGS.ar — línea 1006

## Self-Check: PASSED
