# Phase 4: Página Estimer — Research

**Researched:** 2026-04-12
**Domain:** Vanilla JS / HTML form — integración CAR_DB + Engine + I18n + History + Marketplaces en index.html único
**Confidence:** HIGH — toda la base de código existe y fue leída directamente

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Scroll único, no wizard. 8 campos en una sola pantalla scrollable.
- **D-02:** Selects en cascada con `<select>` nativos (marca → modelo → año). Sin librerías externas.
- **D-03:** Orden de campos: marca → modelo → año → km → estado → carburant → transmisión → ciudad.
- **D-04:** Validación solo al submit. Si km vacío o inválido (≤ 0 o no numérico), mostrar error bajo el campo. Sin submit si hay errores.
- **D-05:** Botón submit deshabilitado visualmente hasta que marca/modelo/año estén seleccionados. Valores por defecto: condition=bon, fuel=diesel, transmission=manuelle, city=Casablanca.
- **D-06:** Resultado inline debajo del formulario; scroll suave al resultado al submit exitoso. Formulario permanece visible.
- **D-07:** Precio estimado muy prominente (tipografía grande, color `--primary`). Rango min-max debajo en tipografía secundaria.
- **D-08:** Animación de aparición del resultado: fade-in + slide-up con CSS transition. Sin spinner (Engine.estimate() es síncrono).
- **D-09:** Tabla de 7 filas de breakdown. Columnas: label (traducido), factor (×1.06), importe acumulado en DH.
- **D-10:** Colores de desglose: verde si factor > 1.0, rojo si factor < 1.0, neutro/gris si factor = 1.0. Primera fila (precio base) siempre neutra.
- **D-11:** Botón "Nouvelle estimation" que limpia formulario, oculta resultado, scroll al top.
- **D-12:** `var History` mínimo en plan 04-02: `History.save(entry)` y `History.getAll()`. localStorage bajo clave `'autoValeur_history'`. Entry: `{ id, make, model, year, mileage, condition, fuel, transmission, city, estimated_price, price_range, breakdown, date }`.
- **D-13:** History se implementa como `var History = {...}` global (consistente con CAR_DB, Engine, Marketplaces). Phase 5 añade `delete(id)`, `clear()`.
- **D-14:** 3 chips (Avito, Moteur, Wandaloo) con `target="_blank"`. URLs via `Marketplaces.getLinks(make, model, year)`.
- **D-15:** Chips de marketplaces solo visibles cuando hay resultado calculado.
- **D-16:** Todos los labels del formulario y resultado usan `data-i18n`. Claves: `estimer.*` para formulario, `result.*` para resultado.
- **D-17:** `formatPrice()` para importes en DH. Factores como `×1.06` — formato universal, sin I18n.

### Claude's Discretion

- Estructura HTML exacta del formulario (fieldsets, clases CSS, ids)
- Lógica CSS de colores verde/rojo (clases `.factor-up`, `.factor-down`, `.factor-neutral`)
- Claves i18n exactas para nuevos labels (el planificador las define)
- Comportamiento cascada en borde (qué pasa al cambiar marca tras haber seleccionado modelo)

### Deferred Ideas (OUT OF SCOPE)

- Modo "compartir valoración" (SHARE-01)
- Monetización / paywall (post-v1)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EST-01 | Formulario cascada marca → modelo → año | CAR_DB.keys() → Object.keys(CAR_DB[make]) → range from years[0]..years[1] |
| EST-02 | km (input numérico) + estado (5) + carburant (5) + transmisión (2) + ciudad (10+1) | DEPRECIATION tables proveen las claves exactas para los `<option>` |
| EST-03 | Resultado prominente con rango min-max | Engine.estimate() → estimated_price + price_range.{min,max} |
| EST-04 | Desglose completo: 7 factores con label | breakdown array de 7 objetos {label, factor, amount_dh} |
| EST-05 | Factor como % + importe en DH | breakdown.factor + formatPrice(breakdown.amount_dh) |
| EST-06 | Guardar automáticamente en historial | History.save(entry) tras Engine.estimate() exitoso |
| EST-07 | 3 links a marketplaces con URLs dinámicas | Marketplaces.getLinks(make, model, year) → {avito, moteur, wandaloo} |
| UI-01 | Diseño moderno, limpio, estilo fintech/app marroquí | CSS custom properties ya definidas; extender con nuevas clases |
| UI-02 | CSS custom properties para colores/espaciado/radio | Paleta completa ya en `:root` — usar sin añadir variables nuevas salvo las de colores de breakdown |
| UI-03 | CSS logical properties para RTL | Usar `margin-inline-*`, `padding-inline-*` en todos los nuevos estilos |
| UI-04 | Transiciones suaves entre páginas | `.page:not([hidden])` animation ya existe; el resultado usa `transition` CSS propia |
</phase_requirements>

---

## Summary

La Fase 4 implementa la UI completa de la página Estimer dentro de `index.html`. Toda la infraestructura backend ya existe: `CAR_DB` (14 marcas), `DEPRECIATION`, `Engine.estimate()`, `Marketplaces.getLinks()`, `I18n.t()`, `formatPrice()` y el `Router` — todos globales en el `<script>`. La tarea de esta fase es exclusivamente de UI: reemplazar el placeholder de 2 líneas en `<section id="page-estimer">`, añadir CSS nuevo para el formulario/resultado, añadir cadenas a `STRINGS`, e implementar `var History` mínimo.

Toda la Fase 4 es una sola operación de edición en `index.html`. Los 5 planes modifican el mismo archivo, lo que impone serialización estricta (sin paralelismo posible). El único riesgo técnico es la coordinación de la cascada de selects (resetear modelo/año al cambiar marca) y la animación CSS del resultado (requiere clase `.visible` toggle, no `hidden` attribute, para que `transition` funcione).

**Primary recommendation:** Implementar en orden lineal 04-01 → 04-02 → 04-03 → 04-04 → 04-05 porque cada plan amplía el HTML/JS que el anterior dejó en su lugar.

---

## Standard Stack

### Core

| Elemento | Versión | Propósito | Por qué es el estándar |
|----------|---------|-----------|------------------------|
| Vanilla JS `var` globals | ES5+ (ya en uso) | History, cascade logic, event handlers | Arquitectura del proyecto: sin frameworks, sin módulos ES6 — consistente con CAR_DB, Engine, Marketplaces |
| `<select>` nativo HTML | HTML5 | Cascada marca/modelo/año | D-02 lockea selects nativos; sin librerías externas |
| CSS `transition` | CSS3 | Animación fade-in + slide-up del resultado | D-08 lockea CSS transition (no JS animation) |
| `localStorage` | Web API | Persistencia historial | D-12/D-13: `'autoValeur_history'` |
| `Intl.NumberFormat` | Ya en uso | formatPrice() para importes DH | Ya implementado con soporte RTL/latín |

### No usar

| Librería externa | Motivo de exclusión |
|------------------|---------------------|
| Cualquier framework JS (React, Vue…) | Arquitectura archivo único, sin npm |
| Select2 / Chosen / librerías de select | D-02 lockea selects nativos |
| Librerías de animación (GSAP, Animate.css) | D-08: CSS transition es suficiente |

---

## Punto de Inserción en index.html

### HTML — Sección page-estimer (placeholder actual)

**Líneas 466-469** (verificado con lectura directa del archivo):

```html
<!-- PÁGINA: Estimer (visible por defecto) -->
<section id="page-estimer" class="page page-estimer">
  <h2 data-i18n="page.estimer.title">Estimer</h2>
  <p>Formulaire d'estimation — <em>Phase 4</em></p>
</section>
```

El planner debe **reemplazar** el `<p>Formulaire d'estimation…</p>` con el formulario completo, la sección de resultado y la sección de marketplaces. El `<h2>` y los atributos de la `<section>` se conservan tal cual.

**Resultado buscado en HTML:**

```html
<section id="page-estimer" class="page page-estimer">
  <h2 data-i18n="page.estimer.title">Estimer</h2>

  <!-- FORMULARIO DE ESTIMACIÓN -->
  <form id="estimer-form" novalidate>
    <!-- grupo cascada -->
    <div class="form-group">
      <label for="field-make" data-i18n="estimer.form.make">Marque</label>
      <select id="field-make" name="make" required></select>
    </div>
    <div class="form-group">
      <label for="field-model" data-i18n="estimer.form.model">Modèle</label>
      <select id="field-model" name="model" required disabled></select>
    </div>
    <div class="form-group">
      <label for="field-year" data-i18n="estimer.form.year">Année</label>
      <select id="field-year" name="year" required disabled></select>
    </div>
    <!-- campos simples -->
    <div class="form-group">
      <label for="field-mileage" data-i18n="estimer.form.mileage">Kilométrage</label>
      <input id="field-mileage" name="mileage" type="number" min="0" inputmode="numeric"
             placeholder="ex: 85000">
      <span class="field-error" id="mileage-error" hidden data-i18n="estimer.form.mileage.error"></span>
    </div>
    <div class="form-group">
      <label for="field-condition" data-i18n="estimer.form.condition">État</label>
      <select id="field-condition" name="condition">
        <option value="excellent" data-i18n="estimer.condition.excellent">Excellent</option>
        <option value="bon" selected data-i18n="estimer.condition.bon">Bon</option>
        <option value="moyen" data-i18n="estimer.condition.moyen">Moyen</option>
        <option value="mauvais" data-i18n="estimer.condition.mauvais">Mauvais</option>
        <option value="accidente" data-i18n="estimer.condition.accidente">Accidenté</option>
      </select>
    </div>
    <div class="form-group">
      <label for="field-fuel" data-i18n="estimer.form.fuel">Carburant</label>
      <select id="field-fuel" name="fuel">
        <option value="diesel" selected data-i18n="estimer.fuel.diesel">Diesel</option>
        <option value="essence" data-i18n="estimer.fuel.essence">Essence</option>
        <option value="hybride" data-i18n="estimer.fuel.hybride">Hybride</option>
        <option value="electrique" data-i18n="estimer.fuel.electrique">Électrique</option>
        <option value="gpl" data-i18n="estimer.fuel.gpl">GPL</option>
      </select>
    </div>
    <div class="form-group">
      <label for="field-transmission" data-i18n="estimer.form.transmission">Transmission</label>
      <select id="field-transmission" name="transmission">
        <option value="manuelle" selected data-i18n="estimer.transmission.manuelle">Manuelle</option>
        <option value="automatique" data-i18n="estimer.transmission.automatique">Automatique</option>
      </select>
    </div>
    <div class="form-group">
      <label for="field-city" data-i18n="estimer.form.city">Ville</label>
      <select id="field-city" name="city">
        <option value="Casablanca" selected data-i18n="estimer.city.casablanca">Casablanca</option>
        <option value="Rabat"      data-i18n="estimer.city.rabat">Rabat</option>
        <option value="Marrakech"  data-i18n="estimer.city.marrakech">Marrakech</option>
        <option value="Tanger"     data-i18n="estimer.city.tanger">Tanger</option>
        <option value="Agadir"     data-i18n="estimer.city.agadir">Agadir</option>
        <option value="Fes"        data-i18n="estimer.city.fes">Fès</option>
        <option value="Meknes"     data-i18n="estimer.city.meknes">Meknès</option>
        <option value="Tetouan"    data-i18n="estimer.city.tetouan">Tétouan</option>
        <option value="Oujda"      data-i18n="estimer.city.oujda">Oujda</option>
        <option value="Autres"     data-i18n="estimer.city.autres">Autres</option>
      </select>
    </div>
    <button type="submit" id="btn-estimer" class="btn-primary" disabled
            data-i18n="estimer.form.submit">
      Estimer
    </button>
  </form>

  <!-- SECCIÓN DE RESULTADO (oculta inicialmente) -->
  <div id="result-section" class="result-section" hidden>
    <!-- precio principal -->
    <div class="result-price-card card">
      <p class="result-label" data-i18n="result.estimated">Prix estimé</p>
      <p class="result-price" id="result-price"></p>
      <p class="result-range" id="result-range"></p>
    </div>

    <!-- tabla de desglose -->
    <div class="card">
      <h3 data-i18n="result.breakdown.title">Détail du calcul</h3>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th data-i18n="result.breakdown.col.label">Facteur</th>
            <th data-i18n="result.breakdown.col.factor">Coeff.</th>
            <th data-i18n="result.breakdown.col.amount">Montant</th>
          </tr>
        </thead>
        <tbody id="breakdown-body"></tbody>
      </table>
    </div>

    <!-- chips de marketplaces -->
    <div id="marketplace-section" class="marketplace-section">
      <p class="marketplace-label" data-i18n="result.marketplace.label">Voir les annonces</p>
      <div class="marketplace-chips">
        <a id="link-avito"     class="marketplace-chip" target="_blank" rel="noopener">Avito</a>
        <a id="link-moteur"    class="marketplace-chip" target="_blank" rel="noopener">Moteur</a>
        <a id="link-wandaloo"  class="marketplace-chip" target="_blank" rel="noopener">Wandaloo</a>
      </div>
    </div>

    <!-- botón nueva estimación -->
    <button id="btn-new-estimate" class="btn-secondary" data-i18n="result.new_estimate">
      Nouvelle estimation
    </button>
  </div>
</section>
```

[VERIFIED: lectura directa de index.html líneas 466-469]

---

## CAR_DB — Integración de Selects en Cascada

### Estructura real de CAR_DB (verificada en index.html líneas 664-735)

```javascript
var CAR_DB = {
  'Dacia': {
    'Logan':   { base_price: 105000, years: [2012, 2024], fuel_types: ['diesel', 'essence'] },
    'Sandero': { base_price: 100000, years: [2012, 2024], fuel_types: ['diesel', 'essence'] },
    'Duster':  { base_price: 160000, years: [2012, 2024], fuel_types: ['diesel', 'essence'] }
  },
  // ... 13 marcas más con el mismo patrón
};
```

`years` es un array de 2 elementos: `[min_year, max_year]`. No es una lista de años individuales — el rango se genera iterando de `years[0]` a `years[1]` inclusive.

### Patrón de poblar los selects

```javascript
// Poblar select de marcas (se llama una vez al init)
function populateMakes() {
  var makeSelect = document.getElementById('field-make');
  // Opción vacía por defecto
  makeSelect.innerHTML = '<option value="" data-i18n="estimer.form.make.placeholder">Choisir une marque</option>';
  Object.keys(CAR_DB).sort().forEach(function(make) {
    var opt = document.createElement('option');
    opt.value = make;
    opt.textContent = make;
    makeSelect.appendChild(opt);
  });
}

// Poblar select de modelos según marca seleccionada
function populateModels(make) {
  var modelSelect = document.getElementById('field-model');
  modelSelect.innerHTML = '<option value="" data-i18n="estimer.form.model.placeholder">Choisir un modèle</option>';
  modelSelect.disabled = !make;
  if (!make) return;
  Object.keys(CAR_DB[make]).sort().forEach(function(model) {
    var opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    modelSelect.appendChild(opt);
  });
}

// Poblar select de años según marca + modelo seleccionados
function populateYears(make, model) {
  var yearSelect = document.getElementById('field-year');
  yearSelect.innerHTML = '<option value="" data-i18n="estimer.form.year.placeholder">Choisir une année</option>';
  yearSelect.disabled = !(make && model);
  if (!make || !model) return;
  var range = CAR_DB[make][model].years; // [minYear, maxYear]
  for (var y = range[1]; y >= range[0]; y--) {  // orden descendente: más reciente primero
    var opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}
```

### Comportamiento en borde (cascada): cambiar marca

Al cambiar el select de marca, se debe:
1. Resetear y deshabilitar el select de modelo (`populateModels(newMake)`)
2. Resetear y deshabilitar el select de año (`populateYears('', '')`)
3. Recalcular el estado del botón submit (deshabilitarlo)

Al cambiar el select de modelo, se debe:
1. Resetear y poblar el select de año (`populateYears(make, newModel)`)
2. Recalcular el estado del botón submit

[VERIFIED: lectura directa de CAR_DB en index.html]

---

## Engine.estimate() — Firma Exacta

### Parámetros de entrada (verificados en index.html líneas 813-814)

```javascript
Engine.estimate({
  make:         'Dacia',       // string — clave de CAR_DB (sensible a mayúsculas)
  model:        'Logan',       // string — clave de CAR_DB[make]
  year:         2019,          // number o string numérico — se parsea con parseInt()
  mileage:      85000,         // number — se castea con Number(); debe ser >= 0
  condition:    'bon',         // 'excellent'|'bon'|'moyen'|'mauvais'|'accidente'
  fuel:         'diesel',      // 'diesel'|'essence'|'hybride'|'electrique'|'gpl'
  transmission: 'manuelle',    // 'manuelle'|'automatique'
  city:         'Casablanca'   // clave de DEPRECIATION.city_factors
});
```

**CRÍTICO:** Los valores de `condition`, `fuel`, `transmission` y `city` deben coincidir EXACTAMENTE con las claves de `DEPRECIATION` — si una clave no existe, `Engine.estimate()` retorna `null` (líneas 844-854). Los values de los `<option>` en HTML deben ser idénticos a estas claves.

### Valores exactos de DEPRECIATION (verificados en index.html líneas 742-803)

```javascript
// condition_factors — keys exactas para los <option>
'excellent' | 'bon' | 'moyen' | 'mauvais' | 'accidente'

// fuel_factors — keys exactas
'diesel' | 'essence' | 'hybride' | 'electrique' | 'gpl'

// transmission_factors — keys exactas
'manuelle' | 'automatique'

// city_factors — keys exactas
'Casablanca' | 'Rabat' | 'Marrakech' | 'Tanger' | 'Agadir' |
'Fes' | 'Meknes' | 'Tetouan' | 'Autres' | 'Oujda'
```

Notar que `Fes` NO lleva acento (no `Fès`), `Meknes` sin acento, `Tetouan` sin acento. Los `<option value="">` deben usar estas claves sin acento; el texto visible al usuario puede tener acento (atributo `data-i18n` lo gestiona).

### Estructura de retorno (verificada en index.html líneas 863-881)

```javascript
// Retorna null si validación falla (make/model no en CAR_DB, year NaN, mileage < 0,
// condition/fuel/transmission/city no reconocidos)
Engine.estimate(params) // → null | object

// Estructura del objeto retornado:
{
  estimated_price: 58700,          // number — redondeado a centenas, floor 8000 DH
  price_range: {
    min: 52800,                    // Math.round(estimated_price * 0.90 / 100) * 100
    max: 64600                     // Math.round(estimated_price * 1.10 / 100) * 100
  },
  breakdown: [
    // 7 objetos siempre presentes (nunca más, nunca menos)
    { label: 'Prix de base',           factor: 1.00,  amount_dh: 105000 },
    { label: 'Age (7 ans)',            factor: 0.43,  amount_dh: 45150  },
    { label: 'Kilometrage',            factor: 0.978, amount_dh: 44137  },
    { label: 'Etat',                   factor: 1.00,  amount_dh: 44137  },
    { label: 'Carburant',              factor: 1.06,  amount_dh: 46785  },
    { label: 'Ville',                  factor: 1.08,  amount_dh: 50527  },
    { label: 'Transmission',           factor: 1.00,  amount_dh: 50527  } // ← amount_dh de última fila = estimated_price (después de floor+redondeo)
  ]
}
```

Nota: el `label` en `breakdown` está actualmente hardcodeado en francés dentro de `Engine.estimate()` (líneas 870-877). Para la integración I18n, el plan debe usar claves fijas (`result.breakdown.base`, `result.breakdown.age`, etc.) en lugar de leer `breakdown[i].label` directamente, O mapear el índice de la fila a una clave i18n en la UI.

**Estrategia recomendada:** Mapear por índice fijo — `breakdown[0]` es siempre precio base, `breakdown[1]` siempre edad, etc. — usando un array de claves i18n en el código de renderizado de la tabla.

[VERIFIED: lectura directa de index.html líneas 812-881]

---

## Módulo History — Diseño

### Implementación mínima para Phase 4

```javascript
// ===============================================================
// HISTORY — Historial de valoraciones en localStorage
// Fase 4: save() + getAll(). Fase 5 extiende con delete() y clear().
// Clave localStorage: 'autoValeur_history'
// ===============================================================
var History = {
  _KEY: 'autoValeur_history',

  /**
   * Guardar una nueva entrada en el historial.
   * Genera id único via Date.now().
   * @param {object} entry - datos de la valoración (sin id ni date)
   */
  save: function(entry) {
    var all = History.getAll();
    var record = {
      id:             Date.now(),               // número único (ms desde epoch)
      make:           entry.make,
      model:          entry.model,
      year:           entry.year,
      mileage:        entry.mileage,
      condition:      entry.condition,
      fuel:           entry.fuel,
      transmission:   entry.transmission,
      city:           entry.city,
      estimated_price: entry.estimated_price,
      price_range:    entry.price_range,        // { min, max }
      breakdown:      entry.breakdown,          // array de 7 objetos
      date:           new Date().toISOString()  // ISO string para ordenación y display
    };
    all.unshift(record);  // más reciente primero (consistente con HIST-01)
    try {
      localStorage.setItem(History._KEY, JSON.stringify(all));
    } catch (e) {
      // localStorage bloqueado (modo privado, cuota llena) — fallo silencioso en Phase 4
      // Phase 6 añadirá mensaje de error al usuario (06-03)
      console.warn('AutoValeur — no se pudo guardar en historial:', e.message);
    }
  },

  /**
   * Obtener todas las entradas del historial.
   * Retorna array vacío si no hay datos o si JSON está corrompido.
   */
  getAll: function() {
    try {
      var raw = localStorage.getItem(History._KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
};
```

### Estructura de entry (D-12, verificada contra campos del formulario y retorno de Engine)

```javascript
{
  id:             1712930400000,       // Date.now() — número
  make:           'Dacia',
  model:          'Logan',
  year:           2019,                // número (parseInt del select)
  mileage:        85000,               // número
  condition:      'bon',
  fuel:           'diesel',
  transmission:   'manuelle',
  city:           'Casablanca',
  estimated_price: 58700,
  price_range:    { min: 52800, max: 64600 },
  breakdown:      [ /* 7 objetos */ ],
  date:           '2026-04-12T10:30:00.000Z'
}
```

### Posición en el script

Insertar `var History = {...}` inmediatamente después de `var Marketplaces = {...}` (línea 1022) y antes de `var ROUTES = {...}` (línea 1032). Esto respeta el patrón de declaración de globals del proyecto.

[ASSUMED: posición exacta de inserción — basada en lectura del archivo pero el planner debe confirmar que no hay código entre líneas 1022-1032]

---

## I18n — Integración

### Cómo funciona I18n (verificado en index.html líneas 580-641)

```javascript
// I18n.t(key) — obtiene traducción o devuelve la clave si no existe
I18n.t('estimer.form.make')  // → 'Marque' (fr) o 'الماركة' (ar)

// data-i18n en HTML — I18n._applyTranslations() lo procesa automáticamente
// en cada setLang()
<label data-i18n="estimer.form.make">Marque</label>

// data-i18n-html — para contenido con HTML embebido (solo iOS banner actual)
// data-i18n-aria — para atributos aria-label
<button data-i18n-aria="estimer.form.submit.aria">...</button>
```

`_applyTranslations()` recorre TODOS los `[data-i18n]` del DOM vía `querySelectorAll`. Se llama automáticamente cuando el usuario cambia de idioma — los nuevos elementos del formulario que tengan `data-i18n` se traducirán sin código adicional.

**CRÍTICO para `<option>` con `data-i18n`:** El método actual de `_applyTranslations()` aplica `textContent` a los elementos con `data-i18n`. Las `<option>` que se crean dinámicamente (selects cascada) NO tendrán `data-i18n` ya que se crean con JS puro desde las claves de CAR_DB. Solo los `<option>` estáticos (condition, fuel, transmission, city) pueden usar `data-i18n`. Las opciones dinámicas (marcas, modelos, años) usan los strings de CAR_DB directamente — son nombres propios (Dacia, Logan, etc.) que no se traducen.

### Claves STRINGS a añadir en Phase 4

Añadir a `STRINGS.fr` y `STRINGS.ar` respectivamente:

```javascript
// ── FORMULARIO ─────────────────────────────────────────────────
'estimer.form.make':                 'Marque',
'estimer.form.make.placeholder':     'Choisir une marque',
'estimer.form.model':                'Modèle',
'estimer.form.model.placeholder':    'Choisir un modèle',
'estimer.form.year':                 'Année',
'estimer.form.year.placeholder':     'Choisir une année',
'estimer.form.mileage':              'Kilométrage',
'estimer.form.mileage.placeholder':  'ex: 85000',
'estimer.form.mileage.error':        'Veuillez entrer un kilométrage valide (> 0)',
'estimer.form.condition':            'État',
'estimer.form.fuel':                 'Carburant',
'estimer.form.transmission':         'Transmission',
'estimer.form.city':                 'Ville',
'estimer.form.submit':               'Estimer',
// Estados
'estimer.condition.excellent':       'Excellent',
'estimer.condition.bon':             'Bon',
'estimer.condition.moyen':           'Moyen',
'estimer.condition.mauvais':         'Mauvais',
'estimer.condition.accidente':       'Accidenté',
// Carburantes
'estimer.fuel.diesel':               'Diesel',
'estimer.fuel.essence':              'Essence',
'estimer.fuel.hybride':              'Hybride',
'estimer.fuel.electrique':           'Électrique',
'estimer.fuel.gpl':                  'GPL',
// Transmisión
'estimer.transmission.manuelle':     'Manuelle',
'estimer.transmission.automatique':  'Automatique',
// Ciudades
'estimer.city.casablanca':           'Casablanca',
'estimer.city.rabat':                'Rabat',
'estimer.city.marrakech':            'Marrakech',
'estimer.city.tanger':               'Tanger',
'estimer.city.agadir':               'Agadir',
'estimer.city.fes':                  'Fès',
'estimer.city.meknes':               'Meknès',
'estimer.city.tetouan':              'Tétouan',
'estimer.city.oujda':                'Oujda',
'estimer.city.autres':               'Autres',

// ── RESULTADO ──────────────────────────────────────────────────
'result.estimated':                  'Prix estimé',
'result.range':                      'Fourchette : {min} – {max}',
'result.breakdown.title':            'Détail du calcul',
'result.breakdown.col.label':        'Facteur',
'result.breakdown.col.factor':       'Coeff.',
'result.breakdown.col.amount':       'Montant',
// Labels de filas de breakdown (para mapeo por índice)
'result.breakdown.base':             'Prix de base',
'result.breakdown.age':              'Âge',
'result.breakdown.km':               'Kilométrage',
'result.breakdown.condition':        'État',
'result.breakdown.fuel':             'Carburant',
'result.breakdown.city':             'Ville',
'result.breakdown.transmission':     'Transmission',
// Marketplaces
'result.marketplace.label':          'Voir les annonces similaires',
// Nueva estimación
'result.new_estimate':               'Nouvelle estimation',
```

El planner debe añadir las traducciones árabes correspondientes a `STRINGS.ar`.

[VERIFIED: estructura de STRINGS y I18n en index.html líneas 543-641]

---

## CSS — Patrones Existentes y Nuevas Clases

### Custom Properties disponibles (verificadas en index.html líneas 36-81)

```css
/* Paleta */
--primary:      #1a73e8;    /* azul — precio estimado prominente (D-07) */
--primary-dark: #1558b0;    /* hover de botones primarios */
--surface:      #ffffff;    /* fondo de cards */
--surface-2:    #f8f9fa;    /* fondo de página */
--surface-3:    #f1f3f4;    /* fondo de elementos secundarios */
--text:         #202124;    /* texto principal */
--text-muted:   #5f6368;    /* texto secundario, labels */
--accent:       #34a853;    /* verde — factor-up (bonus) */
--danger:       #ea4335;    /* rojo — factor-down (penalización) */
--warning:      #fbbc04;    /* naranja/amarillo (no usado en Phase 4) */
--border:       #e0e0e0;    /* bordes de cards y separadores */

/* Espaciado */
--sp-xs: 0.25rem; --sp-sm: 0.5rem; --sp-md: 1rem;
--sp-lg: 1.5rem;  --sp-xl: 2rem;   --sp-2xl: 3rem;

/* Radios */
--radius: 12px;  --radius-sm: 6px;  --radius-lg: 20px;

/* Sombras */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08)…;
--shadow-md: 0 4px 12px rgba(0,0,0,0.10)…;

/* Tipografía */
--font-size-sm: 0.875rem; --font-size-base: 1rem; --font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;  --font-size-2xl: 1.5rem;

/* Transiciones */
--transition-fast: 0.15s ease-out;  --transition-normal: 0.25s ease-out;
```

### Clases existentes reutilizables (verificadas en index.html líneas 394-450)

| Clase | Uso en Phase 4 |
|-------|---------------|
| `.card` | Wrapper de precio estimado y tabla de desglose |
| `.btn-primary` | Botón "Estimer" (submit) |
| `.btn-secondary` | Botón "Nouvelle estimation" |
| `.empty-state` | No usado en Phase 4 (Phase 5) |

### Nuevas clases CSS a definir en Phase 4

Añadir en el bloque `<style>` existente, después del último bloque actual (línea ~450):

```css
/* ── FORMULARIO ESTIMER ─────────────────────────────────────── */
.form-group {
  margin-bottom: var(--sp-md);
}

.form-group label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: var(--sp-xs);
}

.form-group select,
.form-group input[type="number"] {
  width: 100%;
  padding: 0.75rem var(--sp-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: var(--font-size-base);
  font-family: inherit;
  color: var(--text);
  appearance: none;            /* quitar flecha nativa en iOS */
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,…"); /* flecha personalizada */
  background-repeat: no-repeat;
  background-position: right var(--sp-md) center;
  transition: border-color var(--transition-fast);
}

.form-group select:focus,
.form-group input[type="number"]:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group select:disabled {
  background: var(--surface-3);
  color: var(--text-muted);
  cursor: not-allowed;
}

.field-error {
  display: block;
  color: var(--danger);
  font-size: var(--font-size-sm);
  margin-top: var(--sp-xs);
}

/* ── RESULTADO ──────────────────────────────────────────────── */
.result-section {
  margin-top: var(--sp-xl);
  /* Animación de aparición (D-08): fade-in + slide-up */
  /* La sección comienza con opacity:0 + translateY(12px) */
  /* Al quitar el atributo hidden y añadir clase .visible, transiciona */
  opacity: 0;
  transform: translateY(12px);
  transition: opacity var(--transition-normal), transform var(--transition-normal);
}

.result-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.result-price-card {
  text-align: center;
  padding: var(--sp-xl) var(--sp-md);
  margin-bottom: var(--sp-md);
}

.result-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--sp-sm);
}

.result-price {
  font-size: 2.5rem;           /* tipografía grande — D-07 */
  font-weight: 800;
  color: var(--primary);       /* color --primary — D-07 */
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.result-range {
  font-size: var(--font-size-base);
  color: var(--text-muted);
  margin-top: var(--sp-sm);
}

/* ── TABLA DE DESGLOSE ──────────────────────────────────────── */
.breakdown-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.breakdown-table th {
  text-align: start;           /* logical property — RTL safe */
  color: var(--text-muted);
  font-weight: 600;
  padding: var(--sp-xs) var(--sp-sm);
  border-bottom: 2px solid var(--border);
}

.breakdown-table td {
  padding: var(--sp-sm);
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.breakdown-table tr:last-child td {
  border-bottom: none;
  font-weight: 700;
}

/* Colores factor desglose (D-10) */
.factor-up {         /* factor > 1.0 — bonus */
  color: var(--accent);
  font-weight: 600;
}

.factor-down {       /* factor < 1.0 — penalización */
  color: var(--danger);
  font-weight: 600;
}

.factor-neutral {    /* factor = 1.0 — sin ajuste */
  color: var(--text-muted);
}

/* ── MARKETPLACE CHIPS ──────────────────────────────────────── */
.marketplace-section {
  margin-top: var(--sp-lg);
  margin-bottom: var(--sp-lg);
}

.marketplace-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: var(--sp-sm);
}

.marketplace-chips {
  display: flex;
  gap: var(--sp-sm);
  flex-wrap: wrap;
}

.marketplace-chip {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: var(--sp-sm) var(--sp-md);
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.marketplace-chip:hover {
  background: rgba(26, 115, 232, 0.08);
  border-color: var(--primary);
}
```

**Nota sobre la animación del resultado (D-08):**
No usar `hidden` attribute para controlar la visibilidad del resultado con animación, porque `hidden` suprime el elemento antes de que `transition` pueda ejecutarse. La secuencia correcta es:
1. Al inicializar la página: `result-section` tiene `display:none` (o `hidden` en HTML).
2. Al submit exitoso: quitar `hidden`, forzar reflow (`element.offsetHeight`), luego añadir clase `.visible`.
3. Esto permite que la transición CSS se dispare correctamente.

[VERIFIED: CSS custom properties en index.html líneas 36-81; clases .card, .btn-primary, .btn-secondary en líneas 394-450]

---

## Handler de Submit — Lógica Completa

```javascript
// Conectar en DOMContentLoaded (junto a I18n.init() y Router.init())
document.getElementById('estimer-form').addEventListener('submit', function(e) {
  e.preventDefault();

  // 1. Recoger valores del formulario
  var make         = document.getElementById('field-make').value;
  var model        = document.getElementById('field-model').value;
  var year         = parseInt(document.getElementById('field-year').value, 10);
  var mileage      = parseInt(document.getElementById('field-mileage').value, 10);
  var condition    = document.getElementById('field-condition').value;
  var fuel         = document.getElementById('field-fuel').value;
  var transmission = document.getElementById('field-transmission').value;
  var city         = document.getElementById('field-city').value;

  // 2. Validar km (D-04)
  var mileageError = document.getElementById('mileage-error');
  if (!mileage || mileage <= 0 || isNaN(mileage)) {
    mileageError.hidden = false;
    document.getElementById('field-mileage').focus();
    return;
  }
  mileageError.hidden = true;

  // 3. Llamar Engine.estimate()
  var result = Engine.estimate({ make, model, year, mileage, condition, fuel, transmission, city });
  if (!result) return; // no debería ocurrir si los selects están bien poblados

  // 4. Guardar en historial (D-12, EST-06)
  History.save({
    make, model, year, mileage, condition, fuel, transmission, city,
    estimated_price: result.estimated_price,
    price_range:     result.price_range,
    breakdown:       result.breakdown
  });

  // 5. Renderizar resultado (ver funciones renderResult, renderBreakdown, renderMarketplaces)
  renderResult(result, make, model, year);

  // 6. Scroll suave al resultado (D-06)
  document.getElementById('result-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Botón "Nouvelle estimation" (D-11)
document.getElementById('btn-new-estimate').addEventListener('click', function() {
  document.getElementById('estimer-form').reset();
  // Resetear selects cascada a estado inicial
  populateModels('');
  populateYears('', '');
  updateSubmitButton();
  // Ocultar resultado
  var resultSection = document.getElementById('result-section');
  resultSection.classList.remove('visible');
  setTimeout(function() { resultSection.hidden = true; }, 250); // esperar transición
  // Scroll al top
  document.getElementById('page-estimer').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
```

---

## Marketplaces.getLinks() — Firma Exacta

### Código verificado (index.html líneas 1004-1022)

```javascript
Marketplaces.getLinks(make, model, year)
// → { avito: string, moteur: string, wandaloo: string }

// Ejemplo:
Marketplaces.getLinks('Dacia', 'Logan', 2019)
// → {
//     avito:    'https://www.avito.ma/sp/voitures/dacia-logan-2019',
//     moteur:   'https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/dacia/modele/logan/',
//     wandaloo: 'https://www.wandaloo.com/occasion/voiture-occasion-maroc-annonce.html?q=Dacia%20Logan%202019'
//   }
```

La función `_slug()` interna normaliza el texto: minúsculas, espacios a guión, acentos franceses a ASCII. Se llama internamente — el consumidor pasa las strings originales de CAR_DB (ej: `'Classe C'`, no `'classe-c'`).

### Uso en renderMarketplaces()

```javascript
function renderMarketplaces(make, model, year) {
  var links = Marketplaces.getLinks(make, model, year);
  document.getElementById('link-avito').href    = links.avito;
  document.getElementById('link-moteur').href   = links.moteur;
  document.getElementById('link-wandaloo').href = links.wandaloo;
}
```

[VERIFIED: lectura directa de Marketplaces en index.html líneas 981-1022]

---

## formatPrice() — Firma Exacta

### Código verificado (index.html líneas 650-656)

```javascript
formatPrice(amount, lang)
// amount: number
// lang:   I18n.currentLang — 'fr' | 'ar'
// → string con separador de miles + ' DH'

// Ejemplos:
formatPrice(58700, 'fr')  // → '58 700 DH'
formatPrice(58700, 'ar')  // → '58 700 DH' (dígitos latinos forzados via -u-nu-latn)
formatPrice(8000, 'fr')   // → '8 000 DH'
```

**Uso en el renderizado del resultado:**

```javascript
// Precio estimado
document.getElementById('result-price').textContent = formatPrice(result.estimated_price, I18n.currentLang);

// Rango
document.getElementById('result-range').textContent =
  formatPrice(result.price_range.min, I18n.currentLang) + ' – ' +
  formatPrice(result.price_range.max, I18n.currentLang);

// Importes en la tabla de desglose
formatPrice(breakdown[i].amount_dh, I18n.currentLang)
```

[VERIFIED: lectura directa de index.html líneas 650-656]

---

## Renderizado de la Tabla de Desglose

### Mapeo índice → clave i18n (7 filas fijas)

```javascript
var BREAKDOWN_KEYS = [
  'result.breakdown.base',         // [0] Prix de base
  'result.breakdown.age',          // [1] Âge
  'result.breakdown.km',           // [2] Kilométrage
  'result.breakdown.condition',    // [3] État
  'result.breakdown.fuel',         // [4] Carburant
  'result.breakdown.city',         // [5] Ville
  'result.breakdown.transmission'  // [6] Transmission
];

function renderBreakdown(breakdown) {
  var tbody = document.getElementById('breakdown-body');
  tbody.innerHTML = '';
  breakdown.forEach(function(row, i) {
    var tr = document.createElement('tr');
    // Determinar clase de color (D-10)
    var factorClass = 'factor-neutral';
    if (i > 0) { // primera fila (precio base) siempre neutra
      if (row.factor > 1.0)      factorClass = 'factor-up';
      else if (row.factor < 1.0) factorClass = 'factor-down';
    }
    tr.innerHTML =
      '<td>' + I18n.t(BREAKDOWN_KEYS[i]) + '</td>' +
      '<td class="' + factorClass + '">×' + row.factor.toFixed(2) + '</td>' +
      '<td class="' + factorClass + '">' + formatPrice(row.amount_dh, I18n.currentLang) + '</td>';
    tbody.appendChild(tr);
  });
}
```

---

## Arquitectura Patterns — Inserción en el Script

### Orden actual de declaraciones (verificado)

```
línea 527  — IIFE early dir/lang
línea 543  — var STRINGS = {...}
línea 580  — var I18n = {...}
línea 650  — function formatPrice(...)
línea 664  — var CAR_DB = {...}
línea 742  — var DEPRECIATION = {...}
línea 812  — var Engine = {...}
línea 884  — Tests inline (dev only)
línea 981  — var Marketplaces = {...}
línea 1022 — [FIN DE Marketplaces]   ← INSERTAR History aquí
línea 1032 — var ROUTES = {...}
línea 1039 — var Router = {...}
línea 1100 — DOMContentLoaded listener
línea 1111 — Service Worker
línea 1128 — PWA Install logic
```

### Qué añade cada plan en el script

| Plan | Qué se añade en el script |
|------|--------------------------|
| 04-01 | `populateMakes()`, `populateModels()`, `populateYears()`, `updateSubmitButton()`, listeners de cascada, `populateMakes()` en DOMContentLoaded |
| 04-02 | `var History = {...}` (después de Marketplaces), handler del `estimer-form submit`, handler del `btn-new-estimate`, llamada a `History.save()` en submit handler |
| 04-03 | `renderResult()` (precio + rango + mostrar sección con animación) |
| 04-04 | `BREAKDOWN_KEYS` array, `renderBreakdown()` |
| 04-05 | `renderMarketplaces()`, claves i18n de marketplaces en STRINGS |

---

## Pitfalls Comunes

### Pitfall 1: `hidden` vs `.visible` para animar el resultado
**Qué sale mal:** Poner `result-section.hidden = false` y esperar que `transition` funcione. El navegador no puede interpolar desde estado oculto.
**Cómo evitar:** Quitar `hidden` → forzar reflow con `void element.offsetHeight` → añadir clase `.visible` en el mismo tick JS (o en requestAnimationFrame).
```javascript
var section = document.getElementById('result-section');
section.hidden = false;
void section.offsetHeight;  // fuerza reflow
section.classList.add('visible');
```

### Pitfall 2: Value de `<option>` no coincide con clave de DEPRECIATION
**Qué sale mal:** `Engine.estimate()` retorna `null` silenciosamente si `condition`, `fuel`, `transmission` o `city` no son claves exactas en DEPRECIATION.
**Claves exactas verificadas:**
- `condition`: `excellent`, `bon`, `moyen`, `mauvais`, `accidente` (sin acento en `accidente`)
- `city`: `Fes` sin acento, `Meknes` sin acento, `Tetouan` sin acento

### Pitfall 3: `data-i18n` en opciones generadas dinámicamente
**Qué sale mal:** Añadir `data-i18n` a `<option>` creadas por JS. `_applyTranslations()` las traduce correctamente al cambiar idioma, pero sobreescribe el `textContent` — incluyendo el de las opciones de la cascada que tienen nombres propios (Dacia, Logan, etc.).
**Cómo evitar:** Solo las opciones estáticas (condition, fuel, transmission, city) usan `data-i18n`. Los selects de marca/modelo/año se regeneran con texto literal de CAR_DB.

### Pitfall 4: `parseInt` en year del select cascada
**Qué sale mal:** El valor de un `<option>` siempre es string. Si se pasa `year: "2019"` como string a `Engine.estimate()`, funciona (usa `parseInt` internamente). Pero si History guarda `year: "2019"` como string, la Fase 5 puede tener inconsistencias al comparar años.
**Cómo evitar:** Convertir siempre a número en el handler: `var year = parseInt(yearSelect.value, 10)`.

### Pitfall 5: Scroll al resultado en iOS con `scrollIntoView`
**Qué sale mal:** `scrollIntoView({ behavior: 'smooth' })` puede no funcionar en iOS Safari < 15.4.
**Cómo evitar:** Usar como fallback `window.scrollTo({ top: element.offsetTop - 16, behavior: 'smooth' })`. Ambos métodos en secuencia no causan conflicto.

### Pitfall 6: `data-i18n` en el `<placeholder>` de inputs
**Qué sale mal:** `_applyTranslations()` usa `textContent` — no actualiza el atributo `placeholder` de inputs.
**Cómo evitar:** El placeholder del input km es solo decorativo (`ex: 85000`). Para soporte I18n del placeholder se necesitaría `data-i18n-placeholder` y código adicional en `_applyTranslations()`. En Phase 4, omitir placeholder traducible y usar solo el label.

---

## Validación Architecture

**nyquist_validation:** `true` (confirmado en config.json)

### Framework de test
Esta es una app sin test runner (vanilla JS, archivo único). Los tests existentes son inline en consola (líneas 884-974), solo ejecutados en `localhost`. Para Phase 4, la validación sigue el mismo patrón.

| Property | Value |
|----------|-------|
| Framework | Inline console tests (patrón existente del proyecto) |
| Config file | Ninguno — tests embebidos en index.html bajo `if (location.hostname === 'localhost')` |
| Quick run command | Abrir index.html en browser local, verificar consola DevTools |
| Full suite command | Ídem — todos los tests son síncronos e instantáneos |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Cómo verificar |
|--------|----------|-----------|----------------|
| EST-01 | Cascada: cambiar marca limpia/puebla modelo; cambiar modelo puebla año | Manual + console | Seleccionar Dacia → Renault → verificar modelos cambian |
| EST-02 | Todos los campos presentes con valores correctos | Manual visual | Revisar que los 8 campos estén en el formulario |
| EST-03 | Precio estimado aparece con rango tras submit | Manual | Rellenar formulario → submit → ver precio |
| EST-04 | Tabla de 7 filas en desglose | Manual + console assert | `document.querySelectorAll('#breakdown-body tr').length === 7` |
| EST-05 | Factor en formato `×1.06` + importe en DH | Manual visual | Verificar formato en tabla |
| EST-06 | Entrada guardada en localStorage tras submit | Console | `JSON.parse(localStorage.getItem('autoValeur_history'))` |
| EST-07 | URLs correctas en chips de marketplace | Manual | Verificar href de cada chip tras estimación |
| UI-01/02 | Diseño coherente con paleta existente | Manual visual | Comparar con header y nav existentes |
| UI-03 | RTL correcto al cambiar a AR | Manual | Cambiar a AR → verificar alineación del formulario |

### Wave 0 Gaps
Ningún test runner que instalar. El planner puede añadir un bloque `console.assert` inline en el mismo bloque dev-only existente para EST-04 y EST-06.

---

## Asignación de Waves y Paralelismo

**Restricción crítica:** Los 5 planes modifican el mismo archivo `index.html`. No hay paralelismo posible — cualquier edición concurrente causaría conflictos de merge. Todos los planes deben ser secuenciales.

| Plan | Nombre | Wave | Depende de | Razón de secuencia |
|------|--------|------|-----------|-------------------|
| 04-01 | Formulario cascada | 1 | — | Primer plan; crea el HTML base del formulario y los selects dinámicos |
| 04-02 | Submit handler + History | 2 | 04-01 | Necesita los IDs de campo del formulario creados en 04-01; crea `var History` |
| 04-03 | Sección resultado (precio + animación) | 3 | 04-02 | Necesita que el submit handler invoque `renderResult()`; la sección result HTML puede añadirse en 04-01 pero la lógica de renderizado va aquí |
| 04-04 | Tabla desglose | 4 | 04-03 | Extiende el resultado ya renderizado; necesita que `#result-section` esté visible |
| 04-05 | Chips marketplaces | 5 | 04-03 | Puede ir en Wave 4 junto a 04-04 si los IDs `#link-avito` etc. se añaden en 04-01 |

**Optimización posible:** 04-04 y 04-05 pueden ir en la misma Wave 4 si el HTML completo del resultado (incluyendo `#breakdown-body` y los `#link-*`) se añade en el plan 04-01 como estructura estática vacía. Esto elimina una wave y permite que 04-04 y 04-05 editen secciones no superpuestas del script.

**Tabla de waves definitiva (recomendada):**

| Wave | Planes | Tipo |
|------|--------|------|
| Wave 1 | 04-01 | HTML completo de la sección + CSS + selects dinámicos |
| Wave 2 | 04-02 | `var History` + submit handler + btn-new-estimate handler |
| Wave 3 | 04-03 | `renderResult()` (precio, rango, animación) |
| Wave 4 | 04-04, 04-05 | `renderBreakdown()` + `renderMarketplaces()` (paralelo posible si editan funciones separadas) |

**Nota:** Wave 4 es técnicamente paralela en lógica (funciones independientes), pero como editan el mismo archivo `index.html`, el planner debe ejecutarlas secuencialmente a menos que el sistema de planes soporte merge automático.

---

## Environment Availability

Step 2.6: SKIPPED — la fase es puramente edición de código/HTML en un archivo existente. Sin dependencias externas de runtime, CLIs, ni servicios.

---

## Assumptions Log

| # | Claim | Section | Risk si está mal |
|---|-------|---------|-----------------|
| A1 | El `var History` se inserta entre línea 1022 y 1032 | Módulo History | Conflicto de orden de declaración si hay código no visible en esa zona — verificar con lectura antes de insertar |
| A2 | Las claves de `DEPRECIATION.city_factors` sin acento (`Fes`, `Meknes`, `Tetouan`) son las que deben ir en `value=""` de los `<option>` | CAR_DB Integration | Si se usan con acento, Engine retorna null silenciosamente |
| A3 | `_applyTranslations()` no necesita modificación para las nuevas claves — el bucle `querySelectorAll('[data-i18n]')` las cubre automáticamente | I18n Integration | Si hay `data-i18n` en `<option>` generadas dinámicamente, sobrescribe las de cascada — pero este riesgo está documentado en Pitfall 3 |

---

## Open Questions

1. **Traducción árabe de las nuevas cadenas STRINGS**
   - Qué sabemos: las claves FR están definidas en este research
   - Qué no está claro: el planner o el usuario debe proveer las traducciones AR (o aceptar que Phase 4 implemente primero FR y AR se complete cuando sea posible)
   - Recomendación: el planner añade las traducciones AR en el mismo plan 04-01 usando conocimiento del árabe marroquí estándar para los labels del formulario

2. **¿El HTML del resultado va todo en 04-01 o se añade por partes?**
   - Qué sabemos: añadir todo el HTML de la sección result en 04-01 como estructura estática permite que 04-04 y 04-05 sean paralelos en Wave 4
   - Qué no está claro: si el planner prefiere que cada plan añada su propio HTML (más limpio en diff, más fácil de revisar)
   - Recomendación: añadir el HTML completo en 04-01 (estructura estática, sin lógica JS) — simplifica las waves siguientes

---

## Sources

### Primary (HIGH confidence)
- `index.html` (lectura directa, líneas 1-1166) — estructura de page-estimer, CSS custom properties, STRINGS, I18n, formatPrice, CAR_DB, DEPRECIATION, Engine.estimate, Marketplaces.getLinks, Router, DOMContentLoaded init
- `.planning/phases/04-p-gina-estimer/04-CONTEXT.md` — decisiones D-01 a D-17 (todas locked)
- `.planning/phases/03-motor-de-valoraci-n-y-base-de-datos/03-CONTEXT.md` — Engine signature, Marketplaces signature, breakdown structure
- `.planning/phases/02-internacionalizaci-n-fr-ar/02-CONTEXT.md` — I18n pattern, data-i18n, STRINGS structure
- `.planning/REQUIREMENTS.md` — EST-01 a EST-07, UI-01 a UI-04
- `.planning/config.json` — nyquist_validation: true

### No se necesitaron fuentes externas
Toda la información de integración proviene del código fuente real del proyecto. No hay dependencias externas de runtime que investigar.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todo el código existe y fue leído directamente
- Architecture patterns: HIGH — CSS, JS y HTML structure verificados línea a línea
- Pitfalls: HIGH — identificados del comportamiento real del código (Engine.estimate retorna null, `hidden` + `transition`, keys exactas de DEPRECIATION)
- I18n integration: HIGH — módulo I18n leído completo
- Wave assignment: MEDIUM — la restricción de "mismo archivo" es verificada; la granularidad de la parallelización en Wave 4 depende de cómo el planner maneje los diffs

**Research date:** 2026-04-12
**Valid until:** Indefinido — la base de código es estable (no hay dependencias externas que cambien)
