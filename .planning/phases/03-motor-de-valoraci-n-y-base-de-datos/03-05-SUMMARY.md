---
phase: 03-motor-de-valoracion-y-base-de-datos
plan: 05
subsystem: marketplaces
tags: [javascript, urls, avito, moteur, wandaloo, slug, vanilla-js]
dependency_graph:
  requires: [03-03]
  provides: [Marketplaces.getLinks, Marketplaces._slug]
  affects: [fase-4-estimer]
tech_stack:
  added: []
  patterns: [global-var-pattern, url-slug-normalization, encodeURIComponent-fallback]
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "Wandaloo usa encodeURIComponent con texto original (no slug) — Wandaloo requiere IDs numericos internos para filtrado, no slugs derivables dinamicamente; fallback de busqueda textual es la unica opcion viable sin tabla de IDs"
  - "_slug incluye [ûù] e [ï] ademas del patron base de RESEARCH.md — cobertura ampliada para modelos con mas acentos franceses"
metrics:
  duration: 5min
  completed: "2026-04-12"
  tasks_completed: 1
  files_modified: 1
---

# Phase 03 Plan 05: Modulo Marketplaces — SUMMARY

## One-liner

Modulo `var Marketplaces` con `_slug` (normaliza acentos franceses a ASCII) y `getLinks(make, model, year)` generando URLs de busqueda para Avito.ma, Moteur.ma y Wandaloo.com.

## What Was Built

`var Marketplaces` insertado en `index.html` entre el bloque de tests inline (plan 03-04) y el comentario ROUTER. Expone dos metodos:

- `_slug(str)`: normaliza texto a slug URL-safe (minusculas, espacios a guion, acentos FR a ASCII)
- `getLinks(make, model, year)`: retorna objeto con tres URLs de busqueda

Patrones de URL implementados:
- **Avito.ma**: `/sp/voitures/{slug-marca}-{slug-modelo}-{ano}` — patron verificado (RESEARCH.md lines 592-598)
- **Moteur.ma**: `/fr/voiture/achat-voiture-occasion/marque/{slug}/modele/{slug}/` — parcialmente verificado
- **Wandaloo**: `?q={encodeURIComponent(make + ' ' + model + ' ' + year)}` — fallback textual (IDs internos no derivables)

## Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 03-05-T1 | Implementar var Marketplaces con _slug y getLinks | 9be69e2 | index.html |

## Verification Results

Todos los acceptance criteria validados via Node.js:

| Check | Result |
|-------|--------|
| `typeof Marketplaces.getLinks === 'function'` | PASS |
| `typeof Marketplaces._slug === 'function'` | PASS |
| `_slug('Classe C') === 'classe-c'` | PASS |
| `_slug('Série 3') === 'serie-3'` | PASS |
| `getLinks('Dacia', 'Logan', 2019)` retorna 3 propiedades | PASS |
| URL avito contiene `dacia-logan-2019` | PASS |
| URL moteur contiene `dacia/modele/logan` | PASS |
| URL wandaloo contiene `Dacia%20Logan%202019` | PASS |
| Ninguna URL vacia | PASS |

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito.

La unica diferencia menor: `_slug` en RESEARCH.md (lineas 301-330) solo incluia `[û]` mientras el plan 03-05 especificaba `[ûù]` e `[ï]`. Se siguio la especificacion del plan (cobertura ampliada), no el patron del RESEARCH.md.

## Known Stubs

None — `Marketplaces.getLinks` genera URLs reales con los parametros recibidos. Sera consumido por Fase 4 (pagina Estimer) al mostrar links de referencia tras una valoracion.

## Threat Flags

Ninguna superficie nueva. El modulo genera strings de URL en cliente sin peticiones de red ni procesamiento de input libre de usuario (en Fase 3 los valores vienen de CAR_DB keys predefinidos, per T-03-07 aceptado).

## Self-Check

Archivos creados/modificados:
- `index.html` — FOUND

Commits:
- `9be69e2` — feat(03-05): implementar var Marketplaces con _slug y getLinks

## Self-Check: PASSED
