---
phase: 04-p-gina-estimer
plan: "01"
subsystem: frontend-spa
tags: [formulario, estimer, i18n, cascada, css, pwa]
dependency_graph:
  requires:
    - 03: CAR_DB (var CAR_DB con marcas/modelos/años)
    - 03: DEPRECIATION (claves ciudad sin acento)
    - 02: I18n (STRINGS, I18n.t, data-i18n)
    - 01: Router, CSS custom properties, .btn-primary
  provides:
    - index.html: formulario completo #estimer-form con 8 campos
    - index.html: var EstimerForm con cascada Marca→Modelo→Año
    - index.html: clases CSS .form-group, .result-section, .breakdown-table, .marketplace-chip
    - index.html: 64 claves i18n nuevas en STRINGS.fr y STRINGS.ar
  affects:
    - 04-02: submit handler y validación km usarán #estimer-form, #btn-estimer, #mileage-error
    - 04-03: resultado usará #result-section, .result-section.visible, .result-price-card
    - 04-04: breakdown usará .breakdown-table, .factor-up/.factor-down/.factor-neutral
    - 04-05: marketplace chips usarán .marketplace-chips, .marketplace-chip
tech_stack:
  added: []
  patterns:
    - Selects en cascada con populate functions (no framework)
    - CSS logical properties para RTL (padding-inline-*, background-position LTR/RTL)
    - appearance:none + SVG data-URI para estilo consistente cross-browser en selects
key_files:
  modified:
    - index.html
decisions:
  - "CSS de resultado/breakdown/marketplace definido en plan 04-01 para evitar problemas de orden de declaración — el HTML correspondiente llega en 04-02 a 04-05"
  - "City option values usan claves sin acento (Fes, Meknes, Tetouan) para coincidir exactamente con claves de DEPRECIATION en Engine"
  - "var EstimerForm declarado antes de const ROUTES para mantener orden de inicialización correcto"
metrics:
  duration: "12min"
  completed_date: "2026-04-13"
  tasks_completed: 3
  files_modified: 1
---

# Phase 4 Plan 01: Formulario Estimer — Summary

**One-liner:** Formulario de 8 campos en #page-estimer con selects en cascada (Marca→Modelo→Año) desde CAR_DB, valores por defecto (bon/diesel/manuelle/Casablanca), CSS centralizado y 64 claves i18n FR+AR.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | CSS del formulario — nuevas clases en el bloque `<style>` | d573a40 | index.html |
| 2 | Cadenas i18n del formulario — añadir a STRINGS.fr y STRINGS.ar | fd18d8b | index.html |
| 3 | HTML del formulario y JS de cascada en `<section id="page-estimer">` | 859976f | index.html |

## What Was Built

### Task 1 — CSS (d573a40)
Inserción de 198 líneas de CSS antes del cierre `</style>`:
- `.form-group` con label, select e input[type=number] estilizados
- Soporte RTL completo: `[dir="rtl"] .form-group select` con `background-position: left` y `padding-inline-*`
- Estados: `:focus` (border-color primary), `:disabled` (surface-3 opacidad 0.7), `#btn-estimer:disabled` (opacidad 0.45)
- Spinner oculto en inputs numéricos (`-webkit-appearance: none`, `-moz-appearance: textfield`)
- `.result-section` con animación de entrada (opacity + translateY)
- `.breakdown-table` con `text-align: start` (logical property)
- `.marketplace-chip` con hover/focus states

### Task 2 — i18n (fd18d8b)
64 claves nuevas (32 FR + 32 AR) en STRINGS:
- `estimer.form.*` — 10 claves (labels y placeholders de los 8 campos + error km)
- `estimer.condition.*` — 5 valores (excellent/bon/moyen/mauvais/accidente)
- `estimer.fuel.*` — 5 valores (diesel/essence/hybride/electrique/gpl)
- `estimer.transmission.*` — 2 valores (manuelle/automatique)
- `estimer.city.*` — 10 ciudades marroquíes + autres
- `result.*` — 14 claves (precio estimado, rango, tabla desglose, marketplace, nueva estimación)

### Task 3 — HTML + JS (859976f)
- Reemplazado placeholder `<p>Formulaire d'estimation — Phase 4</p>` con formulario completo
- 8 grupos `.form-group`: Marca (cascada), Modelo (cascada, disabled inicial), Año (cascada, disabled inicial), Kilométrage (input number), Estado (select, default: bon), Carburant (select, default: diesel), Transmisión (select, default: manuelle), Ville (select, default: Casablanca)
- `<span id="mileage-error" hidden>` para error de validación (se activa en plan 04-02)
- `<div id="result-section" hidden>` — contenedor vacío para resultado (planes 04-02 a 04-05)
- `var EstimerForm` con 4 funciones: `_populateMakes()`, `_populateModels(make)`, `_populateYears(make, model)`, `_updateSubmitState()`
- `EstimerForm.init()` añadido a DOMContentLoaded junto a I18n.init() y Router.init()

## Deviations from Plan

None — plan ejecutado exactamente como escrito.

## Known Stubs

- `<div id="result-section" hidden></div>` — contenedor vacío intencionalmente. El HTML del resultado se añade en planes 04-02 (submit + validación), 04-03 (precio estimado), 04-04 (tabla desglose) y 04-05 (marketplace chips). El stub es estructural, no afecta el objetivo de este plan (formulario + cascada).

## Threat Flags

Ninguno. Las superficies de seguridad identificadas en el threat model del plan están cubiertas:
- T-04-01-01 (validación km): delegada explícitamente a plan 04-02 — el campo existe pero la validación se implementa en submit
- T-04-01-02 (enums selects): values son enums fijos en HTML, Engine.estimate() rechazará valores no reconocidos
- T-04-01-03 (localStorage i18n): gestionado por I18n existente con fallback a 'fr'

## Self-Check

Files:
- [x] index.html modified (verified via node assertions)

Commits:
- [x] d573a40 — CSS formulario
- [x] fd18d8b — i18n strings
- [x] 859976f — HTML + JS cascada

## Self-Check: PASSED
