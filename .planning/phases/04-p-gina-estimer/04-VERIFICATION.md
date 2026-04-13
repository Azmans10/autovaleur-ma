---
phase: 04-p-gina-estimer
verified: 2026-04-13T00:00:00Z
status: human_needed
score: 5/5 must-haves del roadmap verificados
overrides_applied: 0
human_verification:
  - test: "Rellenar formulario y confirmar precio estimado visible con animación"
    expected: "Al pulsar Estimer con datos válidos, #result-section aparece con animación fade-in+slide-up y muestra precio en 2.5rem azul (#1a73e8)"
    why_human: "El CSS transition requiere browser para verificar; no puede confirmarse con análisis estático"
  - test: "Validación de km en submit"
    expected: "Al dejar km vacío y pulsar Estimer, aparece error bajo el campo y el formulario no avanza"
    why_human: "Comportamiento visual e interacción del DOM en tiempo de ejecución"
  - test: "Cascada Marca → Modelo → Año funcional"
    expected: "Seleccionar una marca habilita el select de Modelo; seleccionar un modelo habilita el de Año con rango descendente correcto; el botón Estimer se habilita solo cuando los tres tienen valor"
    why_human: "Comportamiento dinámico del DOM; no verificable con análisis estático"
  - test: "Historial guardado en localStorage tras submit válido"
    expected: "History.getAll() ejecutado en la consola devuelve un array con 1 entrada que contiene los 13 campos definidos (id, make, model, year, mileage, condition, fuel, transmission, city, estimated_price, price_range, breakdown, date)"
    why_human: "Requiere ejecución real en browser con localStorage disponible"
  - test: "Tabla de desglose con 7 filas y colores correctos"
    expected: "La tabla muestra exactamente 7 filas; fila [0] con factor-neutral (gris); filas con factor < 1.0 en factor-down (rojo); factores con formato ×0.43 usando símbolo Unicode"
    why_human: "Renderizado dinámico: tbody se rellena en runtime; verificable solo en browser"
  - test: "Chips de marketplaces con URLs dinámicas"
    expected: "Tras submit con Toyota/Corolla/2020, los anchors link-avito/link-moteur/link-wandaloo tienen href con la marca/modelo/año; cada chip abre en nueva pestaña"
    why_human: "href es asignado dinámicamente por renderMarketplaces(); no puede verificarse con análisis estático de HTML"
  - test: "Botón Nouvelle estimation resetea estado completo"
    expected: "Al pulsar el botón, el formulario queda en blanco, #result-section se oculta con transición CSS y #marketplace-section vuelve a hidden=true"
    why_human: "Transición CSS y estado del DOM en tiempo de ejecución"
  - test: "Cambio de idioma AR traduce todos los elementos estáticos"
    expected: "Los labels del formulario, labels de la tabla de desglose, y el label de marketplace se traducen al árabe; los precios en DH mantienen dígitos latinos"
    why_human: "Comportamiento visual del sistema i18n en tiempo de ejecución"
---

# Phase 4: Página Estimer — Verification Report

**Phase Goal:** La página principal: formulario de valoración + resultado con desglose + links a marketplaces.
**Verified:** 2026-04-13
**Status:** human_needed
**Re-verification:** No — verificación inicial

## Goal Achievement

### Observable Truths (Success Criteria del ROADMAP)

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Completar el formulario muestra el precio estimado con rango y desglose de 7 líneas | ✓ VERIFIED (código) / ? HUMAN (runtime) | `#result-price`, `#result-range`, `#breakdown-body`, `renderResult()` y `renderBreakdown()` existen y están conectados. Requiere ejecución en browser para confirmar el output visual. |
| 2  | La valoración se guarda automáticamente en el historial al completarse | ✓ VERIFIED (código) | `History.save()` se llama en el submit handler (línea 1760) con los 13 campos completos. `localStorage.setItem` con try/catch en línea 1618. |
| 3  | Los 3 links de marketplaces generan URLs correctas con marca/modelo/año | ✓ VERIFIED (código) / ? HUMAN (runtime) | `renderMarketplaces()` llama a `Marketplaces.getLinks(make, model, year)` (línea 1870) y asigna href a los 3 anchors. URLs requieren verificación en browser. |
| 4  | El formulario cascada (marca → modelo → año) funciona correctamente | ✓ VERIFIED (código) / ? HUMAN (runtime) | `EstimerForm._populateMakes/Models/Years()` conectados via change listeners (líneas 1559, 1569). `Object.keys(CAR_DB).sort()` en línea 1479. |
| 5  | El formulario inválido (sin km) muestra error y no calcula | ✓ VERIFIED (código) | Validación `!mileageRaw \|\| isNaN(mileage) \|\| mileage <= 0` en línea 1736; `mileageError.hidden = false` en línea 1737; return antes de Engine.estimate(). |

**Score:** 5/5 truths con implementación verificada en código. Las 5 requieren confirmación visual en browser.

### Required Artifacts

| Artifact | Provides | Status | Detalles |
|----------|----------|--------|----------|
| `index.html` — `id="estimer-form"` | Formulario de 8 campos | ✓ VERIFIED | Línea 670. Los 8 campos existen: make (675), model (682), year (689), mileage (697), condition (708), fuel (719), transmission (730), city (738). |
| `index.html` — `var EstimerForm` | Cascada Marca→Modelo→Año desde CAR_DB | ✓ VERIFIED | Línea 1466. `_populateMakes()`, `_populateModels()`, `_populateYears()`, `_updateSubmitState()` implementados. |
| `index.html` — `var History` | Módulo de historial con `save()` y `getAll()` | ✓ VERIFIED | Línea 1591. `_KEY = 'autoValeur_history'`. `save()` con 13 campos + unshift + try/catch. `getAll()` con try/catch retorna `[]` si vacío. |
| `index.html` — submit handler | Handler de validación + Engine + History + render | ✓ VERIFIED | Línea 1720. Validación km → Engine.estimate() → History.save() → renderResult() → scrollIntoView. |
| `index.html` — `function renderResult` | Orquesta visualización del resultado | ✓ VERIFIED | Línea 1782. Escribe en #result-price y #result-range; llama renderBreakdown/renderMarketplaces con guards; activa animación con reflow. |
| `index.html` — `id="result-price"` + `id="result-range"` | Tarjeta de precio estimado | ✓ VERIFIED | Líneas 766-767 dentro de `.result-price-card.card`. CSS: font-size 2.5rem, font-weight 800, color var(--primary) (líneas 556-563). |
| `index.html` — `function renderBreakdown` + `BREAKDOWN_KEYS` | Tabla de desglose | ✓ VERIFIED | Líneas 1838 (BREAKDOWN_KEYS con 7 claves) y 1848 (renderBreakdown). Lógica factor-neutral/up/down por índice. Símbolo `\u00d7`. |
| `index.html` — `id="breakdown-body"` | tbody de la tabla de desglose | ✓ VERIFIED | Línea 781 dentro de `.breakdown-table`. |
| `index.html` — `id="marketplace-section"` + 3 anchors | Chips de marketplace | ✓ VERIFIED | Línea 786 con `hidden`. Anchors link-avito (789), link-moteur (790), link-wandaloo (791) con `rel="noopener"` y `target="_blank"`. |
| `index.html` — `function renderMarketplaces` | Conecta Marketplaces.getLinks() con los anchors | ✓ VERIFIED | Línea 1869. Llama `Marketplaces.getLinks()`, asigna href a los 3 anchors, quita hidden de #marketplace-section. |
| `index.html` — CSS `.result-section` + `.visible` | Animación fade-in + slide-up | ✓ VERIFIED | Líneas 530-540. `opacity 0 → 1`, `translateY(12px → 0)` con transition. |
| `index.html` — CSS `.breakdown-table`, `.factor-up/.down/.neutral` | Colores por factor | ✓ VERIFIED | Líneas 572-610. factor-up: var(--accent); factor-down: var(--danger); factor-neutral: var(--text-muted). |
| `index.html` — CSS `.marketplace-chip` | Pills con propiedades lógicas | ✓ VERIFIED | Líneas 629-643. `padding-block`, `padding-inline`, `min-inline-size` (UI-03). hover/focus state implementado. |
| `index.html` — STRINGS.fr/ar para formulario y resultado | Cadenas i18n completas FR+AR | ✓ VERIFIED | Cadenas estimer.form.* (líneas 889-924), result.* (líneas 926-940), result.breakdown.* (líneas 928-938), result.marketplace.label (939). Equivalentes AR en Unicode (líneas 993-1007). |
| `index.html` — `id="btn-new-estimate"` handler | Resetea formulario y oculta resultado | ✓ VERIFIED | Línea 1815. Llama form.reset(), EstimerForm._populateModels/Years, oculta marketplace-section y result-section con animación, scroll a page-estimer. |

### Key Link Verification

| From | To | Via | Status | Detalles |
|------|----|-----|--------|----------|
| `populateMakes()` | `CAR_DB` | `Object.keys(CAR_DB).sort()` | ✓ WIRED | Línea 1479 |
| `field-make onchange` | `populateModels(make)` | addEventListener change | ✓ WIRED | Línea 1559 — `EstimerForm._populateModels(make)` |
| `field-model onchange` | `populateYears(make, model)` | addEventListener change | ✓ WIRED | Línea 1569 — `EstimerForm._populateYears(make, model)` |
| `#estimer-form submit` | `Engine.estimate()` | event listener submit | ✓ WIRED | Línea 1744 — `Engine.estimate({make, model, year, mileage, condition, fuel, transmission, city})` |
| `Engine.estimate() result` | `History.save()` | llamada directa tras resultado válido | ✓ WIRED | Línea 1760 — llamada inmediata si result no es null |
| `History.save()` | `localStorage` | `localStorage.setItem(History._KEY, ...)` | ✓ WIRED | Línea 1618 — con try/catch |
| `renderResult()` | `#result-section` | `hidden = false` + `.visible` + `scrollIntoView` | ✓ WIRED | Líneas 1809-1811 |
| `renderResult()` | `renderBreakdown()` | guard `typeof === 'function'` | ✓ WIRED | Línea 1797 |
| `renderResult()` | `renderMarketplaces()` | guard `typeof === 'function'` | ✓ WIRED | Línea 1802 |
| `renderBreakdown()` | `#breakdown-body` | `getElementById('breakdown-body').innerHTML` | ✓ WIRED | Línea 1849 |
| `BREAKDOWN_KEYS[i]` | `I18n.t()` | `I18n.t(BREAKDOWN_KEYS[i])` | ✓ WIRED | Línea 1861 |
| `renderMarketplaces()` | `Marketplaces.getLinks()` | `var links = Marketplaces.getLinks(make, model, year)` | ✓ WIRED | Línea 1870 |
| `#btn-new-estimate click` | `#marketplace-section hidden` | `marketplaceSection.hidden = true` | ✓ WIRED | Línea 1824 |

### Data-Flow Trace (Level 4)

| Artifact | Variable de datos | Fuente | Produce datos reales | Status |
|----------|-------------------|--------|----------------------|--------|
| `#result-price` | `result.estimated_price` | `Engine.estimate()` (Fase 3, motor calibrado) | Sí — algoritmo con CAR_DB + DEPRECIATION | ✓ FLOWING |
| `#result-range` | `result.price_range.min/max` | `Engine.estimate()` | Sí — calculado por el motor | ✓ FLOWING |
| `#breakdown-body` | `result.breakdown` (7 objetos) | `Engine.estimate()` | Sí — 7 factores calculados | ✓ FLOWING |
| `#link-avito/.moteur/.wandaloo` | `Marketplaces.getLinks(make, model, year)` | `var Marketplaces` (Fase 3) | Sí — URLs generadas con slugs de CAR_DB | ✓ FLOWING |
| `localStorage` | `History.save(entry)` | Formulario + resultado del Engine | Sí — datos completos del submit | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — La app es una SPA en un único HTML sin server. Las verificaciones comportamentales requieren abrir el archivo en un browser real.

### Requirements Coverage

| Requirement | Plan | Descripción | Status | Evidencia |
|-------------|------|-------------|--------|-----------|
| EST-01 | 04-01 | Formulario con 8 campos | ✓ SATISFIED | 8 ids de campo verificados en el HTML |
| EST-02 | 04-01 | Cascada marca→modelo→año desde CAR_DB | ✓ SATISFIED | EstimerForm con Object.keys(CAR_DB) |
| EST-03 | 04-03 | Sección resultado con precio prominente | ✓ SATISFIED | #result-price con 2.5rem, var(--primary) |
| EST-04 | 04-04 | Tabla desglose 7 filas | ✓ SATISFIED | renderBreakdown + BREAKDOWN_KEYS[7] |
| EST-05 | 04-04 | Colores verde/rojo por factor | ✓ SATISFIED | factor-up/down/neutral con var(--accent)/var(--danger) |
| EST-06 | 04-02 | Guardado automático en historial | ✓ SATISFIED | History.save() llamado en submit handler |
| EST-07 | 04-05 | 3 chips de marketplace con URLs dinámicas | ✓ SATISFIED | renderMarketplaces() + Marketplaces.getLinks() |
| UI-01 | 04-01..05 | Diseño coherente con el resto de la app | ? NEEDS HUMAN | Requiere revisión visual |
| UI-02 | 04-03..04 | Tipografía y espaciado consistentes | ? NEEDS HUMAN | Requiere revisión visual |
| UI-03 | 04-01..05 | CSS logical properties para RTL | ✓ SATISFIED | padding-inline, padding-block, min-inline-size, margin-block verificados |
| UI-04 | 04-03 | Animación de aparición resultado | ✓ SATISFIED (código) / ? HUMAN (visual) | CSS transition + reflow JS implementados |

### Anti-Patterns Found

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| `index.html` | 766, 767 | `<p id="result-price"></p>` / `<p id="result-range"></p>` vacíos | ℹ️ Info | Intencional — elementos de datos dinámicos, se rellenan en runtime por `renderResult()`. No es stub. |
| `index.html` | 781 | `<tbody id="breakdown-body"></tbody>` vacío | ℹ️ Info | Intencional — se rellena dinámicamente por `renderBreakdown()` en cada submit. No es stub. |
| `index.html` | 789-791 | Anchors con `href="#"` | ℹ️ Info | Intencional — hrefs se reemplazan con URLs reales por `renderMarketplaces()`. Valor inicial correcto según D-15. |

No se encontraron stubs bloqueantes ni anti-patrones de implementación incompleta. Los elementos vacíos son receptores de datos dinámicos con handlers completamente implementados.

### Human Verification Required

#### 1. Precio estimado — animación y output visual

**Test:** Abrir index.html en Chrome. Seleccionar Dacia / Logan / 2019. Introducir 85000 en km. Dejar valores por defecto (bon/diesel/manuelle/Casablanca). Pulsar "Estimer".
**Expected:** La sección de resultado aparece con animación fade-in + slide-up. El precio se muestra en tipografía grande (~2.5rem) con color azul (#1a73e8). El rango aparece debajo en gris.
**Why human:** La CSS transition y el output visual de formatPrice() requieren ejecución en browser.

#### 2. Validación de km

**Test:** Dejar el campo km vacío y pulsar "Estimer".
**Expected:** Aparece el mensaje de error "Veuillez entrer un kilométrage valide (> 0)" bajo el campo km. El formulario no avanza. La consola no muestra errores JS.
**Why human:** Comportamiento DOM en tiempo de ejecución; foco del campo requiere browser.

#### 3. Cascada funcional

**Test:** Seleccionar una marca (ej: Toyota). Verificar que el select Modelo se habilita y muestra modelos de Toyota. Seleccionar un modelo (ej: Corolla). Verificar que el select Año se habilita con años descendentes. Verificar que el botón Estimer se habilita.
**Expected:** Tres selects se habilitan en secuencia correcta; cambiar la marca resetea Modelo y Año.
**Why human:** Comportamiento dinámico del DOM.

#### 4. Historial en localStorage

**Test:** Tras un submit válido, ejecutar `History.getAll()` en la consola del browser.
**Expected:** Retorna un array con 1 entrada que contiene: id (número), make, model, year, mileage, condition, fuel, transmission, city, estimated_price, price_range ({min, max}), breakdown (array de 7 objetos), date (ISO string).
**Why human:** Requiere ejecución real con localStorage disponible.

#### 5. Tabla de desglose — 7 filas y colores

**Test:** Tras submit válido, inspeccionar `document.querySelectorAll('#breakdown-body tr').length`.
**Expected:** Exactamente 7. La fila [0] (Prix de base) tiene celdas con clase `factor-neutral` (gris). La fila [1] (Âge) tiene clase `factor-down` (rojo) porque el factor de edad es siempre < 1.0. Los factores tienen formato `×0.43` con símbolo ×.
**Why human:** Renderizado dinámico del tbody.

#### 6. Chips de marketplace — URLs dinámicas y nueva pestaña

**Test:** Tras submit con Toyota/Corolla/2020, verificar `document.getElementById('link-avito').href`. Pulsar el chip Avito.
**Expected:** La URL contiene "toyota" y "corolla". Se abre una nueva pestaña en avito.ma. Los anchors tienen `rel="noopener"` (ya verificado en código).
**Why human:** Asignación de href es dinámica; apertura de nueva pestaña requiere browser.

#### 7. Reset con "Nouvelle estimation"

**Test:** Tras ver el resultado, pulsar "Nouvelle estimation".
**Expected:** El formulario queda en blanco (selects Modelo y Año deshabilitados, km vacío). La sección de resultado desaparece con transición CSS. Los chips de marketplace desaparecen. El scroll vuelve al formulario.
**Why human:** Transición CSS de 250ms y estado del DOM requieren browser.

#### 8. Cambio de idioma a AR

**Test:** Pulsar el botón AR. Navegar a la página Estimer.
**Expected:** Los labels del formulario se muestran en árabe. Tras un submit, los labels de la tabla de desglose (Facteur, Coeff., etc.) se muestran en árabe. El label "Voir les annonces similaires" se muestra en árabe. Los precios en DH usan dígitos 0-9 (no dígitos árabes).
**Why human:** Comportamiento visual del sistema i18n; dígitos latinos en precios requiere verificación visual.

### Gaps Summary

No se encontraron gaps estructurales. Todos los must-haves del ROADMAP tienen implementación completa y conectada en el código. Los 11 commits documentados existen en el repositorio git. El estado `human_needed` refleja que la funcionalidad dinámica (animaciones CSS, renderizado en runtime, localStorage real, comportamiento de selects en cascada) requiere verificación en browser — no puede confirmarse solo con análisis estático.

---

_Verified: 2026-04-13T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
