---
phase: 06-pulido-y-despliegue
plan: 03
subsystem: infra
tags: [pwa, service-worker, manifest, github-pages, offline]

# Dependency graph
requires:
  - phase: 06-02
    provides: Error UI implementado en index.html
provides:
  - manifest.json con start_url y scope apuntando a /autovaleur-ma/
  - sw.js con PRECACHE_URLS absolutos, CACHE_NAME autovaleur-v2 y fallback offline corregido
  - index.html verificado bajo umbral 400KB sin necesidad de minificación
affects: [06-04, 06-05, deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Paths absolutos en PRECACHE_URLS para Service Workers en GitHub Pages subpath"
    - "CACHE_NAME incrementado para forzar limpieza de cache antiguo con paths relativos"

key-files:
  created: []
  modified:
    - manifest.json
    - sw.js

key-decisions:
  - "Paths absolutos /autovaleur-ma/ en manifest.json y sw.js requeridos para GitHub Pages subpath (D-12)"
  - "CACHE_NAME v2 fuerza limpieza del cache v1 que tenía paths relativos incorrectos (D-13)"
  - "index.html de 124.799 bytes (~122 KB) no requiere minificación per D-08 — umbral 400 KB no alcanzado"

patterns-established:
  - "Service Worker para GitHub Pages subpath: todos los PRECACHE_URLS deben ser paths absolutos con el prefijo del subpath"
  - "Fallback offline del SW también debe usar path absoluto para coincidir con las entradas del cache"

requirements-completed: [PWA-01, PWA-02, PWA-03]

# Metrics
duration: 8min
completed: 2026-04-17
---

# Phase 06 Plan 03: PWA Paths GitHub Pages Summary

**manifest.json y sw.js corregidos con paths absolutos /autovaleur-ma/ y CACHE_NAME v2 para funcionamiento offline correcto en GitHub Pages subpath**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-17T21:20:00Z
- **Completed:** 2026-04-17T21:28:00Z
- **Tasks:** 3
- **Files modified:** 2 (manifest.json, sw.js)

## Accomplishments

- manifest.json: start_url y scope actualizados de `./` a `/autovaleur-ma/` — el scope del SW ahora coincide con la URL de GitHub Pages
- sw.js: CACHE_NAME incrementado a `autovaleur-v2`, los 6 PRECACHE_URLS convertidos de paths relativos a absolutos con prefijo `/autovaleur-ma/`, fallback offline corregido de `./index.html` a `/autovaleur-ma/index.html`
- index.html verificado: 124.799 bytes (~122 KB), muy por debajo del umbral de 400 KB — no se requiere minificación ni package.json per D-08

## Task Commits

Cada tarea fue commiteada atómicamente:

1. **Task 1: Actualizar manifest.json** - `5d82e2f` (feat)
2. **Task 2: Actualizar sw.js** - `8d7b244` (feat)
3. **Task 3: Verificar tamaño index.html** - sin commit (solo verificación, sin cambios)

## Files Created/Modified

- `manifest.json` - start_url y scope actualizados a /autovaleur-ma/
- `sw.js` - CACHE_NAME v2, PRECACHE_URLS absolutos ×6, fallback offline absoluto

## Decisions Made

- Paths absolutos en lugar de relativos en sw.js y manifest.json: los paths relativos (`./`) no resuelven correctamente cuando el SW está registrado en un subpath de GitHub Pages
- CACHE_NAME v2: necesario para que el evento `activate` limpie el cache v1 con paths relativos incorrectos; sin este incremento los usuarios con SW instalado habrían seguido usando el cache antiguo roto
- Sin minificación: D-08 establece que index.html solo necesita minificación si supera 400 KB; el archivo mide 122 KB

## Deviations from Plan

Ninguna — plan ejecutado exactamente como estaba escrito.

## Issues Encountered

Ninguno.

## User Setup Required

Ninguno — no se requiere configuración externa.

## Known Stubs

Ninguno — no hay datos hardcoded ni placeholders en los archivos modificados.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| T-06-05 mitigado | sw.js | PRECACHE_URLS con paths absolutos + CACHE_NAME v2 garantizan cache-match correcto en producción |
| T-06-06 mitigado | manifest.json | scope actualizado a /autovaleur-ma/ coincide con ubicación del SW en GitHub Pages |

## Self-Check

- [x] manifest.json existe y contiene /autovaleur-ma/ en start_url y scope
- [x] sw.js existe y contiene autovaleur-v2, 7 ocurrencias de /autovaleur-ma/, fallback correcto
- [x] Commit 5d82e2f existe (manifest.json)
- [x] Commit 8d7b244 existe (sw.js)
- [x] index.html < 400 KB (124.799 bytes)
- [x] package.json no existe en raíz

## Next Phase Readiness

- PWA lista para deploy en GitHub Pages subpath `/autovaleur-ma/`
- El SW interceptará correctamente las requests en producción
- Cache offline funcionará desde la primera visita post-deploy
- Siguiente: Plan 06-04 (README.md y deploy final)

---
*Phase: 06-pulido-y-despliegue*
*Completed: 2026-04-17*
