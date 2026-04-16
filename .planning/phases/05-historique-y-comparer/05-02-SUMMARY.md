---
phase: 05-historique-y-comparer
plan: "02"
subsystem: historique-ui
tags: [historique, history-cards, render, i18n, XSS-safe, hashchange]
dependency_graph:
  requires: [05-01]
  provides: [Historique.render, Historique.init, formatRelativeDate, history-card-ui]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [textContent-XSS-safe, dataset-id-numeric, logical-css-properties, empty-state-pattern]
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "Re-render de Historique enganchado al hashchange existente del Router (no listener separado) para evitar duplicación de listeners"
  - "formatRelativeDate como función global (no método del módulo) para coherencia con formatPrice existente"
  - "Botón × usa Number(this.dataset.id) para convertir el string del data-attribute antes de pasar a History.remove(id) con comparación ===)"
metrics:
  duration: "~8min"
  completed_date: "2026-04-16T16:30:00Z"
  tasks_completed: 1
  files_modified: 1
requirements_satisfied: [HIST-01, HIST-02, HIST-03]
---

# Phase 05 Plan 02: #page-historique UI — Tarjetas + Render + Eliminación Summary

**One-liner:** Página Historique completa con tarjetas `.history-card` (título/precio/meta), módulo `var Historique` con `render()` XSS-safe, eliminación individual via botón ×, y re-render automático en hashchange.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | HTML #page-historique + CSS .history-card + módulo Historique | 3e5c49d | index.html |

## What Was Built

### HTML de #page-historique — línea 893 de index.html

Estructura completa que reemplaza el stub anterior:

```html
<section id="page-historique" class="page" hidden>
  <!-- Cabecera: título h1 + botón Effacer tout (oculto si vacío) -->
  <div class="page-header" style="...margin-block-end...">
    <h1 data-i18n="nav.historique"></h1>
    <button id="btn-clear-history" class="btn-outline-sm" hidden></button>
  </div>
  <!-- Empty state: SVG + texto i18n + botón CTA -->
  <div id="history-empty" class="empty-state" hidden>...</div>
  <!-- Lista de tarjetas -->
  <div id="history-list" role="list" hidden></div>
</section>
```

### Clases CSS añadidas — líneas 404–491 de index.html

| Clase | Propiedades clave |
|-------|-------------------|
| `.history-card` | `flex-direction:column`, `gap:var(--sp-xs)`, `margin-block-end:var(--sp-sm)` |
| `.history-card__header` | `display:flex`, `justify-content:space-between` |
| `.history-card__title` | `font-size:var(--font-size-lg)`, `font-weight:600`, `color:var(--text)` |
| `.history-card__price` | `font-size:var(--font-size-2xl)`, `font-weight:600`, `color:var(--primary)` |
| `.history-card__meta` | `font-size:var(--font-size-sm)`, `color:var(--text-muted)` |
| `.btn-delete` | `min-width:44px`, `min-height:44px`, `margin-inline-start:auto` |
| `.btn-delete:hover` | `background:var(--surface-3)`, `color:var(--danger)` |
| `.btn-outline-sm` | `border:1.5px solid var(--primary)`, transición hover a fondo azul |
| `.btn-danger` | `background:var(--danger)`, `color:white` |

Todas las propiedades de espaciado y posicionamiento usan CSS logical properties (`margin-block-end`, `margin-inline-start`, `padding-block`) para soporte RTL árabe.

### función formatRelativeDate — línea 1928 de index.html

```javascript
function formatRelativeDate(isoString) {
  var days = Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000);
  if (days === 0) return I18n.t('date.today');
  if (days < 7)  return I18n.t('date.days_ago').replace('{n}', days);
  var weeks = Math.floor(days / 7);
  return I18n.t('date.weeks_ago').replace('{n}', weeks);
}
```

Usa las claves i18n `date.today`, `date.days_ago`, `date.weeks_ago` definidas en 05-01.

### Módulo var Historique — línea 1939 de index.html

**Métodos:**

- `init()` — registra listener del botón CTA (`btn-history-cta`) para navegar a Estimer; llama `render()` inicial
- `render()` — obtiene `History.getAll()`, limpia `#history-list` con `container.innerHTML = ''` (seguro — no datos de usuario), crea tarjetas con `createElement` + `textContent` para todos los datos de usuario

**Flujo de eliminación:**
1. Botón × tiene `deleteBtn.dataset.id = entry.id` (string en DOM)
2. Click handler: `History.remove(Number(this.dataset.id))` — conversión explícita a número
3. Llama `Historique.render()` — re-renderiza lista sin reload

**Flujo de re-render en navegación:**
- Añadido en `Router.init()` dentro del listener `hashchange` existente:
  ```javascript
  if (typeof Historique !== 'undefined') Historique.render();
  ```
- Inicializado con `Historique.init()` en `DOMContentLoaded` — línea 2104

### XSS Prevention (T-05-02-01)

Todos los datos de usuario (`entry.make`, `entry.model`, `entry.year`, `entry.mileage`, `entry.estimated_price`) se insertan via `element.textContent` exclusivamente. El `container.innerHTML = ''` es seguro (no incluye datos de usuario). No existe ninguna asignación `innerHTML` con datos provenientes de localStorage.

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito.

## Known Stubs

None — el módulo Historique opera sobre `History.getAll()` real (localStorage). No hay datos hardcodeados ni placeholders en el render.

## Threat Flags

None — todos los threats del plan están mitigados:
- T-05-02-01 (XSS): `entry.make/model/city` insertados exclusivamente via `textContent`
- T-05-02-02 (Tampering): `Number(this.dataset.id)` convierte antes de comparar con `===` en `History.remove`
- T-05-02-03 (Spoofing): `Router.navigate('estimer')` es navegación interna controlada

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| index.html exists | FOUND |
| commit 3e5c49d exists | FOUND |
| `id="history-list"` in index.html | línea 912 |
| `id="history-empty"` in index.html | línea 902 |
| `id="btn-clear-history"` in index.html | línea 898 |
| `.history-card__price` CSS in index.html | línea 428 |
| `var Historique` in index.html | línea 1939 |
| `formatRelativeDate` in index.html | línea 1928 |
| `Historique.init()` in DOMContentLoaded | línea 2104 |
| No `innerHTML` with user data | CONFIRMED (0 matches) |
| `Number(this.dataset.id)` in delete handler | línea 1995 |
| hashchange triggers `Historique.render()` | línea 2082 |
| CSS logical properties used | CONFIRMED |
