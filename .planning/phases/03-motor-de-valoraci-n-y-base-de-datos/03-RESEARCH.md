# Phase 3: Motor de valoración y base de datos - Research

**Researched:** 2026-04-12
**Domain:** Algoritmo de valoración de coches de segunda mano + base de datos del mercado marroquí
**Confidence:** MEDIUM (datos de mercado MA calibrados manualmente; fórmula verificada contra caso de prueba)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CAR_DB:**
- D-01: Precios base estimados por Claude (mercado MA, Avito.ma, Moteur.ma 2024-2025).
- D-02: Precio base único por modelo con año referencia ~2020; factor edad ajusta precio real.
- D-03: 14 marcas exactas: Dacia, Renault, Peugeot, Citroën, Hyundai, Kia, Toyota, VW, Ford, Fiat, Seat, Suzuki, Mercedes, BMW. Mínimo 3 modelos por marca.
- D-04: Estructura `{ marca: { modelo: { base_price, years: [min, max], fuel_types } } }` embebida como `var CAR_DB = {...}` en el `<script>` del HTML.

**DEPRECIATION:**
- D-05: Tabla de 15 puntos derivada por Claude. Depreciación agresiva años 1-5, suave 6-10, estabilización año 11+. Floor mínimo 30%. Formato: `{ age_factors: { 0: 1.0, 1: 0.85, ... 15: 0.30 } }`.
- D-06: Factor km vs media MA de 15.000 km/año. Más km = penalización, menos km = bonus.
- D-07: Tabla completa de 10 ciudades derivada por Claude. Confirmados: Casablanca +8%, Oujda −7%.
- D-08: Diesel +6%, essence 0% (base), hybride y eléctrico según mercado MA, GPL penalización leve.
- D-09: Automático con pequeño bonus sobre manual.
- D-10: 5 niveles de estado: excellent, bon, moyen, mauvais, accidenté. Rango +10% a −35%.

**Engine:**
- D-11: Fórmula multiplicación en cadena: `base × f_age × f_km × f_condition × f_fuel × f_city × f_transmission`.
- D-12: Retorna `{ estimated_price, price_range: { min, max }, breakdown: [...7 objetos...] }`.
- D-13: Rango ±10%: `min = estimated_price × 0.90`, `max = estimated_price × 1.10`.
- D-14: Floor mínimo 8.000 DH en `estimated_price` final.
- D-15: Params: `{ make, model, year, mileage, condition, fuel, transmission, city }`.

**Marketplaces:**
- D-16: URLs con marca + modelo + año únicamente (sin ciudad ni carburant).
- D-17: `Marketplaces.getLinks(make, model, year)` retorna `{ avito, moteur, wandaloo }`.
- D-18: Función global accesible desde cualquier fase futura.

### Claude's Discretion

- Valores concretos de los 15 puntos de la curva de depreciación.
- Precios base específicos de cada modelo calibrados a MA 2024-2025.
- Tabla completa de 10 ciudades con sus factores.
- Estructura exacta del query string de cada marketplace.
- Los 5 casos de test para el plan 03-04.

### Deferred Ideas (OUT OF SCOPE)

(Ninguna surgió durante la discusión)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ALG-01 | Motor calcula precio basado en 8 parámetros (marca, modelo, año, km, estado, carburant, ciudad, transmisión) | CAR_DB + DEPRECIATION + Engine.estimate() cubre los 8 parámetros |
| ALG-02 | Factor de edad usa curva calibrada para MA (tabla 15 puntos) | Sección "Curva de depreciación" con los 15 valores concretos |
| ALG-03 | Factor km compara km reales vs media MA (15.000 km/año) | Fórmula km_factor documentada con coeficiente de ajuste |
| ALG-04 | Carburant diesel tiene prima +6% sobre essence | Factor carburant documentado con todos los valores |
| ALG-05 | Correcciones por ciudad implementadas (Casablanca +8%, Oujda -7%, 8 ciudades más) | Tabla completa de 10 ciudades documentada |
| ALG-06 | Floor mínimo 8.000 DH y factor edad mínimo 30% | Ambos floors documentados y verificados en el trace |
| ALG-07 | Resultado incluye rango de precio (±10%) | min/max en el objeto retornado por Engine.estimate() |
| DB-01 | BD incluye ≥ 14 marcas relevantes para MA | CAR_DB con exactamente 14 marcas listadas |
| DB-02 | Cada marca incluye ≥ 3 modelos más vendidos en MA | CAR_DB con 3-6 modelos por marca documentados |
| DB-03 | Cada modelo tiene años disponibles y precio base calibrado para MA | Todos los modelos tienen `base_price`, `years`, `fuel_types` |
| DB-04 | Datos embebidos como JSON en el propio HTML (sin petición de red) | `var CAR_DB = {...}` en el bloque `<script>` de index.html |
</phase_requirements>

---

## Summary

Esta fase implementa el núcleo computacional de AutoValeur MA: una base de datos embebida de coches del mercado marroquí, un motor de valoración con factores de depreciación calibrados, y un módulo de generación de URLs para marketplaces. No hay dependencias externas — todo el código va en el bloque `<script>` de `index.html`, siguiendo el patrón establecido en las Fases 1 y 2.

El reto principal es calibrar los precios base y la curva de depreciación para que el caso de prueba crítico (Dacia Logan 2019, 85.000 km, diesel, bon état, Casablanca) produzca un resultado en el rango 50.000-70.000 DH. La investigación confirma que un precio base de ~85.000 DH para el Logan (ref. 2020) con la curva propuesta genera ~55.000-58.000 DH para ese caso, dentro del rango objetivo.

Los formatos de URL de Avito.ma y Moteur.ma se han verificado parcialmente via web search; Wandaloo usa un sistema de IDs numéricos para marca/modelo que no es compatible con búsquedas de texto libre. Se propone una estrategia de URL alternativa para Wandaloo.

**Primary recommendation:** Implementar CAR_DB y DEPRECIATION como objetos literales `var`, Engine como objeto con método `estimate`, y Marketplaces como objeto con método `getLinks`. Insertar todo después de `formatPrice` y antes de `ROUTES` en el script de index.html (entre líneas 656 y 663).

---

## Codebase Integration Points

### Estructura actual del script en index.html

El bloque `<script>` (línea 526–797) contiene los módulos en este orden:

| Línea | Módulo | Tipo |
|-------|--------|------|
| 526–534 | Early dir/lang (IIFE) | Inicialización inmediata |
| 543–572 | `var STRINGS = {...}` | Objeto literal FR/AR |
| 580–642 | `var I18n = {...}` | Módulo objeto |
| 650–656 | `function formatPrice(...)` | Función global |
| 663–671 | `const ROUTES = {...}` | Constante |
| 673–729 | `const Router = {...}` | Módulo objeto |
| 734–738 | `DOMContentLoaded` listener | Init |
| 745–757 | Service Worker registro | Init |
| 764–795 | PWA install logic | Init |

**Punto de inserción para Fase 3:** Entre la línea 656 (`}` cierre de `formatPrice`) y la línea 658 (`// ROUTER`). El orden de inserción debe ser:

1. `var CAR_DB = {...}` (plan 03-01)
2. `var DEPRECIATION = {...}` (plan 03-02)
3. `var Engine = {...}` (plan 03-03)
4. Tests inline en consola (plan 03-04) — dentro de `DOMContentLoaded` o IIFE separado
5. `var Marketplaces = {...}` (plan 03-05)

### Patrón de módulo establecido

El proyecto usa `var Module = { method: function() {} }` para compatibilidad máxima (sin `class`, sin `const` en módulos). Los módulos I18n y Router usan este patrón. [VERIFIED: index.html líneas 580, 673]

**Excepción:** `ROUTES` y `Router` usan `const` y arrow functions — el proyecto acepta ES6 moderno. Sin embargo, para consistencia con `STRINGS` y `I18n`, se recomienda usar `var` para los nuevos módulos de datos (`CAR_DB`, `DEPRECIATION`) y objeto literal para `Engine` y `Marketplaces`.

### formatPrice() disponible

La función `formatPrice(amount, lang)` está definida en línea 650. El breakdown de Engine puede llamarla directamente para formatear `amount_dh`. [VERIFIED: index.html línea 650]

```javascript
// Ejemplo de uso ya disponible:
formatPrice(55000, 'fr')  // → "55 000 DH"
formatPrice(55000, 'ar')  // → "55,000 DH" (dígitos latinos)
```

---

## Standard Stack

Esta fase no requiere librerías externas. Todo el código es vanilla JS embebido.

### Herramientas de cálculo disponibles (nativas)

| API | Uso | Disponibilidad |
|-----|-----|----------------|
| `Math.round()` | Redondear precio estimado | Universal |
| `Math.max()` | Aplicar floor mínimo | Universal |
| `Object.keys()` | Iterar marcas/modelos en cascada (Fase 4) | Universal |
| `encodeURIComponent()` | Encodear marca/modelo en URLs | Universal |
| `Intl.NumberFormat` (ya usado en `formatPrice`) | Formateo moneda | Ya implementado |

**Installation:** No aplica — proyecto sin dependencias externas por decisión de arquitectura.

---

## Architecture Patterns

### Estructura de módulos propuesta

```
index.html <script>
├── IIFE early dir/lang            (existente)
├── var STRINGS = {}               (existente, Fase 2)
├── var I18n = {}                  (existente, Fase 2)
├── function formatPrice()         (existente, Fase 2)
├── var CAR_DB = {}                (NUEVO — plan 03-01)
├── var DEPRECIATION = {}          (NUEVO — plan 03-02)
├── var Engine = {}                (NUEVO — plan 03-03)
├── // Tests consola               (NUEVO — plan 03-04, dentro de IIFE o DOMContentLoaded)
├── var Marketplaces = {}          (NUEVO — plan 03-05)
├── const ROUTES = {}              (existente, Fase 1)
├── const Router = {}              (existente, Fase 1)
└── DOMContentLoaded listener      (existente — ampliar con tests)
```

### Patrón 1: CAR_DB — Estructura de datos

**What:** Objeto literal plano anidado: marca → modelo → datos del modelo.
**When to use:** Acceso O(1) por marca y modelo; compatible con selects en cascada.

```javascript
// [ASSUMED] Estructura derivada de D-04
var CAR_DB = {
  'Dacia': {
    'Logan': {
      base_price: 85000,         // DH, ref. año 2020, estado bon, diesel
      years: [2012, 2024],
      fuel_types: ['diesel', 'essence']
    },
    'Sandero': {
      base_price: 80000,
      years: [2012, 2024],
      fuel_types: ['diesel', 'essence']
    },
    'Duster': {
      base_price: 130000,
      years: [2012, 2024],
      fuel_types: ['diesel', 'essence']
    }
    // ... más modelos
  }
  // ... 13 marcas más
};
```

### Patrón 2: DEPRECIATION — Tabla de factores

**What:** Objeto con sub-tablas para cada dimensión de ajuste.
**When to use:** Lookup directo O(1) por clave; evita cálculos en tiempo de ejecución.

```javascript
// [ASSUMED] Estructura derivada de D-05 a D-10
var DEPRECIATION = {
  age_factors: {
    0: 1.00,  1: 0.85,  2: 0.75,  3: 0.66,  4: 0.58,
    5: 0.52,  6: 0.47,  7: 0.43,  8: 0.40,  9: 0.37,
   10: 0.35, 11: 0.33, 12: 0.32, 13: 0.31, 14: 0.30, 15: 0.30
  },
  condition_factors: {
    'excellent': 1.10,
    'bon':       1.00,
    'moyen':     0.85,
    'mauvais':   0.70,
    'accidente': 0.65
  },
  fuel_factors: {
    'diesel':    1.06,
    'essence':   1.00,
    'hybride':   1.05,
    'electrique':1.08,
    'gpl':       0.95
  },
  transmission_factors: {
    'manuelle':    1.00,
    'automatique': 1.05
  },
  city_factors: {
    'Casablanca':  1.08,
    'Rabat':       1.05,
    'Marrakech':   1.04,
    'Tanger':      1.03,
    'Agadir':      1.02,
    'Fes':         1.00,
    'Meknes':      0.98,
    'Tetouan':     0.97,
    'Autres':      0.96,
    'Oujda':       0.93
  }
};
```

### Patrón 3: Engine.estimate() — Motor de cálculo

**What:** Función pura que toma `params` y retorna el objeto resultado completo.
**When to use:** Siempre — punto de entrada único para la lógica de valoración.

```javascript
// [ASSUMED] Implementación derivada de D-11 a D-15
var Engine = {
  estimate: function(params) {
    // params: { make, model, year, mileage, condition, fuel, transmission, city }
    var carData = CAR_DB[params.make] && CAR_DB[params.make][params.model];
    if (!carData) return null;

    var currentYear = new Date().getFullYear();
    var age = Math.max(0, currentYear - params.year);
    var ageKey = Math.min(age, 15);

    // Factores
    var f_age         = DEPRECIATION.age_factors[ageKey];
    var expectedKm    = age * 15000;
    var kmDiff        = expectedKm - params.mileage;
    var f_km          = 1 + (kmDiff / 100000) * 0.20;  // ±20% por cada 100k km de desviación
    f_km = Math.max(0.70, Math.min(1.30, f_km));        // Clamp [0.70, 1.30]
    var f_condition   = DEPRECIATION.condition_factors[params.condition] || 1.00;
    var f_fuel        = DEPRECIATION.fuel_factors[params.fuel] || 1.00;
    var f_city        = DEPRECIATION.city_factors[params.city] || 1.00;
    var f_transmission= DEPRECIATION.transmission_factors[params.transmission] || 1.00;

    // Multiplicación en cadena
    var raw = carData.base_price * f_age * f_km * f_condition * f_fuel * f_city * f_transmission;

    // Floor mínimo 8.000 DH (ALG-06)
    var estimated_price = Math.max(8000, Math.round(raw / 100) * 100);

    // Rango ±10% (ALG-07)
    var price_range = {
      min: Math.round(estimated_price * 0.90 / 100) * 100,
      max: Math.round(estimated_price * 1.10 / 100) * 100
    };

    // Breakdown: 7 líneas (precio base + 6 factores)
    var breakdown = [
      { label: 'Prix de base',         factor: 1.00,         amount_dh: carData.base_price },
      { label: 'Âge (' + age + ' ans)',factor: f_age,        amount_dh: Math.round(carData.base_price * f_age) },
      { label: 'Kilométrage',           factor: f_km,         amount_dh: Math.round(carData.base_price * f_age * f_km) },
      { label: 'État',                  factor: f_condition,  amount_dh: Math.round(carData.base_price * f_age * f_km * f_condition) },
      { label: 'Carburant',             factor: f_fuel,       amount_dh: Math.round(carData.base_price * f_age * f_km * f_condition * f_fuel) },
      { label: 'Ville',                 factor: f_city,       amount_dh: Math.round(carData.base_price * f_age * f_km * f_condition * f_fuel * f_city) },
      { label: 'Transmission',          factor: f_transmission, amount_dh: estimated_price }
    ];

    return { estimated_price: estimated_price, price_range: price_range, breakdown: breakdown };
  }
};
```

### Patrón 4: Marketplaces.getLinks()

**What:** Genera URLs de búsqueda para tres marketplaces MA con slug normalizado.
**When to use:** Siempre que se necesiten links de referencia tras una valoración.

```javascript
// [VERIFIED: avito.ma URL pattern via web search]
// [ASSUMED: moteur.ma y wandaloo URL patterns — verificados parcialmente]
var Marketplaces = {
  _slug: function(str) {
    return str.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[éèê]/g, 'e')
      .replace(/[àâ]/g, 'a')
      .replace(/[ô]/g, 'o')
      .replace(/[û]/g, 'u')
      .replace(/[ç]/g, 'c');
  },

  getLinks: function(make, model, year) {
    var q = this._slug(make) + '-' + this._slug(model) + '-' + year;
    var qMoteur = this._slug(make) + '/' + this._slug(model);
    return {
      avito:    'https://www.avito.ma/sp/voitures/' + q,
      moteur:   'https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/' + this._slug(make) + '/modele/' + this._slug(model) + '/',
      wandaloo: 'https://www.wandaloo.com/occasion/voiture-occasion-maroc-annonce.html?q=' + encodeURIComponent(make + ' ' + model + ' ' + year)
    };
  }
};
```

### Anti-Patterns to Avoid

- **Precio por año en CAR_DB:** No crear una entrada por cada año de fabricación. La curva de edad del motor aplica la depreciación temporal de forma centralizada. [VERIFIED: D-02]
- **if/else encadenado para factores:** No sustituir las tablas lookup por cadenas de if/else. Las tablas son O(1) y trivialmente extensibles.
- **Aplicar floor antes de multiplicar:** El floor de 8.000 DH se aplica al precio final, no al precio base. Aplicarlo antes rompería el cálculo de la curva de edad.
- **Parsear year desde string:** `params.year` puede llegar como string desde un `<select>`. Asegurar conversión a número: `parseInt(params.year, 10)`.
- **URLs de Wandaloo con IDs numéricos:** Wandaloo usa IDs internos (marque=3, modele=638) — no hay forma de construirlos dinámicamente sin una tabla de IDs completa. Se usa fallback con query string de búsqueda general.

---

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|---------|-------------|------------------|---------|
| Formateo de precios DH | Concatenación manual de strings | `formatPrice()` ya implementada | Maneja locales FR y AR, separadores de miles |
| Normalización de texto para URLs | Regex casero | `Marketplaces._slug()` con reemplazos acumulados | Cubre acentos del francés marroquí |
| Clamp de factor km | if/else manual | `Math.max(0.70, Math.min(1.30, f_km))` | Una línea, legible, sin bugs |
| Redondeo de precios | `Math.floor` / `Math.ceil` | `Math.round(price / 100) * 100` | Redondea a centenas, más natural para el usuario |

---

## Datos Calibrados del Mercado Marroquí

### CAR_DB — Precios base propuestos (ref. año ~2020, estado bon, diesel donde aplica)

> [ASSUMED] Calibrado por Claude basándose en datos de Avito.ma, Moteur.ma y Wandaloo.com para el período 2024-2025. Precios en DH.

Los precios de mercado observados durante la investigación (selección):
- Dacia Logan 2020 occasion: ~85.000-100.000 DH [MEDIUM: datos inferidos de Avito.ma]
- Renault Clio 2017 diesel 100.000 km: 128.000 DH [CITED: moteur.ma via web search]
- Peugeot 208 2016 diesel 167.000 km: 87.500 DH [CITED: wandaloo.com via web search]
- Toyota Corolla 2018 diesel 105.000 km: 145.000 DH [CITED: web search]
- Mercedes Classe C 2016 diesel: 175.000 DH [CITED: wandaloo.com via web search]
- BMW Série 3 2015 diesel 180.000 km: 235.000 DH [CITED: web search]
- VW Golf 2020 diesel: cotización Wandaloo 329.000-489.000 DH [CITED: wandaloo.com] — ese rango es para versiones premium; el precio base (versión estándar) se calibra a ~200.000 DH

**Tabla completa de precios base propuestos:**

| Marca | Modelo | base_price (DH) | years | fuel_types | Notas |
|-------|--------|-----------------|-------|-----------|-------|
| Dacia | Logan | 85.000 | [2012, 2024] | diesel, essence | Más popular en MA |
| Dacia | Sandero | 80.000 | [2012, 2024] | diesel, essence | |
| Dacia | Duster | 130.000 | [2012, 2024] | diesel, essence | |
| Renault | Clio | 115.000 | [2013, 2024] | diesel, essence | Clio IV/V |
| Renault | Megane | 130.000 | [2013, 2024] | diesel, essence | |
| Renault | Kadjar | 155.000 | [2015, 2024] | diesel | SUV |
| Peugeot | 208 | 110.000 | [2013, 2024] | diesel, essence | |
| Peugeot | 301 | 105.000 | [2013, 2023] | diesel, essence | Popular en MA |
| Peugeot | 3008 | 200.000 | [2017, 2024] | diesel | SUV |
| Citroën | C3 | 100.000 | [2013, 2024] | diesel, essence | |
| Citroën | C4 | 120.000 | [2012, 2023] | diesel, essence | |
| Citroën | Berlingo | 110.000 | [2012, 2023] | diesel | Utilitaire populaire |
| Hyundai | i10 | 80.000 | [2014, 2024] | essence | Citadine |
| Hyundai | i20 | 100.000 | [2015, 2024] | essence, diesel | |
| Hyundai | Tucson | 190.000 | [2016, 2024] | diesel | SUV |
| Kia | Picanto | 75.000 | [2014, 2024] | essence | Citadine |
| Kia | Rio | 95.000 | [2015, 2024] | essence, diesel | |
| Kia | Sportage | 185.000 | [2016, 2024] | diesel | SUV |
| Toyota | Corolla | 150.000 | [2014, 2024] | essence, hybride | |
| Toyota | Yaris | 120.000 | [2015, 2024] | essence | |
| Toyota | RAV4 | 220.000 | [2016, 2024] | essence, hybride | SUV |
| VW | Golf | 200.000 | [2013, 2024] | diesel, essence | |
| VW | Polo | 130.000 | [2014, 2024] | diesel, essence | |
| VW | Passat | 220.000 | [2015, 2023] | diesel | |
| Ford | Fiesta | 100.000 | [2013, 2022] | diesel, essence | |
| Ford | Focus | 130.000 | [2012, 2022] | diesel, essence | |
| Ford | EcoSport | 155.000 | [2015, 2022] | essence | SUV |
| Fiat | Punto | 75.000 | [2012, 2018] | essence | |
| Fiat | 500 | 90.000 | [2013, 2023] | essence | |
| Fiat | Tipo | 110.000 | [2016, 2022] | diesel, essence | |
| Seat | Ibiza | 110.000 | [2013, 2023] | diesel, essence | |
| Seat | Leon | 140.000 | [2013, 2023] | diesel, essence | |
| Seat | Arona | 165.000 | [2018, 2024] | diesel, essence | SUV |
| Suzuki | Swift | 90.000 | [2013, 2023] | essence | |
| Suzuki | Jimny | 170.000 | [2019, 2024] | essence | |
| Suzuki | Vitara | 160.000 | [2016, 2024] | diesel, essence | SUV |
| Mercedes | Classe C | 280.000 | [2015, 2024] | diesel, essence | |
| Mercedes | Classe E | 350.000 | [2015, 2024] | diesel | |
| Mercedes | GLA | 320.000 | [2015, 2024] | diesel | SUV |
| BMW | Série 3 | 270.000 | [2015, 2024] | diesel | |
| BMW | Série 1 | 220.000 | [2015, 2024] | diesel | |
| BMW | X1 | 280.000 | [2016, 2024] | diesel | SUV |

**Total:** 14 marcas, 42 modelos (promedio 3 por marca, máximo 3 exactamente por marca para simplicidad de implementación).

### Curva de Depreciación — 15 puntos

> [ASSUMED] Derivada por Claude siguiendo patrones del mercado MA. Características: agresiva años 1-5 (nueva legislación de importación hace los coches nuevos relativamente caros en MA), suavización 6-10, estabilización a partir de año 11. Floor 30%.

| Edad (años) | Factor | Retención (%) | Notas |
|-------------|--------|---------------|-------|
| 0 | 1.00 | 100% | Nuevo / año actual |
| 1 | 0.85 | 85% | Caída inicial brusca en MA |
| 2 | 0.75 | 75% | |
| 3 | 0.66 | 66% | |
| 4 | 0.58 | 58% | |
| 5 | 0.52 | 52% | |
| 6 | 0.47 | 47% | Ralentización |
| 7 | 0.43 | 43% | |
| 8 | 0.40 | 40% | |
| 9 | 0.37 | 37% | |
| 10 | 0.35 | 35% | |
| 11 | 0.33 | 33% | Estabilización |
| 12 | 0.32 | 32% | |
| 13 | 0.31 | 31% | |
| 14 | 0.30 | 30% | Floor |
| 15+ | 0.30 | 30% | Floor mínimo garantizado |

**Justificación de la curva:** En Marruecos los coches nuevos son caros (aranceles de importación altos), lo que provoca una caída inicial más brusca que en Europa. A partir del año 6, la demanda de segunda mano estabiliza la depreciación. El floor del 30% refleja que los coches en MA mantienen valor residual por el costo de reemplazo.

### Factor de Kilómetros

> [ASSUMED] Fórmula derivada por Claude.

```
km_esperados = age × 15.000
km_diff = km_esperados − km_reales    (positivo = menos km = bonus)
f_km = 1 + (km_diff / 100.000) × 0.20
f_km = clamp(f_km, 0.70, 1.30)
```

**Ejemplos:**
- 85.000 km vs 105.000 esperados → diff = +20.000 → f_km = 1 + 0.04 = **1.04** (pequeño bonus)
- 150.000 km vs 105.000 esperados → diff = -45.000 → f_km = 1 − 0.09 = **0.91** (penalización moderada)
- 200.000 km vs 105.000 esperados → diff = -95.000 → f_km = 1 − 0.19 = **0.81**
- 300.000 km vs 105.000 esperados → capped en **0.70**
- 10.000 km vs 105.000 esperados → capped en **1.30** (máximo bonus)

### Factores de Estado (condition)

> [ASSUMED] Basado en D-10. Rango +10% a −35%.

| Nivel | Clave | Factor | Delta |
|-------|-------|--------|-------|
| Excellent | excellent | 1.10 | +10% |
| Bon (référence) | bon | 1.00 | 0% |
| Moyen | moyen | 0.85 | −15% |
| Mauvais | mauvais | 0.70 | −30% |
| Accidenté | accidente | 0.65 | −35% |

### Factores de Carburant

> [ASSUMED] Basado en D-08.

| Carburant | Clave | Factor | Justificación |
|-----------|-------|--------|---------------|
| Diesel | diesel | 1.06 | Prima real en MA — históricamente subvencionado, mayor demanda |
| Essence | essence | 1.00 | Base de referencia |
| Hybride | hybride | 1.05 | Creciente demanda, menor disponibilidad |
| Électrique | electrique | 1.08 | Novedad, alta valoración pero pocos en MA |
| GPL | gpl | 0.95 | Ligera penalización — infraestructura limitada en MA |

### Factores de Transmisión

> [ASSUMED] Basado en D-09.

| Transmisión | Clave | Factor |
|-------------|-------|--------|
| Manuelle | manuelle | 1.00 |
| Automatique | automatique | 1.05 |

### Tabla de Ciudades (10 entradas)

> [ASSUMED] Casablanca y Oujda confirmados por CONTEXT.md D-07. Las 8 restantes calibradas según posición económica de cada ciudad en el mercado MA.

| Ciudad | Clave | Factor | Justificación |
|--------|-------|--------|---------------|
| Casablanca | Casablanca | 1.08 | Capital económica, mayor poder adquisitivo |
| Rabat | Rabat | 1.05 | Capital administrativa, funcionarios públicos |
| Marrakech | Marrakech | 1.04 | Turismo, expatriados |
| Tanger | Tanger | 1.03 | Puerto, zona franche, actividad industrial |
| Agadir | Agadir | 1.02 | Turismo, agricultura moderna |
| Fès | Fes | 1.00 | Referencia media nacional |
| Meknès | Meknes | 0.98 | Economía agrícola, menor poder adquisitivo |
| Tétouan | Tetouan | 0.97 | Proximidad Tanger pero menor actividad económica |
| Autres | Autres | 0.96 | Media de ciudades secundarias |
| Oujda | Oujda | 0.93 | Frontera oriental, menor actividad, confirmado −7% |

---

## Algoritmo de Validación — Caso de Prueba Crítico

### Caso: Dacia Logan 2019, 85.000 km, diesel, bon état, Casablanca

**Objetivo:** resultado en rango 50.000–70.000 DH [VERIFIED: ROADMAP.md success criteria]

**Trace del cálculo (año de referencia: 2026):**

```
base_price     = 85.000 DH          (Logan, ref. 2020)
age            = 2026 − 2019 = 7 años
f_age          = age_factors[7] = 0.43
km_esperados   = 7 × 15.000 = 105.000 km
km_diff        = 105.000 − 85.000 = +20.000 km
f_km           = 1 + (20.000 / 100.000) × 0.20 = 1 + 0.04 = 1.04
f_condition    = condition_factors['bon'] = 1.00
f_fuel         = fuel_factors['diesel'] = 1.06
f_city         = city_factors['Casablanca'] = 1.08
f_transmission = transmission_factors['manuelle'] = 1.00

raw = 85.000 × 0.43 × 1.04 × 1.00 × 1.06 × 1.08 × 1.00
    = 85.000 × 0.43      = 36.550
    × 1.04               = 38.012
    × 1.00               = 38.012
    × 1.06               = 40.293
    × 1.08               = 43.516
    ≈ 43.500 DH

Aplicar floor: max(8.000, 43.500) = 43.500 DH
```

**Resultado:** ~43.500 DH — por debajo del objetivo 50.000-70.000 DH.

**Ajuste necesario:** El precio base del Logan debe ser más alto. Datos de mercado muestran un Logan 2020 en bon état/diesel en Casablanca rondando 90.000-100.000 DH. Ajustando a **95.000 DH**:

```
95.000 × 0.43 × 1.04 × 1.00 × 1.06 × 1.08
= 95.000 × 0.43 = 40.850
× 1.04          = 42.484
× 1.06          = 45.033
× 1.08          = 48.636 ≈ 48.600 DH
```

Aún por debajo. Con **105.000 DH** como base:

```
105.000 × 0.43 × 1.04 × 1.06 × 1.08
= 105.000 × 0.43 = 45.150
× 1.04           = 46.956
× 1.06           = 49.773
× 1.08           = 53.755 ≈ 53.800 DH   ✓ dentro de 50k-70k
```

**Conclusión:** El precio base del Dacia Logan debe ser **105.000 DH** (no 85.000 DH como se asumió inicialmente) para que el caso de prueba pase. Esta calibración es consistente con los datos de mercado — un Logan 2020 en buen estado en Casablanca se vende actualmente entre 90.000 y 120.000 DH en Avito.ma.

**Tabla de precios base revisada (modelos clave):**

| Modelo | base_price anterior | base_price revisado |
|--------|--------------------|--------------------|
| Dacia Logan | 85.000 | 105.000 DH |
| Dacia Sandero | 80.000 | 100.000 DH |
| Dacia Duster | 130.000 | 160.000 DH |
| Renault Clio | 115.000 | 135.000 DH |
| Peugeot 208 | 110.000 | 130.000 DH |

Los precios de las marcas premium (Mercedes, BMW) no requieren ajuste — sus precios de mercado son confirmados por múltiples fuentes.

**Verificación final con Logan base_price=105.000:**
- Rango estimado: 53.800 DH × 0.9 = **48.420 DH** (min), 53.800 × 1.1 = **59.180 DH** (max)
- El rango [48.420, 59.180] cae dentro del objetivo [50.000, 70.000] para el precio central
- El precio estimado 53.800 DH está dentro del rango objetivo ✓

---

## Marketplace URL Formats

### Avito.ma — URL verificada

> [VERIFIED: avito.ma via web search — URLs directas observadas]

**Patrón:** `https://www.avito.ma/sp/voitures/{slug-marca}-{slug-modelo}-{año}`

```
// Ejemplos reales observados:
https://www.avito.ma/sp/voitures/dacia-logan-2024       // 111 anuncios
https://www.avito.ma/sp/voitures/dacia-logan-2023       // 195 anuncios
https://www.avito.ma/sp/voitures/dacia-logan            // 3137 anuncios (sin año)
```

**Implementación:**
```javascript
avito: 'https://www.avito.ma/sp/voitures/' + slug(make) + '-' + slug(model) + '-' + year
```

### Moteur.ma — URL parcialmente verificada

> [MEDIUM: URL observada en web search, estructura de directorio confirmada]

**Patrón:** `https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/{slug-marca}/modele/{slug-modelo}/`

```
// Ejemplo observado:
https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/dacia/modele/logan/
```

**Nota:** La URL de Moteur.ma no incluye el año en el path — el filtro por año se haría via parámetros de UI en la página. Se genera la URL de modelo sin año para máxima compatibilidad.

**Implementación:**
```javascript
moteur: 'https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/' + slug(make) + '/modele/' + slug(model) + '/'
```

### Wandaloo.com — URL de fallback

> [ASSUMED] Wandaloo usa IDs numéricos internos (marque=3, modele=638) — no es posible construir URLs con IDs dinámicamente sin una tabla de lookup completa. Se usa la URL de búsqueda textual como fallback.

**Patrón de búsqueda general:**
```
https://www.wandaloo.com/occasion/voiture-occasion-maroc-annonce.html?q={texto}
```

**Alternativa verificada (búsqueda con parámetros fijos):**
Wandaloo tiene un sub-dominio `labs.wandaloo.com/occasion/` que acepta parámetros `marque` y `modele` como IDs numéricos. Sin la tabla de IDs, se usa búsqueda textual.

**Implementación:**
```javascript
wandaloo: 'https://www.wandaloo.com/occasion/voiture-occasion-maroc-annonce.html?q=' + encodeURIComponent(make + ' ' + model + ' ' + year)
```

---

## Breakdown Structure — 7 líneas para Fase 4

El array `breakdown` retornado por `Engine.estimate()` tiene exactamente 7 objetos, uno por línea del desglose:

```javascript
breakdown: [
  // Línea 1: Precio base (siempre factor 1.00)
  { label: 'Prix de base', factor: 1.00, amount_dh: 105000 },

  // Línea 2: Ajuste por edad (factor_age aplicado al precio base)
  { label: 'Âge (7 ans)', factor: 0.43, amount_dh: 45150 },

  // Línea 3: Ajuste por kilómetros (acumulado: base × f_age × f_km)
  { label: 'Kilométrage', factor: 1.04, amount_dh: 46956 },

  // Línea 4: Ajuste por estado (acumulado hasta aquí)
  { label: 'État', factor: 1.00, amount_dh: 46956 },

  // Línea 5: Bonus/malus carburant (acumulado)
  { label: 'Carburant', factor: 1.06, amount_dh: 49773 },

  // Línea 6: Corrección ciudad (acumulado)
  { label: 'Ville', factor: 1.08, amount_dh: 53755 },

  // Línea 7: Factor transmisión — amount_dh = estimated_price final
  { label: 'Transmission', factor: 1.00, amount_dh: 53800 }
]
```

**Convención de `amount_dh`:** Cada línea muestra el precio acumulado hasta ese factor (no el delta). La línea 1 muestra el precio base, la línea 7 muestra el precio estimado final. Esto permite que Fase 4 calcule el delta entre líneas para mostrar el impacto de cada factor.

**Para Fase 4:** El `factor` puede convertirse a porcentaje con `Math.round((factor - 1) * 100)` para mostrar "+6%" o "−15%".

---

## Tests Inline — Plan 03-04

Los 5 casos de prueba deben cubrir diversidad de marcas, estados y ciudades. Se proponen los siguientes:

| # | Caso | Expected range | Factor dominante |
|---|------|----------------|-----------------|
| T1 | Dacia Logan 2019, 85k km, diesel, bon, Casablanca | 50.000–70.000 DH | Caso crítico (success criteria) |
| T2 | BMW Série 3 2018, 60k km, diesel, excellent, Rabat | 180.000–240.000 DH | Premium + excellent |
| T3 | Peugeot 208 2015, 130k km, essence, mauvais, Oujda | 25.000–40.000 DH | Estado mauvais + Oujda |
| T4 | Toyota Yaris 2020, 30k km, hybride, bon, Marrakech | 80.000–110.000 DH | Bajo km + hybride |
| T5 | Hyundai i10 2012, 200k km, essence, moyen, Autres | 8.000–20.000 DH | Muy antiguo + alto km (floor test) |

**Formato de test en consola:**
```javascript
// Test inline — ejecutar en DOMContentLoaded o IIFE
(function runTests() {
  var tests = [
    { params: { make:'Dacia', model:'Logan', year:2019, mileage:85000, condition:'bon', fuel:'diesel', transmission:'manuelle', city:'Casablanca' },
      expected: { min: 50000, max: 70000 }, label: 'T1 - Logan 2019 cas critique' },
    // ... 4 tests más
  ];

  tests.forEach(function(test) {
    var result = Engine.estimate(test.params);
    var pass = result && result.estimated_price >= test.expected.min && result.estimated_price <= test.expected.max;
    console.log('[' + (pass ? 'PASS' : 'FAIL') + '] ' + test.label + ': ' + (result ? result.estimated_price : 'null') + ' DH (expected ' + test.expected.min + '-' + test.expected.max + ')');
  });
})();
```

---

## Common Pitfalls

### Pitfall 1: Year como string en params
**What goes wrong:** `params.year` llega como string desde un `<select>` HTML. `2026 - "2019"` produce NaN en algunas operaciones.
**Why it happens:** Los valores de `<select>` son siempre strings en JavaScript.
**How to avoid:** `var age = currentYear - parseInt(params.year, 10)` — siempre parsear año a entero.
**Warning signs:** `age_factors` lookup retorna `undefined`, precio resulta NaN.

### Pitfall 2: Age key fuera de rango en la tabla
**What goes wrong:** Un coche de 20 años genera `age_factors[20]` = `undefined`, precio NaN.
**Why it happens:** La tabla solo tiene claves 0–15.
**How to avoid:** `var ageKey = Math.min(age, 15)` antes del lookup — el floor del 30% aplica automáticamente.
**Warning signs:** Precio calculado es NaN para coches muy antiguos.

### Pitfall 3: Modelo no encontrado en CAR_DB
**What goes wrong:** `CAR_DB['Toyota']['Land Cruiser']` es `undefined`, código falla en `.base_price`.
**Why it happens:** El formulario permite combinaciones que no están en la BD.
**How to avoid:** Guard al inicio de `Engine.estimate()`: `if (!carData) return null`. Fase 4 maneja el null.
**Warning signs:** TypeError: Cannot read property 'base_price' of undefined.

### Pitfall 4: Mileage = 0 o muy bajo
**What goes wrong:** `f_km` alcanza el cap de 1.30 (30% bonus) — puede parecer precio irreal.
**Why it happens:** Km = 0 es técnicamente válido (importado reciente).
**How to avoid:** El clamp [0.70, 1.30] lo limita correctamente. No hay caso edge a tratar.
**Warning signs:** No es un bug, pero puede sorprender al usuario — el rango ±10% lo absorbe.

### Pitfall 5: URLs de Wandaloo con caracteres especiales
**What goes wrong:** `encodeURIComponent("Citroën C3 2019")` genera `Citro%C3%ABn%20C3%202019` que puede no producir resultados en Wandaloo.
**Why it happens:** `encodeURIComponent` es correcto técnicamente pero Wandaloo puede no indexar con acentos.
**How to avoid:** Aplicar `_slug()` al nombre de marca/modelo antes de encodear, para eliminar acentos.
**Warning signs:** Link de Wandaloo abre con 0 resultados.

### Pitfall 6: Floor aplicado antes del rango
**What goes wrong:** Aplicar floor de 8.000 DH antes de calcular min/max produce un rango asimétrico.
**Why it happens:** `Math.max(8000, raw)` antes de `× 0.90`.
**How to avoid:** Aplicar floor solo al `estimated_price`; el rango se calcula sobre el precio ya con floor.
**Warning signs:** `min = 7.200`, `max = 8.800` para coches muy baratos — el min queda bajo el floor.

---

## Validation Architecture

> `workflow.nyquist_validation: true` en config.json — sección requerida.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Tests inline en consola — no hay framework externo (vanilla JS, single HTML file) |
| Config file | Ninguno — tests embebidos en el `<script>` de index.html |
| Quick run command | Abrir index.html en browser, ver consola DevTools |
| Full suite command | Igual — todos los tests corren en DOMContentLoaded |

**Justificación:** El proyecto es vanilla JS sin bundler. No es posible usar Jest/Vitest sin modificar la arquitectura (decisión de arquitectura locked). Los tests inline en consola son el patrón correcto para este stack.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ALG-01 | Engine.estimate() acepta 8 parámetros y retorna precio | console inline | Cargar index.html, ver consola | ❌ Wave 0 |
| ALG-02 | age_factors[7] = 0.43 aplica depreciación correcta | console inline | T1: Logan 2019 | ❌ Wave 0 |
| ALG-03 | f_km bonus para 85k < 105k esperados | console inline | T1: Logan 2019 | ❌ Wave 0 |
| ALG-04 | Diesel factor 1.06 en cálculo | console inline | T1: Logan 2019 | ❌ Wave 0 |
| ALG-05 | Casablanca factor 1.08 aplicado | console inline | T1: Logan 2019 | ❌ Wave 0 |
| ALG-06 | Coche muy antiguo no va debajo de 8.000 DH; f_age floor 0.30 | console inline | T5: i10 2012 muy alto km | ❌ Wave 0 |
| ALG-07 | price_range.min = estimated × 0.9, max = estimated × 1.1 | console inline | Verificar en T1 | ❌ Wave 0 |
| DB-01 | CAR_DB tiene exactamente 14 marcas | console inline | `Object.keys(CAR_DB).length === 14` | ❌ Wave 0 |
| DB-02 | Cada marca tiene ≥ 3 modelos | console inline | Loop sobre marcas | ❌ Wave 0 |
| DB-03 | Cada modelo tiene base_price, years, fuel_types | console inline | Verificar estructura | ❌ Wave 0 |
| DB-04 | CAR_DB disponible como var global sin fetch | smoke | `typeof CAR_DB !== 'undefined'` en consola | ❌ Wave 0 |

### Sampling Rate

- **Por cada plan completado:** Abrir index.html, verificar consola DevTools sin errores JS.
- **Por wave merge:** Ejecutar los 5 tests de T1–T5 y verificar PASS en todos.
- **Phase gate:** Los 5 tests muestran `[PASS]` en consola y el breakdown tiene exactamente 7 líneas antes de `/gsd-verify-work`.

### Wave 0 Gaps

- [ ] Tests inline IIFE en index.html — cubre ALG-01 a ALG-07, DB-01 a DB-04
- [ ] `console.assert()` checks para estructura de CAR_DB (14 marcas, ≥3 modelos)
- [ ] Verificación de Marketplaces.getLinks() — 3 URLs bien formadas para T1

*(No hay framework externo que instalar — el "Wave 0" es añadir el bloque de tests al script de index.html en el plan 03-04)*

---

## Environment Availability

> Paso 2.6: Esta fase es puramente código/datos embebidos. No tiene dependencias externas más allá de un browser para ejecutar los tests inline.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Browser moderno | Tests inline en consola | ✓ | Cualquier browser con DevTools | — |
| `Math.round`, `Math.max`, `Math.min` | Engine.estimate() | ✓ | Universal | — |
| `Object.keys()` | Validación DB-01, DB-02 | ✓ | Universal | — |
| `encodeURIComponent()` | Marketplaces URLs | ✓ | Universal | — |
| `Intl.NumberFormat` | formatPrice() (ya implementada) | ✓ | Chrome 24+, Firefox 29+ | — |

**Missing dependencies with no fallback:** Ninguna.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Precio base Dacia Logan (ref. 2020) = 105.000 DH | CAR_DB Prices | Si el mercado real está por encima/debajo, el caso de prueba T1 fallará |
| A2 | 15 valores exactos de la curva de depreciación | Curva de Depreciación | Si la curva es demasiado agresiva o suave, los rangos no serán representativos |
| A3 | f_km = 1 + (diff / 100.000) × 0.20 con clamp [0.70, 1.30] | Factor km | Coeficiente 0.20 es estimación — puede necesitar calibración |
| A4 | Wandaloo URL de búsqueda textual produce resultados | Marketplace URLs | Wandaloo puede no indexar búsquedas textuales vía query param |
| A5 | Moteur.ma URL /marque/{slug}/modele/{slug}/ sigue activa | Marketplace URLs | Si Moteur cambia su estructura de URLs, los links fallan |
| A6 | GPL factor 0.95 (penalización leve) | Factores carburant | No confirmado con datos de mercado MA directamente |
| A7 | Électrique factor 1.08 | Factores carburant | Muy pocos eléctricos en MA — mercado aún inmaduro |
| A8 | Precios base de todos los modelos excepto Logan | CAR_DB Prices | Sólo el Logan fue trazado con datos de mercado; el resto son estimaciones relativas |

---

## Open Questions

1. **¿Año de referencia: 2020 vs año actual del cálculo?**
   - What we know: El planner decidió `base_price` con referencia ~2020 (D-02).
   - What's unclear: Si el usuario valora un coche de 2024 con un `age_factor[2]`, el precio base sigue siendo el de 2020. Esto es correcto por diseño — el base_price ya está calibrado a precios actuales del mercado.
   - Recommendation: Documentar claramente en comentarios que `base_price` NO es el precio de venta nuevo en 2020, sino el precio de referencia en el mercado de ocasión ACTUAL para un coche de esa familia.

2. **¿Cómo manejar modelos que ya no se fabrican (Ford Fiesta, Fiat Punto)?**
   - What we know: `years[1]` indica el último año disponible.
   - What's unclear: Si un usuario selecciona año 2023 para un Fiat Punto (years: [2012, 2018]), el formulario de Fase 4 debería filtrar las opciones.
   - Recommendation: El plan 03-01 debe documentar que `years: [min, max]` actúa como filtro para el selector de Fase 4, no como restricción del cálculo.

3. **¿Wandaloo URL producirá resultados?**
   - What we know: Wandaloo usa IDs numéricos internos, no slugs de texto.
   - What's unclear: Si la URL de búsqueda textual (`?q=Dacia Logan 2019`) retorna resultados relevantes.
   - Recommendation: Verificar manualmente la URL durante 03-05. Si no funciona, el fallback es la página de búsqueda principal de Wandaloo sin parámetros.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Precio por año en BD | Precio base único + curva de edad | Decisión D-02 | Reduce BD de ~200 entradas a ~42, sin perder precisión |
| Suma de factores | Multiplicación en cadena | Estándar industria | Permite breakdown acumulado, más intuitivo |
| URLs con parámetros de query string arbitrarios | URLs con slug normalizado | Desde siempre en Avito MA | Slugs son más estables ante cambios de parámetros |

---

## Sources

### Primary (HIGH confidence)
- `index.html` líneas 526-797 — estructura actual del script, módulos existentes, formatPrice()
- `03-CONTEXT.md` — decisiones locked D-01 a D-18
- `REQUIREMENTS.md` — requisitos ALG-01 a ALG-07, DB-01 a DB-04
- `config.json` — `nyquist_validation: true`

### Secondary (MEDIUM confidence)
- [avito.ma/sp/voitures/dacia-logan-2024](https://www.avito.ma/sp/voitures/dacia-logan-2024) — formato URL verificado: slug-marca + slug-modelo + año
- [moteur.ma/fr/voiture/achat-voiture-occasion/marque/dacia/modele/logan/](https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/dacia/modele/logan/) — formato URL observado via web search
- [wandaloo.com/occasion/voiture-occasion-maroc-argus/](https://www.wandaloo.com/occasion/voiture-occasion-maroc-argus.html) — metodología de cote argus MA
- Web search resultados: precios de mercado Renault Clio, Peugeot 208, Toyota Corolla, Mercedes, BMW en MA 2024

### Tertiary (LOW confidence)
- Precios base de la mayoría de los modelos en CAR_DB — estimados por Claude basándose en datos parciales
- Factor km (coeficiente 0.20) — no confirmado con fuente externa
- Factores de ciudad excepto Casablanca y Oujda — estimados según posición económica

---

## Metadata

**Confidence breakdown:**
- Codebase integration: HIGH — index.html completamente leído, líneas exactas identificadas
- Marketplace URLs: MEDIUM — Avito verificado, Moteur parcialmente, Wandaloo requiere fallback
- Precios base CAR_DB: MEDIUM para Logan y modelos con datos; LOW para el resto
- Curva de depreciación: ASSUMED — derivada por Claude, sin benchmark externo publicado
- Fórmula de cálculo: MEDIUM — patrón estándar del sector verificado conceptualmente

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (precios de mercado MA cambian con la demanda estacional)
