# Phase 05: Historique y Comparer — Research

**Researched:** 2026-04-13
**Domain:** Vanilla JS SPA — módulo History, páginas Historique y Comparer, i18n, CSS custom properties
**Confidence:** HIGH — todo el código fuente está disponible en index.html; no hay dependencias externas que verificar

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Layout tarjetas: Marca/Modelo/Año en grande, precio destacado (--primary), km y fecha en texto muted. Botón × alineado end.
- Fecha relativa: "Aujourd'hui", "Il y a {n} jour(s)", "Il y a {n} semaine(s)" — calculada desde timestamp ISO. Sin fecha absoluta.
- Ordenación: más reciente primero — ya garantizado por `History.save()` (unshift).
- Eliminar individual: botón × invoca `History.remove(id)` y re-renderiza sin recargar.
- Clase CSS base para tarjetas: `.card` existente.
- Estado vacío: SVG inline simple + "Aucune estimation enregistrée" + `.btn-primary` que navega a `#estimer`.
- Borrado completo: flujo de 2 pasos — primer clic → estado "confirmar" (`.btn-danger`), segundo clic → `History.clear()`. Timeout 3s de reset automático. Sin modal, sin `window.confirm()`.
- `History.remove(id)` — filtra array por id, persiste, retorna array actualizado.
- `History.clear()` — escribe `[]` en localStorage, retorna array vacío. Ambos con try/catch.
- Comparer: dos selects desplegables. Opciones: `{Marca} {Modelo} {Año} — {precio}`. Renderizado automático al cambiar cualquier select. Sin botón "Comparar".
- Barra visual: solo precio. El más caro = 100%, el otro = % relativo. `transition: width 0.3s ease`.
- Ganador: mejor ratio `precio / km` (menor = mejor). Si km=0: gana el de precio menor. Si empate: ninguno destacado.
- Ganador destacado: borde verde (`--accent`), badge "Meilleur rapport" (i18n `comparer.winner_badge`).
- Estado vacío Comparer: si < 2 valoraciones → "Ajoutez au moins 2 estimations pour comparer" con CTA a `#estimer`.
- Patrones a mantener: atributo `hidden` nativo (D-15), CSS logical properties (UI-03), `textContent` para datos de usuario (XSS), `data-i18n` en textos estáticos, `var NombreModulo` para nuevos módulos JS.

### Claude's Discretion

(Ninguna área de discreción fue definida — todo está locked en CONTEXT.md)

### Deferred Ideas (OUT OF SCOPE)

- Filtros o búsqueda en el historial
- Exportar historial a PDF o CSV
- Compartir comparación por WhatsApp
- Más de 2 métricas en el comparador (km, año)

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HIST-01 | Mostrar valoraciones guardadas ordenadas por fecha (más reciente primero) | `History.save()` ya hace unshift — el orden está garantizado en el almacenamiento |
| HIST-02 | Cada entrada muestra: marca/modelo/año, km, precio estimado y fecha | Todos los campos están presentes en el objeto record de `History.save()` |
| HIST-03 | El usuario puede eliminar entradas individuales | Requiere `History.remove(id)` (nuevo) + re-render |
| HIST-04 | El usuario puede limpiar todo el historial con confirmación | Requiere `History.clear()` (nuevo) + flujo 2 pasos |
| HIST-05 | Estado vacío con CTA a Estimer si historial vacío | `.empty-state` CSS ya existe; `.btn-primary` ya existe |
| COMP-01 | Seleccionar 2 valoraciones del historial para comparar | Dos `<select>` poblados desde `History.getAll()` |
| COMP-02 | Dos valoraciones lado a lado con datos principales | Layout CSS de dos columnas o flexbox 50/50 |
| COMP-03 | Barras visuales para precio (solo precio — km/año fuera de scope por decisión) | `.compare-bar` nueva clase CSS con width proporcional |
| COMP-04 | Ganador destacado (borde verde, badge) por ratio precio/km | Lógica JS: ratio = precio/mileage; menor gana |
| COMP-05 | Mensaje orientativo si < 2 valoraciones | Chequeo de `History.getAll().length < 2` al cargar la página |

</phase_requirements>

---

## Summary

Esta fase implementa dos páginas sobre código ya existente y maduro. El `var History` tiene `save()` y `getAll()` completamente funcionales. Las páginas `#page-historique` y `#page-comparer` existen como stubs de 2 líneas. El sistema i18n, el Router, la paleta de colores y los componentes CSS base (`.card`, `.btn-primary`, `.empty-state`) están completamente disponibles.

No hay dependencias externas. Todo el trabajo es: (1) extender `var History` con dos métodos nuevos, (2) reemplazar los stubs HTML con HTML funcional, (3) escribir JS para renderizar y gestionar la UI de ambas páginas, y (4) añadir las claves de string a `STRINGS.fr` y `STRINGS.ar`.

**Recomendación principal:** Separar el trabajo en 5 planes alineados con el ROADMAP: 05-01 métodos History, 05-02 página Historique (tarjetas), 05-03 estado vacío + botón borrado total, 05-04 página Comparer (selects + layout), 05-05 barras visuales + lógica ganador.

---

## Standard Stack

### Core (todo ya presente en index.html)

| Módulo | Versión | Propósito | Estado |
|--------|---------|-----------|--------|
| `var History` | — | Historial en localStorage con clave `autoValeur_history` | Parcialmente implementado — añadir `remove()` y `clear()` |
| `var I18n` | — | Motor de traducción FR/AR; `I18n.t(key)`, `I18n.setLang()` | Completo |
| `var Router` | — | Hash-based SPA; `Router.navigate(page)` | Completo |
| `formatPrice(amount, lang)` | — | Formatea precios con `Intl.NumberFormat` y sufijo ` DH` | Completo |
| `STRINGS.fr` / `STRINGS.ar` | — | Objeto plano de cadenas i18n | Existente — añadir claves de Fase 5 |

### Componentes CSS ya disponibles

| Clase | Propósito | En index.html |
|-------|-----------|---------------|
| `.card` | Base de tarjeta: fondo blanco, border-radius, shadow-sm, border | Línea 395 |
| `.btn-primary` | Botón principal azul, ancho completo | Línea 403 |
| `.btn-secondary` | Botón outline azul | Línea 429 |
| `.empty-state` | Contenedor centrado para estado vacío | Línea 376 |
| `.page` | Wrapper de página con padding y min-height | Línea 197 |
| `.form-group select` | Estilos completos de select (incluyendo RTL) | Línea 464 |

### Nuevas clases CSS a crear en esta fase

| Clase | Descripción | Tokens usados |
|-------|-------------|---------------|
| `.history-card` | Extensión de `.card`: flex row, precio a la derecha, botón × | `--sp-sm`, `--font-size-lg`, `--font-size-2xl`, `--primary` |
| `.btn-danger` | Variante roja del botón para estado "confirmar" | `--danger` (#ea4335), color: white |
| `.compare-bar` | Barra proporcional de precio; height 12px, border-radius `--radius-sm`, color `--primary` | `--primary`, `--radius-sm` |
| `.compare-card` | Contenedor de cada coche en Comparer | `--sp-md`, `.card` base |
| `.compare-winner` | Modificador de ganador: borde verde accent | `--accent` (#34a853) |
| `.badge` | Badge inline (verificar si ya existe o crear) | `--accent`, color white, `--radius-lg` |

**Nota sobre `.badge`:** El UI-SPEC menciona `.badge` como componente existente, pero no se encontró en el CSS de `index.html`. Debe crearse en esta fase. [VERIFIED: lectura directa de index.html]

---

## Architecture Patterns

### Estructura de un record de historial (VERIFIED)

```javascript
// Producido por History.save() — líneas 1673-1688 de index.html
{
  id:              1713123456789,    // Date.now() — timestamp único como ID
  make:            'Dacia',
  model:           'Logan',
  year:            2019,            // integer
  mileage:         85000,           // integer >= 0
  condition:       'bon',
  fuel:            'diesel',
  transmission:    'manuelle',
  city:            'Casablanca',
  estimated_price: 58500,           // integer, ya con floor y redondeo
  price_range:     { min: 52700, max: 64400 },
  breakdown:       [ /* array 7 objetos */ ],
  date:            '2026-04-13T10:22:00.000Z'  // ISO string
}
```

**Implicaciones para el planner:**
- `id` es un timestamp numérico → comparar con `===` en `remove()`.
- `date` es un ISO string → `new Date(entry.date)` lo parsea. Para fecha relativa: `Math.floor((Date.now() - new Date(entry.date).getTime()) / 86400000)`.
- `mileage` puede ser 0 si el usuario no lo ingresó (el formulario tiene `min="1"` pero no `required`). El comparador debe manejar `mileage === 0`.
- `breakdown` es un array de 7 objetos `{ label, factor, amount_dh }` — no se necesita en Fase 5, pero está disponible si se quisiera mostrar.

### Patron de renderizado de lista (del proyecto)

```javascript
// Patrón consistente con renderBreakdown() en index.html (líneas 1920-1938)
// Usar createElement + textContent — NUNCA innerHTML para datos de usuario
function renderHistoryList() {
  var entries = History.getAll();
  var container = document.getElementById('history-list');
  container.innerHTML = '';  // Limpiar contenedor OK — no hay datos de usuario aquí

  if (entries.length === 0) {
    // Mostrar empty state — usar hidden attribute (D-15)
    document.getElementById('history-empty').hidden = false;
    document.getElementById('history-list').hidden = true;
    document.getElementById('btn-clear').hidden = true;
    return;
  }

  document.getElementById('history-empty').hidden = true;
  document.getElementById('history-list').hidden = false;
  document.getElementById('btn-clear').hidden = false;

  entries.forEach(function(entry) {
    var card = document.createElement('div');
    card.className = 'history-card card';
    card.setAttribute('role', 'listitem');

    // Título: textContent para datos de usuario (XSS prevention)
    var title = document.createElement('p');
    title.className = 'history-card__title';
    title.textContent = entry.make + ' ' + entry.model + ' ' + entry.year;

    // Precio: usar formatPrice()
    var price = document.createElement('p');
    price.className = 'history-card__price';
    price.textContent = formatPrice(entry.estimated_price, I18n.currentLang);

    // ... km, fecha relativa, botón ×

    container.appendChild(card);
  });
}
```

### Patron del Router para navegación desde CTA

```javascript
// Router.navigate() para el botón CTA → #estimer
// Líneas 1732-1734 de index.html
Router.navigate('estimer');  // Equivalente a location.hash = 'estimer'
```

### Patron de atributo hidden (D-15, VERIFIED)

```javascript
// El Router usa hidden nativo en _show() (líneas 1745-1753)
// Esta fase debe seguir el mismo patron
element.hidden = true;   // ocultar
element.hidden = false;  // mostrar
// NO usar display:none via clase CSS — usar hidden attribute
```

### Patron I18n para renderizado dinámico

```javascript
// Para textos estáticos en HTML: data-i18n (aplicados por I18n._applyTranslations)
// Para textos generados por JS: I18n.t('clave')
var label = I18n.t('historique.empty');  // Retorna la cadena en el idioma actual

// Para fecha relativa con interpolación:
var texto = I18n.t('date.days_ago').replace('{n}', dias);
```

**Nota importante:** `I18n._applyTranslations()` solo procesa elementos que ya existen en el DOM con `data-i18n`. Los elementos renderizados dinámicamente por JS deben usar `I18n.t()` directamente y rellenar via `textContent`.

### Patron de módulo JS (var NombreModulo)

```javascript
// Toda la app usa var (no const/let para módulos — consistencia)
// Ejemplo: var History, var I18n, var Router, var Engine
var Historique = {
  init: function() { /* ... */ },
  render: function() { /* ... */ }
};

var Comparer = {
  init: function() { /* ... */ },
  render: function(entryA, entryB) { /* ... */ }
};
```

### Flujo de inicialización (DOMContentLoaded)

```javascript
// Líneas 1786-1951 de index.html — el orden es:
// 1. I18n.init()
// 2. Router.init()
// 3. EstimerForm.init()

// Para Fase 5 añadir al final del bloque DOMContentLoaded:
// 4. Historique.init()   — poblar página #page-historique
// 5. Comparer.init()     — poblar página #page-comparer
```

**Consideración:** El Router muestra la página inicial según el hash, pero las páginas Historique y Comparer deben re-renderizarse cada vez que el usuario navega a ellas (para reflejar cambios del historial). Hay dos estrategias:

- **A (simple):** `init()` renderiza una vez; `remove()` y `clear()` llaman a `render()` directamente.
- **B (reactiva):** Escuchar el evento `hashchange` y re-renderizar al entrar. Más robusto — si el usuario estima en Estimer y navega a Historique, ve la nueva entrada.

**Recomendación:** Estrategia B para Historique (re-render en cada visita). Para Comparer, también re-renderizar los selects al entrar (el historial puede haber cambiado).

---

## Don't Hand-Roll

| Problema | No construir | Usar en cambio | Por qué |
|----------|-------------|----------------|---------|
| Formatear precio | Función propia de formato | `formatPrice(amount, I18n.currentLang)` ya existe | Maneja locale fr-MA y ar-MA-u-nu-latn, separadores correctos |
| Navegación entre páginas | `location.href` o `location.replace` | `Router.navigate('estimer')` | Preserva historial del browser, botón Atrás funciona |
| Leer idioma actual | `localStorage.getItem('lang')` directo | `I18n.currentLang` | Siempre sincronizado con el estado real de la app |
| Aplicar traducciones a nuevos elementos | Loop manual | `I18n.t('clave')` para elementos dinámicos | Patrón establecido; `_applyTranslations()` solo cubre DOM estático |
| Modal de confirmación | `window.confirm()` o `<dialog>` | Flujo de 2 pasos inline con `.btn-danger` | Decisión locked en CONTEXT.md; más simple y elegante |

---

## Common Pitfalls

### Pitfall 1: innerHTML con datos de usuario (XSS)
**Qué falla:** Usar `card.innerHTML = entry.make + ' ' + entry.model` en lugar de `textContent`.
**Por qué ocurre:** Es más cómodo construir HTML con template strings.
**Cómo evitar:** Para cualquier dato que provenga de `entry.*` (datos que el usuario introdujo), usar `element.textContent = entry.make`. El contenedor externo puede usar `innerHTML = ''` para limpiar, pero los datos de usuario siempre via `textContent`.
**Señal de alerta:** Cualquier `innerHTML` que contenga `entry.make`, `entry.model`, `entry.city`, etc.

### Pitfall 2: No re-renderizar al navegar
**Qué falla:** Historique muestra el historial del momento de init, no el actual. Si el usuario estima, vuelve a Historique y no ve la nueva entrada.
**Por qué ocurre:** Renderizar solo en `init()`.
**Cómo evitar:** Escuchar `hashchange` y re-renderizar Historique y Comparer al entrar a esas páginas.

### Pitfall 3: Propiedades físicas CSS en lugar de logical properties
**Qué falla:** Usar `margin-left`, `right`, `text-align: right` en los nuevos componentes.
**Por qué ocurre:** Es el instinto por defecto.
**Cómo evitar:** Toda propiedad nueva que involucre el eje inline debe usar logical properties: `margin-inline-start`, `inset-inline-end`, `text-align: end`. El UI-SPEC tiene una tabla completa.

### Pitfall 4: Timeout del botón "Effacer tout" sin limpiar
**Qué falla:** Si el timeout dispara pero el usuario ya ejecutó el borrado, el setTimeout intenta resetear un botón que ya no existe o ya está reseteado.
**Por qué ocurre:** El `setTimeout` de 3s referencia el botón sin comprobar el estado.
**Cómo evitar:** Guardar la referencia al timeout (`var clearTimer = null`) y ejecutar `clearTimeout(clearTimer)` antes de proceder en el segundo clic.

### Pitfall 5: Comparar entries con el mismo ID en ambos selects
**Qué falla:** El usuario puede seleccionar el mismo coche en "Voiture A" y "Voiture B" — la comparación sería idéntica y el ratio daría empate.
**Por qué ocurre:** Los selects están poblados con el mismo historial.
**Cómo evitar:** Si ambos selects tienen el mismo `value` (id), no renderizar comparación — mostrar mensaje "Choisissez deux véhicules différents". [ASSUMED] — no está explícitamente en el CONTEXT.md, pero es un edge case lógico. El planner debe confirmar si se maneja o se ignora.

### Pitfall 6: `mileage = 0` en el ratio precio/km
**Qué falla:** División por cero: `entry.estimated_price / 0 = Infinity`.
**Por qué ocurre:** El formulario tiene `min="1"` pero no hay constraint absoluto.
**Cómo evitar:** Lógica ya definida en CONTEXT.md: "Si km = 0, el ganador se determina solo por precio menor". Implementar: `if (a.mileage === 0 || b.mileage === 0) { winner = precio menor } else { winner = ratio menor }`.

### Pitfall 7: Opciones de select sin re-poblar al cambiar historial
**Qué falla:** El usuario borra una entrada del historial desde Historique, navega a Comparer, y el select sigue mostrando la entrada borrada.
**Por qué ocurre:** El Comparer no escucha cambios en el historial.
**Cómo evitar:** Re-poblar los selects de Comparer cada vez que se navega a `#comparer` (estrategia B de re-render).

---

## Code Examples

### `History.remove(id)` — patrón a implementar

```javascript
// Fuente: consistente con History.save() y History.getAll() existentes (líneas 1671-1708)
// Patron: var NombreModulo con try/catch en operaciones localStorage
remove: function(id) {
  var all = History.getAll();
  var filtered = all.filter(function(entry) {
    return entry.id !== id;
  });
  try {
    localStorage.setItem(History._KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('AutoValeur — no se pudo actualizar historial:', e.message);
  }
  return filtered;
},
```

### `History.clear()` — patrón a implementar

```javascript
// Fuente: consistente con History.save() y History.getAll() existentes
clear: function() {
  try {
    localStorage.setItem(History._KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('AutoValeur — no se pudo limpiar historial:', e.message);
  }
  return [];
},
```

### Fecha relativa — cálculo JS

```javascript
// Fuente: especificado en CONTEXT.md y UI-SPEC
function formatRelativeDate(isoString) {
  var days = Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000);
  if (days === 0) return I18n.t('date.today');
  if (days < 7)  return I18n.t('date.days_ago').replace('{n}', days);
  var weeks = Math.floor(days / 7);
  return I18n.t('date.weeks_ago').replace('{n}', weeks);
}
```

### Barra proporcional de precio — CSS + JS

```css
/* Nueva clase — index.html <style> */
.compare-bar-track {
  background: var(--surface-3);
  border-radius: var(--radius-sm);
  height: 12px;
  overflow: hidden;
  margin-block: var(--sp-xs);
}

.compare-bar {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-sm);
  transition: width 0.3s ease;
}
```

```javascript
// Fuente: UI-SPEC — Interaction Contracts > Barras visuales de precio
function renderBars(entryA, entryB) {
  var maxPrice = Math.max(entryA.estimated_price, entryB.estimated_price);
  var pctA = (entryA.estimated_price / maxPrice * 100).toFixed(1);
  var pctB = (entryB.estimated_price / maxPrice * 100).toFixed(1);
  document.getElementById('bar-a').style.width = pctA + '%';
  document.getElementById('bar-b').style.width = pctB + '%';
}
```

### Lógica del ganador

```javascript
// Fuente: CONTEXT.md > Comparador — Barras Visuales y Ganador
// y UI-SPEC > Ganador (ratio precio/km)
function determineWinner(entryA, entryB) {
  // Caso especial: mileage = 0 en alguno → gana el de precio menor
  if (entryA.mileage === 0 || entryB.mileage === 0) {
    if (entryA.estimated_price < entryB.estimated_price) return 'A';
    if (entryB.estimated_price < entryA.estimated_price) return 'B';
    return null; // empate
  }
  var ratioA = entryA.estimated_price / entryA.mileage;
  var ratioB = entryB.estimated_price / entryB.mileage;
  if (ratioA < ratioB) return 'A';  // menor ratio = más barato por km = mejor
  if (ratioB < ratioA) return 'B';
  return null; // empate exacto — ninguno se destaca
}
```

### Opciones del select en Comparer

```javascript
// Fuente: CONTEXT.md > Página Comparer — Selección de Valoraciones
// Formato: "{Marca} {Modelo} {Año} — {precio}"
function populateComparerSelects() {
  var entries = History.getAll();
  var selects = [
    document.getElementById('select-a'),
    document.getElementById('select-b')
  ];

  selects.forEach(function(sel, idx) {
    sel.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = I18n.t(idx === 0 ? 'comparer.select_a' : 'comparer.select_b');
    sel.appendChild(placeholder);

    entries.forEach(function(entry) {
      var opt = document.createElement('option');
      opt.value = entry.id;  // ID numérico como string
      // textContent evita XSS — el modelo viene de CAR_DB (confiable) pero el año es input del usuario
      opt.textContent = entry.make + ' ' + entry.model + ' ' + entry.year +
                        ' \u2014 ' + formatPrice(entry.estimated_price, I18n.currentLang);
      sel.appendChild(opt);
    });
  });
}
```

### Badge "Meilleur rapport"

```css
/* Nueva clase .badge — añadir al <style> de index.html */
.badge {
  display: inline-block;
  background: var(--accent);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: var(--sp-xs) var(--sp-sm);
  border-radius: var(--radius-lg);
  line-height: 1.2;
}

/* Badge posicionado absolutamente en compare-card (UI-SPEC) */
.compare-card {
  position: relative;
}

.compare-card .badge {
  position: absolute;
  top: var(--sp-sm);
  inset-inline-end: var(--sp-sm);  /* CSS logical property — RTL safe */
}
```

### Flujo de 2 pasos para "Effacer tout"

```javascript
// Fuente: CONTEXT.md > Borrado Completo del Historial + UI-SPEC > Interaction Contracts
var clearTimer = null;

document.getElementById('btn-clear').addEventListener('click', function() {
  var btn = this;

  if (btn.dataset.state === 'confirming') {
    // Segundo clic — ejecutar borrado
    clearTimeout(clearTimer);
    History.clear();
    btn.dataset.state = '';
    renderHistoryList();  // re-render → mostrará empty state
  } else {
    // Primer clic — estado de confirmación
    btn.dataset.state = 'confirming';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-danger');
    btn.textContent = I18n.t('historique.confirm_clear');

    clearTimer = setTimeout(function() {
      btn.dataset.state = '';
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-secondary');
      btn.textContent = I18n.t('historique.clear');
    }, 3000);
  }
});
```

---

## Stubs HTML actuales (VERIFIED — líneas 803-812 de index.html)

```html
<!-- PÁGINA: Historique — stub actual -->
<section id="page-historique" class="page page-historique" hidden>
  <h2 data-i18n="page.historique.title">Historique</h2>
  <p>Historique des estimations — <em>Phase 5</em></p>
</section>

<!-- PÁGINA: Comparer — stub actual -->
<section id="page-comparer" class="page page-comparer" hidden>
  <h2 data-i18n="page.comparer.title">Comparer</h2>
  <p>Comparer deux estimations — <em>Phase 5</em></p>
</section>
```

**Qué hace el planner:** Reemplazar el `<p>` stub con el HTML funcional completo de cada página. El `<h2>` y los atributos del `<section>` se conservan.

---

## Nuevas claves STRINGS a añadir (VERIFIED — del UI-SPEC)

```javascript
// Añadir a STRINGS.fr:
'historique.empty':        'Aucune estimation enregistrée',
'historique.clear':        'Effacer tout',
'historique.confirm_clear':'Confirmer ?',
'historique.delete':       'Supprimer',
'date.today':              "Aujourd'hui",
'date.days_ago':           'Il y a {n} jour(s)',
'date.weeks_ago':          'Il y a {n} semaine(s)',
'comparer.empty':          'Comparez 2 estimations',
'comparer.empty_body':     'Ajoutez au moins 2 estimations pour comparer',
'comparer.select_a':       'Choisir véhicule A',
'comparer.select_b':       'Choisir véhicule B',
'comparer.winner_badge':   'Meilleur rapport',

// Añadir a STRINGS.ar:
'historique.empty':        '\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0642\u062f\u064a\u0631 \u0645\u0633\u062c\u0644',
'historique.clear':        '\u0645\u0633\u062d \u0627\u0644\u0643\u0644',
'historique.confirm_clear':'\u062a\u0623\u0643\u064a\u062f \u061f',
'historique.delete':       '\u062d\u0630\u0641',
'date.today':              '\u0627\u0644\u064a\u0648\u0645',
'date.days_ago':           '\u0645\u0646\u0630 {n} \u064a\u0648\u0645',
'date.weeks_ago':          '\u0645\u0646\u0630 {n} \u0623\u0633\u0628\u0648\u0639',
'comparer.empty':          '\u0642\u0627\u0631\u0646 \u0628\u064a\u0646 \u062a\u0642\u064a\u064a\u0645\u064a\u0646',
'comparer.empty_body':     '\u0623\u0636\u0641 \u062a\u0642\u064a\u064a\u0645\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u0645\u0642\u0627\u0631\u0646\u0629',
'comparer.select_a':       '\u0627\u062e\u062a\u0631 \u0627\u0644\u0633\u064a\u0627\u0631\u0629 \u0623',
'comparer.select_b':       '\u0627\u062e\u062a\u0631 \u0627\u0644\u0633\u064a\u0627\u0631\u0629 \u0628',
'comparer.winner_badge':   '\u0623\u0641\u0636\u0644 \u0639\u0631\u0636',
```

---

## State of the Art

| Enfoque antiguo | Enfoque actual en este proyecto | Impacto |
|----------------|----------------------------------|---------|
| `display:none` via CSS para SPA | Atributo `hidden` nativo de HTML5 (D-15) | Semántica correcta, compatible con lectores de pantalla |
| `left/right` en CSS | CSS logical properties (`inset-inline-start/end`) | RTL automático sin media queries adicionales |
| `innerHTML` para renderizar datos | `textContent` para datos de usuario | Prevención XSS |
| `window.confirm()` para confirmaciones | Flujo de 2 pasos inline | UX consistente con la app, sin UI nativa del sistema |
| Módulos ES6 (`import/export`) | `var NombreModulo = { ... }` | Compatibilidad con arquitectura de archivo único sin bundler |

---

## Assumptions Log

| # | Claim | Section | Riesgo si es incorrecto |
|---|-------|---------|------------------------|
| A1 | Si el mismo ID se selecciona en ambos selects del Comparer, se debe mostrar un mensaje específico | Pitfall 5 | UX confusa (comparar coche consigo mismo) |
| A2 | Los módulos `Historique` y `Comparer` deben re-renderizarse en cada visita via `hashchange` (estrategia B) | Architecture Patterns | Si no se re-renderiza, el usuario ve datos desactualizados |

**Nota:** A2 es una inferencia lógica del requisito HIST-01 ("ordenadas por fecha"). Si el usuario estima y navega a Historique sin re-render, no vería la nueva entrada.

---

## Open Questions

1. **¿Dónde se inserta la lógica de Historique y Comparer dentro del bloque DOMContentLoaded?**
   - Lo que sabemos: el bloque DOMContentLoaded termina en la línea 1951.
   - Lo que falta: decidir si los módulos Historique/Comparer tienen su propio `init()` llamado desde DOMContentLoaded, o si su lógica va directamente en el handler.
   - Recomendación: patrón `var Historique = { init, render }` llamado desde DOMContentLoaded, para consistencia con `EstimerForm`.

2. **¿Cómo manejar el re-render de Comparer cuando el historial cambia desde Historique?**
   - Lo que sabemos: el Router escucha `hashchange`.
   - Recomendación: añadir un listener en `hashchange` dentro de `Comparer.init()` que re-pueble los selects. Esto es independiente del listener del Router.

---

## Environment Availability

Esta fase es puramente código/config — vanilla JS en un archivo HTML único. No hay dependencias externas de runtime.

**Step 2.6: SKIPPED** — Sin herramientas externas, CLIs, servicios ni bases de datos. Todo es localStorage + JS nativo.

---

## Validation Architecture

`nyquist_validation: true` en `.planning/config.json` — esta sección es obligatoria.

### Test Framework

| Propiedad | Valor |
|-----------|-------|
| Framework | Ninguno instalado — tests inline en consola (mismo patrón de Fase 3) |
| Archivo de config | No aplica |
| Comando rápido | Abrir `index.html` en browser + abrir DevTools consola |
| Suite completa | Inspección visual manual + consola DevTools |

**Nota:** El proyecto no tiene Jest, Vitest ni ningún framework de test. Usa tests inline condicionales (`if (location.hostname === 'localhost')`) como en las líneas 1400-1483 de `index.html`. Esta fase debe seguir el mismo patrón.

### Phase Requirements → Test Map

| Req ID | Comportamiento | Tipo de test | Comando automatizado | Existe |
|--------|---------------|--------------|---------------------|--------|
| HIST-01 | Valoraciones aparecen ordenadas (más reciente primero) | Unit inline | Consola: `History.getAll()` → verificar orden de `id` | ❌ Wave 0 |
| HIST-02 | Cada tarjeta muestra make/model/year/km/precio/fecha | UI visual | Inspección manual en browser | ❌ Wave 0 |
| HIST-03 | `History.remove(id)` elimina la entrada correcta | Unit inline | Consola: `History.save({...}); History.remove(id); History.getAll()` | ❌ Wave 0 |
| HIST-04 | `History.clear()` deja el array vacío | Unit inline | Consola: `History.clear(); History.getAll()` → `[]` | ❌ Wave 0 |
| HIST-05 | Estado vacío aparece si historial vacío | UI visual | Inspección manual: limpiar historial → verificar empty state | ❌ Wave 0 |
| COMP-01 | Dos selects poblados desde historial | UI visual | Navegar a `#comparer` con 2+ entradas → verificar selects | ❌ Wave 0 |
| COMP-02 | Datos lado a lado al seleccionar ambos | UI visual | Seleccionar dos entradas → verificar tarjetas | ❌ Wave 0 |
| COMP-03 | Barras proporcionales de precio | UI visual | Verificar que la barra del coche más caro = 100% | ❌ Wave 0 |
| COMP-04 | Ganador: borde verde + badge | Unit inline + UI visual | Consola: verificar lógica `determineWinner()`; UI: verificar clase `.compare-winner` | ❌ Wave 0 |
| COMP-05 | Mensaje orientativo si < 2 entradas | UI visual | Historial vacío → navegar a Comparer → verificar mensaje | ❌ Wave 0 |

### Tests inline a añadir (patrón Fase 3)

```javascript
// Dentro del bloque if (location.hostname === 'localhost') existente
// (o crear un nuevo bloque al final del script)

(function testHistory() {
  console.log('=== Tests History (Fase 5) ===');

  // Limpiar para test limpio
  History.clear();
  var empty = History.getAll();
  console.assert(empty.length === 0, 'clear() debe dejar array vacío');

  // save + getAll
  History.save({ make: 'Dacia', model: 'Logan', year: 2019, mileage: 85000,
                 condition: 'bon', fuel: 'diesel', transmission: 'manuelle', city: 'Casablanca',
                 estimated_price: 58500, price_range: { min: 52700, max: 64400 }, breakdown: [] });
  var all = History.getAll();
  console.assert(all.length === 1, 'getAll() debe retornar 1 entrada tras save()');

  // remove
  var id = all[0].id;
  History.remove(id);
  var afterRemove = History.getAll();
  console.assert(afterRemove.length === 0, 'remove(id) debe eliminar la entrada');

  // clear con múltiples entradas
  History.save({ make: 'BMW', model: 'Serie 3', year: 2018, mileage: 120000,
                 condition: 'moyen', fuel: 'diesel', transmission: 'automatique', city: 'Rabat',
                 estimated_price: 95000, price_range: { min: 85500, max: 104500 }, breakdown: [] });
  History.save({ make: 'Kia', model: 'Picanto', year: 2022, mileage: 25000,
                 condition: 'excellent', fuel: 'essence', transmission: 'manuelle', city: 'Marrakech',
                 estimated_price: 72000, price_range: { min: 64800, max: 79200 }, breakdown: [] });
  History.clear();
  var afterClear = History.getAll();
  console.assert(afterClear.length === 0, 'clear() con 2 entradas debe dejar array vacío');

  console.log('=== Tests History completados ===');
})();
```

### Checks de i18n (todos los STRINGS keys)

```javascript
// Verificar que todas las claves de Fase 5 existen en fr y ar
(function testI18nKeys() {
  var fase5Keys = [
    'historique.empty', 'historique.clear', 'historique.confirm_clear', 'historique.delete',
    'date.today', 'date.days_ago', 'date.weeks_ago',
    'comparer.empty', 'comparer.empty_body', 'comparer.select_a', 'comparer.select_b',
    'comparer.winner_badge'
  ];
  var langs = ['fr', 'ar'];
  var missing = [];
  langs.forEach(function(lang) {
    fase5Keys.forEach(function(key) {
      if (!STRINGS[lang][key]) missing.push(lang + ':' + key);
    });
  });
  if (missing.length === 0) {
    console.log('[PASS] i18n — todas las claves de Fase 5 existen en fr y ar');
  } else {
    console.error('[FAIL] i18n — claves faltantes: ' + missing.join(', '));
  }
})();
```

### Sampling Rate

- **Por tarea:** Abrir index.html en browser local, verificar en consola que los asserts pasan.
- **Por wave:** Verificar en consola todos los tests inline + inspección visual de ambas páginas en FR y AR.
- **Phase gate:** Todos los tests inline pasan + UI visual validada en FR y AR + layout RTL correcto en ambas páginas.

### Wave 0 Gaps

- [ ] Bloque de tests inline para `History.remove()` y `History.clear()` — cubre HIST-03, HIST-04
- [ ] Bloque de tests inline para `determineWinner()` — cubre COMP-04
- [ ] Bloque de tests inline para claves i18n — cubre cobertura de STRINGS
- [ ] (No hay framework a instalar — el patrón de tests inline ya existe en index.html)

---

## Security Domain

### ASVS aplicable

| Categoría ASVS | Aplica | Control estándar |
|----------------|--------|-----------------|
| V2 Autenticación | No | No hay autenticación |
| V3 Gestión de sesiones | No | No hay sesiones |
| V4 Control de acceso | No | No hay roles |
| V5 Validación de entrada | Sí | `textContent` para datos de usuario (XSS prevention) |
| V6 Criptografía | No | Sin datos sensibles |

### Amenazas conocidas para este stack

| Patrón | STRIDE | Mitigación estándar |
|--------|--------|---------------------|
| XSS via datos de usuario en historial | Tampering | `textContent` — NUNCA `innerHTML` con `entry.*` |
| localStorage corrompido (JSON inválido) | Tampering | `History.getAll()` ya tiene try/catch que retorna `[]` |
| Historial manipulado desde DevTools | Tampering | No mitigable — historial local del usuario; aceptable por diseño |

---

## Sources

### Primary (HIGH confidence — VERIFIED via lectura directa de index.html)

- `index.html` líneas 1663-1708 — módulo `var History`: `_KEY`, `save()`, `getAll()`
- `index.html` líneas 1087-1093 — función `formatPrice()`
- `index.html` líneas 1017-1079 — módulo `var I18n`: `t()`, `setLang()`, `_applyTranslations()`, `init()`
- `index.html` líneas 1718-1781 — `var Router` / `const Router`: `navigate()`, `_show()`, `init()`
- `index.html` líneas 874-1009 — objeto `STRINGS` con todas las claves existentes
- `index.html` líneas 36-651 — CSS: custom properties, `.card`, `.btn-primary`, `.btn-secondary`, `.empty-state`
- `index.html` líneas 803-812 — stubs actuales de `#page-historique` y `#page-comparer`
- `.planning/phases/05-historique-y-comparer/05-CONTEXT.md` — todas las decisiones locked
- `.planning/phases/05-historique-y-comparer/05-UI-SPEC.md` — contratos visuales e interacción

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — HIST-01 a HIST-05, COMP-01 a COMP-05
- `.planning/ROADMAP.md` — planes 05-01 a 05-05

### Tertiary (LOW confidence)

- A1 (ver Assumptions Log): edge case de mismo ID en ambos selects — inferencia lógica no explícita en CONTEXT.md

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — código fuente verificado directamente
- Architecture: HIGH — patrones extraídos del código existente
- Pitfalls: HIGH — derivados del análisis del código real + decisiones locked
- i18n keys: HIGH — tabla completa del UI-SPEC verificada

**Research date:** 2026-04-13
**Valid until:** 2026-05-13 (estable — archivo único sin dependencias externas)
