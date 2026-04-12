# Phase 3: Motor de valoración y base de datos - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar el cerebro de la app: objeto CAR_DB con 14 marcas embebido en el HTML, tabla de factores de depreciación DEPRECIATION, motor de cálculo Engine.estimate(), tests inline en consola, y módulo Marketplaces para generar URLs de búsqueda.

Esta fase NO incluye: UI del formulario (Fase 4), historial (Fase 5), ni ningún elemento visual de resultado — solo la lógica de cálculo y los datos.
</domain>

<decisions>
## Implementation Decisions

### CAR_DB — Base de datos de coches

- **D-01:** Los precios base los estima Claude basándose en conocimiento del mercado MA (Avito.ma, Moteur.ma, precios 2024-2025). No los provee el usuario.
- **D-02:** Precio base único por modelo con año de referencia ~2020 (no precio por año). El factor de edad de la curva de depreciación ajusta el precio según el año real del vehículo — evita duplicar lógica.
- **D-03:** La BD cubre exactamente las 14 marcas de DB-01: Dacia, Renault, Peugeot, Citroën, Hyundai, Kia, Toyota, VW, Ford, Fiat, Seat, Suzuki, Mercedes, BMW. Mínimo 3 modelos por marca (DB-02).
- **D-04:** Estructura por marca: `{ marca: { modelo: { base_price, years: [min, max], fuel_types } } }`. Los datos van embebidos como `var CAR_DB = {...}` en el `<script>` del HTML (DB-04).

### DEPRECIATION — Factores de depreciación

- **D-05:** Curva de edad: tabla de 15 puntos derivada por Claude (patrones de mercados similares a MA). Depreciación agresiva años 1-5, más suave años 6-10, estabilización a partir de año 11. Floor mínimo del 30% (ALG-06). Formato: `{ age_factors: { 0: 1.0, 1: 0.85, 2: 0.75, ... , 15: 0.30 } }`.
- **D-06:** Factor de kilómetros: comparación con media MA de 15.000 km/año (ALG-03). Kilometraje esperado = (año_actual − año_vehículo) × 15.000. La desviación ajusta el precio (más km = penalización, menos km = bonus).
- **D-07:** Tabla de ciudades completa (10 entradas) derivada por Claude basándose en el mercado MA real. Valores confirmados: Casablanca +8%, Oujda −7% (ALG-05). Claude completa las 8 restantes (Rabat, Marrakech, Tanger, Fès, Meknès, Agadir, Tétouan, Autres).
- **D-08:** Factor carburant: diesel +6% (prima real en MA por subvención histórica del gasoil), essence base 0%, hybride y électrique según mercado MA, GPL ligera penalización (ALG-04).
- **D-09:** Factor transmisión: automático con pequeño bonus sobre manual (mercado MA prefiere manual, pero automático añade valor).
- **D-10:** Factor estado (condition): 5 niveles — excellent, bon, moyen, mauvais, accidenté. Rango de ajuste entre +10% y −35%.

### Engine — Motor de cálculo

- **D-11:** Fórmula: **multiplicación en cadena** — `estimated_price = base_price × f_age × f_km × f_condition × f_fuel × f_city × f_transmission`. Es el estándar del sector para motores de valoración y encaja con el desglose de % que requiere EST-04/EST-05.
- **D-12:** `Engine.estimate(params)` retorna `{ estimated_price, price_range: { min, max }, breakdown: [...] }`. El `breakdown` es un array de 7 objetos: `{ label, factor, amount_dh }` para renderizar en Fase 4.
- **D-13:** Rango de precio: ±10% sobre el precio estimado (ALG-07). `min = estimated_price × 0.90`, `max = estimated_price × 1.10`.
- **D-14:** Floor mínimo: 8.000 DH aplicado al `estimated_price` final (ALG-06). Si el cálculo da menos, se devuelve 8.000 DH.
- **D-15:** `params` de entrada: `{ make, model, year, mileage, condition, fuel, transmission, city }`.

### Marketplaces — URLs de búsqueda

- **D-16:** URLs construidas con **marca + modelo + año únicamente** — sin ciudad ni carburant. Máxima compatibilidad si los sitios cambian sus parámetros de query.
- **D-17:** `Marketplaces.getLinks(make, model, year)` retorna `{ avito, moteur, wandaloo }` — tres URLs de búsqueda directas. Las URLs se construyen como strings de búsqueda (no peticiones de red).
- **D-18:** Función global, no método de I18n ni Engine — accesible desde cualquier fase futura.

### Claude's Discretion

- Valores concretos de la curva de depreciación (los 15 puntos) — el planificador los fija según conocimiento del mercado MA.
- Precios base específicos de cada modelo — el planificador los calibra a precios de mercado MA 2024-2025.
- Tabla completa de 10 ciudades con sus factores — el planificador los deriva con la premisa: Casablanca +8%, Oujda −7%, otras según posición económica de la ciudad.
- Estructura exacta del query string de cada marketplace — el planificador verifica el formato real de URLs de búsqueda de Avito.ma, Moteur.ma y Wandaloo.ma.
- Los 5 casos de test para 03-04 — el planificador los elige para cubrir diversidad de marcas, estados y ciudades.
</decisions>

<canonical_refs>
## Canonical Refs

- `index.html` — archivo único; CAR_DB, DEPRECIATION, Engine y Marketplaces se insertan en su `<script>`
- `.planning/REQUIREMENTS.md` — requisitos ALG-01 a ALG-07, DB-01 a DB-04 (scope de esta fase)
- `.planning/ROADMAP.md` — Phase 3, plans 03-01 a 03-05
</canonical_refs>

<deferred>
## Ideas Diferidas

(Ninguna surgió durante la discusión)
</deferred>
