---
phase: "01"
plan: "02"
subsystem: "router"
tags: [spa, hash-routing, navigation, vanilla-js]
dependency_graph:
  requires: ["01-01"]
  provides: ["hash-router", "spa-navigation"]
  affects: ["index.html"]
tech_stack:
  added: []
  patterns: ["hash-routing con hashchange", "object literal como router", "hidden attribute para show/hide"]
key_files:
  created: []
  modified: ["index.html"]
decisions:
  - "location.hash= en lugar de location.replace() para preservar historial del browser"
  - "addEventListener en init() en lugar de onclick inline para evitar doble navegación"
  - "Objeto ROUTES para mapeo hash→pageId con fallback seguro a 'estimer'"
metrics:
  duration: "5 min"
  completed: "2026-04-11T08:48:25Z"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 01 Plan 02: Hash Router SPA Summary

Hash router vanilla JS con hashchange listener, objeto ROUTES, y `hidden` nativo para navegación SPA entre 3 páginas sin recarga.

## What Was Built

Implementado el sistema de navegación SPA de AutoValeur MA dentro del bloque `<script>` de `index.html`. El router reemplaza el placeholder del plan 01-01 con lógica completa de hash routing.

Componentes implementados:

- **`ROUTES`** — objeto que mapea strings de hash a IDs de sección, con fallback a `'estimer'` para hashes vacíos o no reconocidos
- **`Router.navigate(page)`** — cambia `location.hash` (no `replace`) para añadir entrada al historial del browser
- **`Router._show()`** — oculta todas las `.page` con `hidden = true`, luego muestra la sección activa; actualiza clase `active` en botones de nav
- **`Router.init()`** — registra listener `hashchange` para botón Atrás, conecta botones de nav con `addEventListener`, y llama `_show()` para el estado inicial
- **`DOMContentLoaded`** — dispara `Router.init()` cuando el DOM está listo, garantizando que las secciones y botones ya existen

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Reemplazar script placeholder con router completo | 84d1d80 | index.html |

## Decisions Made

1. **`location.hash =` no `location.replace()`** — `replace()` no añade entrada al historial; el botón Atrás no funcionaría. Esta es la diferencia crítica para el comportamiento SPA esperado.

2. **`addEventListener` en `Router.init()`** — conectar los botones mediante JS en lugar de `onclick` inline evita doble navegación si el HTML y el JS estuvieran ambos activos. El plan 01-01 no dejó `onclick` inline, pero el patrón es correcto de todas formas.

3. **Objeto `ROUTES` con fallback** — centraliza el mapeo hash→sección. Hashes no reconocidos caen a `'estimer'` como fallback seguro en lugar de mostrar pantalla en blanco.

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito. Los botones del plan 01-01 no tenían `onclick` inline, por lo que no fue necesario eliminar nada adicional.

## Known Stubs

None — el router está completamente funcional. Las secciones `.page` tienen contenido placeholder (`Phase 4`, `Phase 5`) pero eso es intencional y no afecta el objetivo de este plan (navegación SPA).

## Self-Check

- [x] `index.html` modificado con router completo (lineas 82-166)
- [x] Commit `84d1d80` existe en el historial
- [x] ROUTES cubre los 3 hashes + hash vacío
- [x] `hashchange` listener activo para botón Atrás
- [x] `DOMContentLoaded` inicializa correctamente
