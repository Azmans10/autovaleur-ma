---
phase: 03-motor-de-valoracion-y-base-de-datos
plan: "03"
subsystem: engine
tags: [javascript, vanilla, valuation-engine, car-pricing, morocco, formula]
dependency_graph:
  requires:
    - "CAR_DB con 14 marcas y 42 modelos (plan 03-01)"
    - "DEPRECIATION con 6 sub-tablas de factores y constantes (plan 03-02)"
  provides:
    - "var Engine con metodo estimate(params) — punto de entrada unico para valoracion"
    - "Formula multiplicativa D-11: base_price x f_age x f_km x f_condition x f_fuel x f_city x f_transmission"
    - "Retorno completo D-12: { estimated_price, price_range: {min, max}, breakdown: [...7 items] }"
    - "Validacion de marca/modelo: retorna null si no existe en CAR_DB"
  affects:
    - "Plan 03-04 (tests inline — consume Engine.estimate)"
    - "Plan 03-05 (Marketplaces — complementario al Engine)"
    - "Fase 4 (UI Estimer — renderiza breakdown y precio estimado)"
tech_stack:
  added: []
  patterns:
    - "Funcion pura: Engine.estimate() sin efectos secundarios ni estado"
    - "Multiplicacion en cadena para formula de valoracion (D-11)"
    - "Breakdown acumulativo: cada linea multiplica la anterior"
    - "parseInt(params.year, 10) para compatibilidad con valores de <select>"
    - "Constantes de DEPRECIATION usadas en lugar de magic numbers"
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "parseInt(params.year, 10) en lugar de Number() — params.year puede venir como string de un <select> HTML"
  - "DEPRECIATION.price_floor en lugar de hardcodear 8000 — centraliza calibracion del mercado MA"
  - "DEPRECIATION.km_per_year/km_coefficient/km_min/km_max en lugar de literales — coherente con decision de plan 03-02"
  - "amount_dh de la ultima linea (Transmission) usa estimated_price con floor aplicado — garantiza que el breakdown refleja el precio final real"
metrics:
  duration: "8min"
  completed_date: "2026-04-12"
  tasks_completed: 1
  tasks_total: 1
  files_modified: 1
---

# Phase 3 Plan 3: Motor Engine.estimate() con formula multiplicativa y breakdown

## One-liner

Motor de valoracion `var Engine` con formula multiplicativa de 7 factores, breakdown acumulativo de 7 lineas, rango +/-10% y floor 8000 DH — calibrado para mercado MA.

## What Was Built

Se inserto el bloque `var Engine = {...}` en `index.html` entre DEPRECIATION y ROUTER, con el metodo `estimate(params)` que:

1. **Valida** la entrada: retorna `null` si `CAR_DB[params.make][params.model]` no existe
2. **Calcula edad** con `Math.max(0, currentYear - parseInt(params.year, 10))` — parseInt para soportar string de select
3. **Aplica 7 factores** usando tablas de DEPRECIATION (sin hardcodear constantes):
   - `f_age`: `DEPRECIATION.age_factors[Math.min(age, 15)]`
   - `f_km`: formula con `DEPRECIATION.km_per_year`, `km_coefficient`, clamped entre `km_min` y `km_max`
   - `f_condition`, `f_fuel`, `f_city`, `f_transmission`: lookups directos en sub-tablas
4. **Multiplica en cadena** (D-11): `base_price × f_age × f_km × f_condition × f_fuel × f_city × f_transmission`
5. **Aplica floor 8000 DH** via `DEPRECIATION.price_floor` + redondeo a centenas
6. **Genera rango** +/-10% con redondeo a centenas (ALG-07)
7. **Construye breakdown** de 7 lineas con `amount_dh` acumulativo (D-12)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 03-03-T1 | Implementar var Engine con metodo estimate() en index.html | ab13b7c | index.html |

## Verification Results

Verificado con Node.js evaluando los bloques CAR_DB + DEPRECIATION + Engine extraidos de index.html:

- `typeof Engine.estimate === 'function'` — PASS
- Logan 2019, 85000 km, bon, diesel, manuelle, Casablanca: `estimated_price = 53800 DH` — PASS (rango 48000-70000)
- `price_range: { min: 48400, max: 59200 }` — PASS (~90% y ~110%)
- `breakdown.length === 7` — PASS
- Todas las entradas tienen `label`, `factor` y `amount_dh` — PASS
- `Engine.estimate({make:'NoExiste', ...}) === null` — PASS
- Coche 2005 estado mauvais (year=2005, mileage=350000): `estimated_price = 19100 DH >= 8000` — PASS (floor activo)

## Breakdown del caso Logan 2019 (referencia)

| Label | Factor | Amount DH |
|-------|--------|-----------|
| Prix de base | 1.0000 | 105000 |
| Age (7 ans) | 0.4300 | 45150 |
| Kilometrage | 1.0400 | 46956 |
| Etat | 1.0000 | 46956 |
| Carburant | 1.0600 | 49773 |
| Ville | 1.0800 | 53755 |
| Transmission | 1.0000 | 53800 |

## Deviations from Plan

None - plan ejecutado exactamente como estaba escrito. Todos los calculos coinciden con las predicciones del RESEARCH.md (precio esperado ~53800 DH).

## Known Stubs

None — Engine.estimate() es una funcion completa conectada a CAR_DB y DEPRECIATION reales. No hay placeholders ni valores vacios.

## Threat Flags

None — Engine es una funcion pura que opera sobre datos estaticos locales. No introduce trust boundaries nuevos (confirmado por threat_model del plan: T-03-03 y T-03-04 ambos con disposition "accept").

## Self-Check: PASSED

- index.html modificado con var Engine: FOUND (lineas 807-868)
- Engine entre DEPRECIATION (linea 742) y ROUTER (linea 869): CONFIRMED
- Commit ab13b7c existe: CONFIRMED
- Logan 2019 => 53800 DH (rango 48000-70000): PASS
- breakdown.length === 7: PASS
- null para marca invalida: PASS
- floor 8000 DH: PASS
