# Phase 2: Internacionalizacion FR/AR - Research

**Researched:** 2026-04-11
**Domain:** i18n, CSS logical properties, RTL layout, Arabic typography
**Confidence:** HIGH

## Summary

Esta fase implementa internacionalizacion bilingue (frances/arabe) en una PWA de archivo unico vanilla JS. El patron recomendado es un objeto STRINGS plano con claves dot-notation, atributos `data-i18n` en el HTML, y una funcion `t(key)` que resuelve traducciones. Para RTL, CSS logical properties tienen soporte completo en los navegadores objetivo (Chrome Android 89+, Safari iOS 15+). Las fuentes arabes del sistema (Noto Sans Arabic en Android, SF Arabic en iOS) son suficientes sin descargas externas.

**Recomendacion principal:** Usar el patron `data-i18n` + objeto STRINGS plano + `Intl.NumberFormat` con `numberingSystem: 'latn'` para formateo de precios. Migrar solo las propiedades CSS inline-axis a logical properties; las propiedades de posicionamiento `left: 0; right: 0` (full-width) y `left: 50%; transform: translateX(-50%)` (centering) son direction-neutral y NO necesitan migracion.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: System fonts unicamente -- sin descarga de fuentes externas en runtime. Constraint offline-first no negociable.
- D-02: Stack CSS para contexto arabe (`[dir="rtl"]`): `'Tahoma', 'Arial', system-ui, sans-serif`.
- D-03: No se embebe ningun subconjunto como base64.
- D-04: Boton FR/AR en top-right del header. Header pasa a `display: flex; justify-content: space-between; align-items: center`.
- D-05: Pill toggle que muestra `FR | AR` con idioma activo resaltado. Sin dropdown, sin tab extra.
- D-06: Titulo de marca `AutoValeur MA` invariante en ambos idiomas.
- D-07: Se traducen: labels nav inferior, titulos h2, texto banner iOS, atributos aria-label.
- D-08: No se traducen: meta description, textos placeholder de fases futuras.
- D-09: El objeto STRINGS cubre exactamente los textos del HTML de Fase 1.
- D-10: Migracion completa de propiedades inline-axis: margin-left/right, padding-left/right, left/right en posicionamiento.
- D-11: Propiedades block-axis y border-radius no se modifican.
- D-12: Atributo `dir` se aplica sobre `<html>`, modulo I18n cambia `document.documentElement.dir` y `.lang`.

### Claude's Discretion
- Estructura interna del modulo I18n (objeto plano vs funcion factory, nombre de claves en STRINGS).
- Estrategia de inicializacion: cuando leer idioma de localStorage (antes o despues de DOMContentLoaded).

### Deferred Ideas (OUT OF SCOPE)
Ninguna.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| I18N-01 | Interfaz completa disponible en frances | Objeto STRINGS con todas las cadenas FR, patron data-i18n para inyeccion automatica |
| I18N-02 | Interfaz completa disponible en arabe con layout RTL correcto | CSS logical properties + dir="rtl" en html + font stack arabe del sistema |
| I18N-03 | Usuario puede cambiar de idioma (boton FR/AR visible) | Pill toggle en header con flex layout, event handler que llama setLang() |
| I18N-04 | Preferencia de idioma persiste en localStorage | localStorage.getItem/setItem con key 'lang', lectura en init |
| I18N-05 | Precios formateados correctamente (digitos latinos en arabe) | Intl.NumberFormat con numberingSystem: 'latn' |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

No se encontro archivo CLAUDE.md en el directorio del proyecto. Las restricciones del proyecto se derivan de CONTEXT.md y PROJECT.md:
- Archivo unico index.html (HTML + CSS + JS)
- Vanilla JS, sin frameworks, sin bundler, sin npm
- Offline-first (cero peticiones de red en runtime)
- Target: Android Chrome (primario) + Safari iOS

## Architecture Patterns

### Recommended Project Structure (within index.html)

```
<style>
  /* ... CSS existente ... */
  /* RTL font stack */
  [dir="rtl"] { font-family: 'Tahoma', 'Arial', system-ui, sans-serif; }
  /* ... logical properties migration ... */
</style>

<script>
  // Orden de modulos en el <script>:
  // 1. STRINGS          -- objeto de traducciones
  // 2. I18n module       -- t(), setLang(), applyTranslations()
  // 3. Router           -- (existente)
  // 4. PWA install      -- (existente)
  // 5. Init (DOMContentLoaded) -- ahora incluye I18n.init()
</script>
```

### Pattern 1: data-i18n Attribute Pattern
**What:** Cada elemento traducible lleva `data-i18n="key"`. Una funcion recorre todos los `[data-i18n]` y aplica el texto del idioma activo.
**When to use:** Para textos estaticos en el DOM (labels, titulos, botones).
**Example:**
```html
<!-- HTML -->
<h2 data-i18n="page.estimer.title">Estimer</h2>
<button class="nav-item" data-i18n="nav.estimer" data-i18n-aria="nav.estimer.aria">
  <span>Estimer</span>
</button>
```
```javascript
// Source: https://andreasremdt.com/blog/building-a-super-small-and-simple-i18n-script-in-javascript/
// [VERIFIED: WebSearch + cross-reference with multiple sources]

var STRINGS = {
  fr: {
    'nav.estimer':       'Estimer',
    'nav.historique':    'Historique',
    'nav.comparer':      'Comparer',
    'page.estimer.title':    'Estimer',
    'page.historique.title': 'Historique',
    'page.comparer.title':  'Comparer',
    'nav.aria.main':     'Navigation principale',
    'nav.aria.estimer':  'Estimer',
    'nav.aria.historique': 'Historique',
    'nav.aria.comparer': 'Comparer',
    'ios.banner.text':   'Pour installer : appuyez sur {icon} puis <strong>Sur l\'ecran d\'accueil</strong>',
    'ios.banner.close':  'Fermer'
  },
  ar: {
    'nav.estimer':       '\u062a\u0642\u064a\u064a\u0645',
    'nav.historique':    '\u0627\u0644\u0633\u062c\u0644',
    'nav.comparer':      '\u0645\u0642\u0627\u0631\u0646\u0629',
    'page.estimer.title':    '\u062a\u0642\u064a\u064a\u0645',
    'page.historique.title': '\u0627\u0644\u0633\u062c\u0644',
    'page.comparer.title':  '\u0645\u0642\u0627\u0631\u0646\u0629',
    'nav.aria.main':     '\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064a\u0633\u064a',
    'nav.aria.estimer':  '\u062a\u0642\u064a\u064a\u0645',
    'nav.aria.historique': '\u0627\u0644\u0633\u062c\u0644',
    'nav.aria.comparer': '\u0645\u0642\u0627\u0631\u0646\u0629',
    'ios.banner.text':   '\u0644\u0644\u062a\u062b\u0628\u064a\u062a: \u0627\u0636\u063a\u0637 \u0639\u0644\u0649 {icon} \u062b\u0645 <strong>\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629</strong>',
    'ios.banner.close':  '\u0625\u063a\u0644\u0627\u0642'
  }
};
```
[VERIFIED: Pattern documented in multiple sources including andreasremdt.com and vanilla-i18n]

### Pattern 2: I18n Module
**What:** Modulo singleton que gestiona idioma activo, traducciones, y actualizacion del DOM.
**When to use:** Nucleo del sistema i18n.
**Example:**
```javascript
// [ASSUMED] - estructura recomendada para vanilla JS single-file app
var I18n = {
  currentLang: 'fr',

  t: function(key) {
    var strings = STRINGS[I18n.currentLang];
    return (strings && strings[key]) || key;
  },

  setLang: function(lang) {
    if (!STRINGS[lang]) return;
    I18n.currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
    I18n._applyTranslations();
  },

  _applyTranslations: function() {
    // Texto interior
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = I18n.t(key);
      if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = val;  // para textos con HTML (banner iOS)
      } else {
        el.textContent = val;
      }
    });
    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', I18n.t(key));
    });
  },

  init: function() {
    var saved = localStorage.getItem('lang');
    var lang = (saved === 'ar') ? 'ar' : 'fr';  // default FR
    I18n.setLang(lang);
  }
};
```

### Pattern 3: Pill Toggle Button
**What:** Boton FR/AR en el header con estado visual.
**Example:**
```html
<button class="lang-toggle" onclick="I18n.setLang(I18n.currentLang === 'fr' ? 'ar' : 'fr')"
        aria-label="Changer la langue">
  <span class="lang-option" data-lang="fr">FR</span>
  <span class="lang-option" data-lang="ar">AR</span>
</button>
```
```css
.lang-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-3);
  cursor: pointer;
  padding: 0;
}
.lang-option {
  padding: var(--sp-xs) var(--sp-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: background var(--transition-fast), color var(--transition-fast);
}
/* El idioma activo se marca via JS actualizando una clase */
.lang-option.active {
  background: var(--primary);
  color: white;
}
```
[ASSUMED - estructura basada en patrones comunes de pill toggles]

### Anti-Patterns to Avoid
- **Usar innerHTML para todos los textos:** Solo usar innerHTML cuando el texto contiene HTML (ej: banner iOS con `<strong>`). Para texto puro, usar textContent (mas seguro contra XSS).
- **Traducir textos de fases futuras:** D-08 y D-09 son explicitos: no traducir placeholders como "Formulaire d'estimation -- Phase 4".
- **Hardcodear strings en el JS de traduccion:** Todas las cadenas deben estar en el objeto STRINGS centralizado.
- **Leer localStorage sincrono bloqueante:** localStorage.getItem es sincrono pero rapido; no es un problema. Sin embargo, aplicar traducciones antes de DOMContentLoaded puede causar errores si los elementos no existen aun.

## CSS Logical Properties Migration

### Audit del CSS Existente en index.html

| Linea | Propiedad Fisica | Conversion Necesaria | Nota |
|-------|-----------------|---------------------|------|
| 128 | `padding: var(--sp-md) var(--sp-md)` | NO | Shorthand simetrico, direction-neutral |
| 162 | `padding: var(--sp-md)` | NO | Uniforme, direction-neutral |
| 195-196 | `left: 0; right: 0` | `inset-inline: 0` o mantener `left: 0; right: 0` | Full-width pattern: ambos a 0 es direction-neutral. Se puede migrar a `inset-inline: 0` por consistencia pero NO es necesario para RTL |
| 257 | `left: 50%; transform: translateX(-50%)` | NO | Centering pattern: direction-neutral (siempre centra respecto al contenedor) |
| 286-287 | `left: 0; right: 0` | Mismo caso que 195-196 | Direction-neutral |
| 342 | `text-align: center` | NO | Center es direction-neutral |

**Hallazgo clave:** El CSS actual de Fase 1 no tiene propiedades left/right asimetricas. Todos los usos son patrones direction-neutral (`left:0; right:0` para full-width, `left:50%` para centering). La migracion a logical properties es mayormente proactiva (preparar para futuras fases) y se centra en `padding` y `margin` shorthands que aun no existen en el CSS pero se anadiran en fases futuras.

**Lo que SI hay que migrar (D-10):**
- `left: 0; right: 0` en `.bottom-nav` y `.ios-install-banner` --> `inset-inline: 0` (por consistencia con D-10, aunque sea funcionalmente equivalente)

**Lo que NO necesita migracion (D-11):**
- `border-radius` valores
- `margin-top/bottom`, `padding-top/bottom` (block-axis)
- `top: 0`, `bottom: 0` (block-axis)

### Browser Support [VERIFIED: caniuse.com]

| Property | Chrome Android | Safari iOS | Status |
|----------|---------------|------------|--------|
| `margin-inline-start/end` | 87+ (Oct 2020) | 14.1+ (Apr 2021) | Safe |
| `padding-inline-start/end` | 87+ | 14.1+ | Safe |
| `inset-inline-start/end` | 87+ | 14.1+ | Safe |
| `inset-inline` (shorthand) | 87+ | 14.1+ | Safe |
| `text-align: start/end` | 1+ | 3.1+ | Safe |

**Conclusion:** Todas las logical properties necesarias tienen soporte completo en los navegadores objetivo. No se necesitan fallbacks.

## Arabic Font Stack

### Fuentes del Sistema Disponibles [VERIFIED: WebSearch + multiple sources]

| Plataforma | Fuente Arabe del Sistema | Disponible Via |
|------------|------------------------|----------------|
| Android 7+ | Noto Sans Arabic / Noto Naskh Arabic | Pre-instalada como fuente del sistema |
| iOS 9+ | SF Arabic / Geeza Pro | Pre-instalada; SF Arabic en iOS 13+ |
| Android (Huawei/Honor) | Noto Naskh Arabic | Pre-instalada |

### Stack CSS Decidido (D-02)
```css
[dir="rtl"] {
  font-family: 'Tahoma', 'Arial', system-ui, sans-serif;
}
```

**Analisis de la cadena de fallback:**
1. **Tahoma** -- Soporta arabe en Windows/Android. En Android moderno, el sistema redirige a Noto Sans Arabic para glifos arabes via font fallback chain del OS. [ASSUMED]
2. **Arial** -- Soporta arabe basico. Disponible en iOS y Android como alias. [ASSUMED]
3. **system-ui** -- En Android resuelve a Roboto (latin) + Noto Sans Arabic (arabe). En iOS resuelve a SF Pro + SF Arabic. [VERIFIED: WebSearch github.com/jvarn/arabic-system-font-stack]
4. **sans-serif** -- Fallback final generico.

**Punto importante:** En Android moderno y iOS, `system-ui` ya resuelve a las mejores fuentes arabes del sistema. Tahoma y Arial al inicio de la cadena son seguros pero en la practica, en moviles, `system-ui` hara el trabajo pesado.

## Intl.NumberFormat for Latin Digits

### API Exacta [VERIFIED: MDN Web Docs]

```javascript
// Metodo 1: Usando la opcion numberingSystem
var formatter = new Intl.NumberFormat('ar-MA', {
  numberingSystem: 'latn',
  style: 'decimal',
  maximumFractionDigits: 0
});
formatter.format(65000);  // "65.000"

// Metodo 2: Usando la extension Unicode en el locale string
var formatter2 = new Intl.NumberFormat('ar-MA-u-nu-latn', {
  style: 'decimal',
  maximumFractionDigits: 0
});
formatter2.format(65000);  // "65.000"

// Para precios en DH:
function formatPrice(amount, lang) {
  var locale = (lang === 'ar') ? 'ar-MA-u-nu-latn' : 'fr-MA';
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(amount) + ' DH';
}

formatPrice(65000, 'fr');  // "65 000 DH" (espacio como separador de miles en FR)
formatPrice(65000, 'ar');  // "65.000 DH" (punto como separador de miles en AR-MA)
```

**Nota sobre ar-MA vs ar-EG:** Marruecos usa `ar-MA` como locale. La diferencia principal es el separador de miles: ar-MA usa punto (`.`), ar-EG usa coma. Ambos usan digitos arabe-indicos por defecto, que se fuerzan a latinos con `numberingSystem: 'latn'` o `-u-nu-latn`. [VERIFIED: MDN Intl.NumberFormat]

### Browser Support
`Intl.NumberFormat` con `numberingSystem` option: Chrome 24+, Safari 10+. Soporte completo en todos los navegadores objetivo. [VERIFIED: MDN compatibility tables]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formateo de numeros con digitos latinos | Regex para reemplazar digitos arabes | `Intl.NumberFormat` con `numberingSystem: 'latn'` | Maneja separadores de miles, decimales, locale-specific |
| Deteccion de dir RTL | Condicionales manuales por cada propiedad CSS | CSS logical properties + `dir` attribute en html | El browser hace el swap automaticamente |
| Font fallback arabe | Descargar fuentes, base64 embeds | System font stack con `system-ui` | Android/iOS ya tienen fuentes arabes excelentes pre-instaladas |

## Common Pitfalls

### Pitfall 1: Aplicar traducciones antes de que el DOM exista
**What goes wrong:** `querySelectorAll('[data-i18n]')` no encuentra nada si se ejecuta antes de DOMContentLoaded.
**Why it happens:** Si se intenta leer localStorage y aplicar idioma en el `<head>` o al inicio del `<script>`.
**How to avoid:** Llamar `I18n.init()` dentro del handler de DOMContentLoaded, despues de `Router.init()`.
**Warning signs:** Textos en frances hardcodeados que no cambian a arabe tras recargar.

### Pitfall 2: Flash of Untranslated Content (FOUC)
**What goes wrong:** El usuario ve brevemente los textos en frances antes de que se aplique el arabe.
**Why it happens:** El HTML tiene textos en frances hardcodeados; la traduccion se aplica tras DOMContentLoaded.
**How to avoid:** Establecer `dir` y `lang` en el `<html>` lo mas pronto posible (inline script antes de `</head>`, leyendo localStorage). Luego, aplicar textos en DOMContentLoaded. El flash de texto FR es aceptable si el dir/lang ya estan correctos (el layout no salta).
**Warning signs:** El layout salta de LTR a RTL visiblemente tras la carga.

### Pitfall 3: translateX(-50%) en RTL
**What goes wrong:** Desarrolladores convierten `left: 50%; transform: translateX(-50%)` a logical properties innecesariamente, rompiendo el centering.
**Why it happens:** Confusion sobre que propiedades son direction-sensitive.
**How to avoid:** `left: 50%; transform: translateX(-50%)` es un patron de centering direction-neutral. NO necesita migracion. Solo migrar propiedades que crean asimetria (ej: `margin-left: 16px` sin `margin-right` correspondiente).
**Warning signs:** El indicador activo de la nav desaparece o se desplaza en RTL.

### Pitfall 4: Olvidar aria-labels en la traduccion
**What goes wrong:** La app se ve bien pero los lectores de pantalla leen todo en frances.
**Why it happens:** Solo se traducen textContent, no los atributos aria-label.
**How to avoid:** Usar `data-i18n-aria` separado para marcar elementos con aria-label traducible. La funcion `_applyTranslations` debe manejar ambos.
**Warning signs:** Audit de accesibilidad muestra labels en idioma incorrecto.

### Pitfall 5: Banner iOS con innerHTML y XSS
**What goes wrong:** El banner iOS contiene HTML (`<strong>`, SVG icon). Si se usa textContent se pierde el formato.
**Why it happens:** El texto del banner necesita elementos HTML inline.
**How to avoid:** Marcar el elemento con `data-i18n-html` para indicar que se debe usar innerHTML. El contenido proviene del objeto STRINGS (controlado por el desarrollador, no por el usuario), asi que el riesgo XSS es nulo.
**Warning signs:** El banner muestra tags HTML como texto plano.

### Pitfall 6: left:0; right:0 en elementos fixed con RTL
**What goes wrong:** Nada, pero desarrolladores pierden tiempo intentando "arreglar" esto.
**Why it happens:** Confusion: `left:0; right:0` juntos no es lo mismo que `left:0` solo. Cuando ambos estan a 0, el elemento se estira full-width independientemente de la direccion.
**How to avoid:** Entender que `left:0; right:0` es funcionalmente equivalente a `inset-inline: 0`. Se puede migrar por consistencia de codigo, no por necesidad funcional.

## Code Examples

### Inicializacion temprana de dir/lang (prevenir FOUC de layout)
```javascript
// Source: best practice para evitar layout shift RTL
// [ASSUMED] - patron comun en apps i18n sin framework

// Este snippet va ANTES de </head> o al inicio de <script>,
// ANTES de DOMContentLoaded:
(function() {
  var lang = localStorage.getItem('lang');
  if (lang === 'ar') {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }
})();
```

### Actualizacion del pill toggle tras cambio de idioma
```javascript
// Dentro de setLang(), despues de aplicar traducciones:
document.querySelectorAll('.lang-option').forEach(function(opt) {
  opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
});
```

### CSS: Header con flex para acomodar el boton FR/AR
```css
/* D-04: header pasa a flex */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* ... propiedades existentes ... */
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `margin-left/right` | `margin-inline-start/end` | CSS Logical Properties Level 1, full support since 2021 | Eliminates need for separate RTL stylesheets |
| Libraries like i18next | Vanilla `data-i18n` pattern | Always available, popularized 2020+ | For small apps, no library needed |
| `String.replace()` for Arabic digits | `Intl.NumberFormat` with `numberingSystem` | ES2015+, widespread support 2018+ | Native, locale-aware, handles separators |
| Separate CSS file for RTL | `dir` attribute + logical properties | 2021+ | Single CSS, automatic mirroring |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Tahoma en Android redirige a Noto Sans Arabic via font fallback del OS | Arabic Font Stack | LOW -- system-ui es el fallback real; Tahoma solo es primer candidato |
| A2 | Arial soporta arabe basico y esta disponible como alias en iOS/Android | Arabic Font Stack | LOW -- system-ui y sans-serif son fallbacks robustos |
| A3 | Inicializacion temprana de dir/lang via IIFE antes de DOMContentLoaded previene FOUC de layout | Code Examples | MEDIUM -- depende del timing del parser HTML; el flash puede seguir siendo visible pero sera de texto, no de layout |
| A4 | Estructura del pill toggle con spans y clase .active | Architecture Patterns | LOW -- es un patron CSS estandar, cualquier implementacion equivalente funciona |

## Open Questions (RESOLVED)

1. **Orden exacto de inicializacion I18n vs Router**
   - What we know: Router.init() esta en DOMContentLoaded. I18n.init() debe estar ahi tambien.
   - What's unclear: Deberia I18n.init() ejecutarse antes o despues de Router.init()? Antes garantiza que los textos estan correctos cuando las paginas se muestran. Despues podria causar un frame con textos FR.
   - Recommendation: I18n.init() ANTES de Router.init() en DOMContentLoaded. El early IIFE solo establece dir/lang, no traducciones.

2. **Texto del banner iOS con SVG inline**
   - What we know: El banner tiene un SVG icon inline entre texto. La traduccion arabe necesita el mismo icon.
   - What's unclear: Como insertar el SVG en la cadena de traduccion de forma limpia.
   - Recommendation: Usar un placeholder `{icon}` en STRINGS y reemplazarlo con el SVG literal antes de asignar innerHTML. O bien, separar el texto en dos spans alrededor del SVG y traducir cada span por separado.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual testing (no test framework -- single HTML file, no npm) |
| Config file | none |
| Quick run command | Open index.html in browser, check console for errors |
| Full suite command | Manual checklist below |

### Phase Requirements --> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| I18N-01 | Interfaz en frances con todos los textos | manual | Open app, verify all labels in FR | N/A |
| I18N-02 | Interfaz en arabe con RTL correcto | manual | Switch to AR, verify layout mirrors and text is Arabic | N/A |
| I18N-03 | Boton FR/AR visible y funcional | manual | Click toggle, verify language changes | N/A |
| I18N-04 | Preferencia persiste en localStorage | manual | Set AR, reload page, verify AR persists | N/A |
| I18N-05 | Precios con digitos latinos en arabe | manual + console | `formatPrice(65000, 'ar')` in console, verify "65.000 DH" | N/A |

### Sampling Rate
- **Per task commit:** Open index.html in browser, verify no console errors, check visual appearance
- **Per wave merge:** Full manual checklist: FR labels, AR labels, RTL layout, localStorage persistence, price formatting
- **Phase gate:** All 5 requirements verified manually in Chrome Android and Safari iOS

### Wave 0 Gaps
None -- no test framework needed for a single-file vanilla JS app. Testing is manual/visual.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes (minimal) | STRINGS object is developer-controlled; innerHTML only for known static content |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| innerHTML injection via STRINGS | Tampering | STRINGS is hardcoded in source, not user-supplied. Use textContent by default, innerHTML only when marked with data-i18n-html |
| localStorage tampering (lang value) | Tampering | Validate: only accept 'fr' or 'ar', default to 'fr' for any other value |

## Sources

### Primary (HIGH confidence)
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - API, numberingSystem option, locale strings
- [MDN Intl.NumberFormat constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat) - options including numberingSystem
- [Can I Use: CSS Logical Properties](https://caniuse.com/css-logical-props) - browser support tables
- [Can I Use: inset-inline-start](https://caniuse.com/mdn-css_properties_inset-inline-start) - positioning logical properties support
- [MDN: Logical properties for floating and positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values/Floating_and_positioning) - inset-inline documentation

### Secondary (MEDIUM confidence)
- [Andreas Remdt: Building a Super Small i18n Script](https://andreasremdt.com/blog/building-a-super-small-and-simple-i18n-script-in-javascript/) - data-i18n pattern reference
- [CSS-Tricks: CSS Logical Properties](https://css-tricks.com/css-logical-properties-and-values/) - migration patterns
- [Ishadeed: Digging Into CSS Logical Properties](https://ishadeed.com/article/css-logical-properties/) - RTL pitfalls
- [Arabic system font stack (GitHub)](https://github.com/jvarn/arabic-system-font-stack) - system font analysis
- [Abu Yasmeen: Arabic system font stack](https://abuyasmeen.com/arabic-system-font-stack/) - font stack recommendations

### Tertiary (LOW confidence)
- [Medium: Stop Fighting RTL Layouts](https://medium.com/nerd-for-tech/css-logical-properties-rtl-layouts-236edec711fa) - general RTL guidance

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no external libraries needed; all APIs are native browser APIs with verified support
- Architecture: HIGH - data-i18n pattern is well-documented and standard for vanilla JS apps
- CSS logical properties: HIGH - verified browser support on caniuse.com, all target browsers supported since 2021
- Arabic fonts: MEDIUM - system font availability is OS-version dependent, but the fallback chain is robust
- Pitfalls: HIGH - based on verified sources and analysis of the actual CSS in index.html

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable domain, no fast-moving dependencies)
