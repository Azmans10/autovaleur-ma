---
phase: 02-internacionalizacion-fr-ar
reviewed: 2026-04-11T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - index.html
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-11
**Depth:** standard
**Files Reviewed:** 1 (`index.html`)
**Status:** issues_found

## Summary

La fase 2 introduce el objeto `STRINGS`, el módulo `I18n`, el toggle FR/AR, la migración a CSS logical properties, el font stack árabe, y `formatPrice()`. La implementación general es sólida: el guardián IIFE anti-flash es correcto, el whitelisting de idiomas en `I18n.init()` es adecuado, y el uso de `textContent` para nodos de texto protege contra XSS. No hay issues críticos de seguridad.

Se encontraron 3 warnings (edge cases que podrían producir comportamientos inesperados) y 4 items de información (calidad de código y consistencia).

---

## Warnings

### WR-01: `formatPrice()` no maneja valores no numéricos

**File:** `index.html:650-656`
**Issue:** `Intl.NumberFormat.format(NaN)` devuelve la cadena `"NaN"`, y `format(undefined)` devuelve `"NaN"` también. Si `amount` llega como `undefined`, `null`, o una cadena no parseable, la función devuelve silenciosamente `"NaN DH"` sin ninguna señal de error. La función no está aún conectada a ningún input en Fase 2, pero el contrato no está definido.
**Fix:**
```js
function formatPrice(amount, lang) {
  var num = Number(amount);
  if (isNaN(num)) return '— DH';          // valor centinela visible
  var locale = (lang === 'ar') ? 'ar-MA-u-nu-latn' : 'fr-MA';
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(num) + ' DH';
}
```

---

### WR-02: `I18n.t()` oculta cadenas vacías — falsy coalescing incorrecto

**File:** `index.html:588-590`
**Issue:** La expresión `(strings && strings[key]) || key` devuelve `key` cuando la traducción existe pero es una cadena vacía (`''`). Si en fases futuras una clave tiene valor vacío intencionalmente (p.ej. un placeholder), el sistema lo ignora silenciosamente y renderiza la clave en su lugar.
**Fix:** Usar una comparación explícita de `undefined`:
```js
t: function(key) {
  var strings = STRINGS[I18n.currentLang];
  if (!strings) return key;
  return (strings[key] !== undefined) ? strings[key] : key;
},
```

---

### WR-03: Propiedad física `left` en el indicador activo de `.nav-item` no es neutral para RTL

**File:** `index.html:292-296`
**Issue:** El pseudo-elemento `.nav-item.active::before` usa `left: 50%` con `transform: translateX(-50%)`. En la práctica el centrado es visual y simétrico, pero `left` es una propiedad física que en un contexto RTL estricto debería ser `inset-inline-start`. Si la barra de navegación cambia su flujo en RTL este indicador podría quedar desplazado.
**Fix:**
```css
.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline-start: 50%;       /* reemplaza: left: 50% */
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--primary);
  border-radius: 0 0 3px 3px;
}
```
Nota: `transform: translateX(-50%)` sigue siendo físico. La alternativa completa en CSS puro es `margin-inline-start: -12px` con `inset-inline-start: 50%`, o centrar con flexbox en el pseudo-elemento.

---

## Info

### IN-01: `'use strict'` no cubre el IIFE anti-flash

**File:** `index.html:536`
**Issue:** La directiva `'use strict'` en la línea 536 aparece *después* del cierre del IIFE anti-flash (`})();` en línea 534). Strict mode se aplica al resto del script block pero **no** al IIFE. Si en el futuro el IIFE contiene código que strict mode capturaría (p.ej. variables no declaradas), el error pasaría desapercibido.
**Fix:** Mover `'use strict'` al inicio del IIFE o añadir la directiva dentro del mismo:
```js
(function() {
  'use strict';
  var lang = localStorage.getItem('lang');
  if (lang === 'ar') {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }
})();

'use strict'; // cubre el resto del script block
```

---

### IN-02: `console.log` de debug en ruta de inicialización de producción

**File:** `index.html:737`
**Issue:** `console.log('AutoValeur MA — i18n + Router inicializados')` se ejecuta en cada carga de página en producción. Los otros `console.log`/`console.warn` del bloque SW (líneas 749, 752) tienen justificación operativa, pero este es puramente de desarrollo.
**Fix:** Eliminar o envolver con una bandera de debug:
```js
// Opción A: eliminar
// Opción B: condicional
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('AutoValeur MA — i18n + Router inicializados');
}
```

---

### IN-03: `String.replace('{icon}', ...)` solo reemplaza la primera ocurrencia

**File:** `index.html:620`
**Issue:** `val.replace('{icon}', svgIcon)` es `String.prototype.replace` con un literal de cadena como primer argumento, que en JavaScript solo reemplaza la **primera** ocurrencia. Si una traducción futura incluye dos instancias de `{icon}`, la segunda quedaría sin sustituir y se renderizaría como texto literal.
**Fix:** Usar una expresión regular con el flag global, o `replaceAll`:
```js
el.innerHTML = val.replace(/\{icon\}/g, svgIcon);
// o en entornos modernos:
el.innerHTML = val.replaceAll('{icon}', svgIcon);
```

---

### IN-04: Mezcla de `var` y `const`/shorthand methods en el mismo script block

**File:** `index.html:543,580,650,664,666,673`
**Issue:** `STRINGS`, `I18n`, `formatPrice`, y `deferredInstallPrompt` se declaran con `var`, mientras `ROUTES` y `Router` usan `const` y métodos shorthand ES6. La mezcla no es un bug, pero dificulta la lectura y sugiere código añadido en iteraciones sin convención acordada.
**Fix:** Adoptar `const`/`let` consistentemente para todo el script si el target de browsers ya está en ES6+ (lo está, dado el uso de `Intl.NumberFormat`, `matchMedia`, etc.):
```js
const STRINGS = { ... };
const I18n = { ... };
// etc.
```

---

_Reviewed: 2026-04-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
