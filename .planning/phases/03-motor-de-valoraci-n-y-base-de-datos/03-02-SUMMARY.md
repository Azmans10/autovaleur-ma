---
phase: 03-motor-de-valoraci-n-y-base-de-datos
plan: 02
subsystem: database
tags: [javascript, vanilla, depreciation, car-valuation, lookup-table, morocco]

# Dependency graph
requires:
  - phase: 03-motor-de-valoraci-n-y-base-de-datos
    provides: "CAR_DB con 14 marcas y 42 modelos embebido en index.html (plan 03-01)"
provides:
  - "var DEPRECIATION con 6 sub-tablas de factores de depreciacion calibradas para mercado MA"
  - "age_factors: curva 16 entradas (0-15 años) con floor 30%"
  - "condition_factors: 5 niveles excellent/bon/moyen/mauvais/accidente"
  - "fuel_factors: diesel +6% prima MA, 5 tipos de carburante"
  - "transmission_factors: manuelle/automatique"
  - "city_factors: 10 ciudades MA, Casablanca +8% a Oujda -7%"
  - "Constantes de calculo: km_per_year, km_coefficient, km_min, km_max, price_floor"
affects:
  - 03-motor-de-valoraci-n-y-base-de-datos
  - Engine (plan 03-03 consume DEPRECIATION.age_factors[age], DEPRECIATION.fuel_factors[fuel], etc.)
  - Fase 4 (UI Estimer usa los resultados del Engine que usa DEPRECIATION)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Objeto literal JS con sub-tablas para lookup O(1) por clave — evita if/else encadenado"
    - "Constantes de formula embebidas en el objeto de datos (km_per_year, km_coefficient, price_floor)"
    - "var (no const) coherente con patron arquitectonico del proyecto"
    - "Bloque insertado entre CAR_DB y ROUTER segun convencion de orden en index.html"

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Constantes de calculo (km_per_year=15000, km_coefficient=0.20, km_min=0.70, km_max=1.30, price_floor=8000) embebidas en DEPRECIATION — Engine no necesita hardcodearlas"
  - "Clave 'accidente' sin tilde — coherente con RESEARCH.md para evitar problemas de codificacion"
  - "16 entradas age_factors (indices 0-15) donde age[14] y age[15] ambos son 0.30 — el index 15+ actua como floor garantizado"

patterns-established:
  - "Lookup table pattern: DEPRECIATION.X_factors[key] — acceso O(1) en Engine.estimate()"
  - "floor/clamp pattern: km_min y km_max como constantes en el objeto de datos, aplicados en Engine"

requirements-completed: [ALG-02, ALG-03, ALG-04, ALG-05, ALG-06]

# Metrics
duration: 8min
completed: 2026-04-12
---

# Phase 03 Plan 02: Objeto DEPRECIATION con tablas de factores de depreciacion

**Objeto var DEPRECIATION con 6 sub-tablas calibradas para mercado MA: curva de edad 16 puntos (floor 30%), estado, carburant (diesel +6%), transmision, 10 ciudades y constantes de formula embebidas**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-12T11:21:00Z
- **Completed:** 2026-04-12T11:29:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Objeto DEPRECIATION insertado en index.html entre CAR_DB y ROUTER, respetando el orden arquitectonico
- Curva de depreciacion de 16 puntos (años 0-15) calibrada para MA: caida agresiva 1-5, suave 6-10, estabilizacion 11+, floor 30%
- Todos los factores verificados con Node.js: 12/12 criterios de aceptacion pasados
- Constantes de formula (km_per_year=15000, km_coefficient=0.20, price_floor=8000) embebidas para que Engine no necesite hardcodearlas

## Task Commits

1. **Task 1: Insertar var DEPRECIATION con 6 tablas de factores en index.html** - `d5fa70b` (feat)

## Files Created/Modified

- `index.html` - Bloque var DEPRECIATION insertado (lineas 737-804), 69 lineas añadidas

## Decisions Made

- Constantes de calculo embebidas en DEPRECIATION (no en Engine) para centralizar toda la calibracion del mercado MA en un solo objeto
- Clave 'accidente' sin tilde — coherente con RESEARCH.md y evita problemas de codificacion de caracteres
- 16 entradas en age_factors (indices 0 a 15 inclusive) donde tanto age[14] como age[15] son 0.30 — garantiza que el floor se aplique correctamente para coches de 15+ años

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito. Todos los valores son exactamente los especificados en el PLAN.md y verificados contra RESEARCH.md.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- DEPRECIATION listo para ser consumido por Engine.estimate() en plan 03-03
- Patron de acceso: DEPRECIATION.age_factors[ageKey], DEPRECIATION.fuel_factors[params.fuel], etc.
- price_floor: 8000 DH disponible como DEPRECIATION.price_floor para aplicar en Engine
- km_per_year: 15000 y km_coefficient: 0.20 disponibles para calcular f_km en Engine

---
*Phase: 03-motor-de-valoraci-n-y-base-de-datos*
*Completed: 2026-04-12*
