# Stack Research — AutoValeur MA

## Single-File PWA with Vanilla JS (2025)

### SPA sin framework en un único archivo

**Patrón recomendado: hash-based routing + secciones ocultas**

```html
<!-- Cada "página" es una sección con display:none por defecto -->
<section id="page-estimer" class="page">...</section>
<section id="page-historique" class="page">...</section>
<section id="page-comparer" class="page">...</section>
```

```js
// Router minimalista
const routes = {
  '#estimer': 'page-estimer',
  '#historique': 'page-historique',
  '#comparer': 'page-comparer'
};

window.addEventListener('hashchange', navigate);
function navigate() {
  const hash = location.hash || '#estimer';
  document.querySelectorAll('.page').forEach(p => p.hidden = true);
  document.getElementById(routes[hash]).hidden = false;
}
```

- Sin recarga de página, navegación instantánea
- Funciona en file:// y cualquier servidor estático
- El botón atrás del navegador funciona nativamente con hash routing

### Estructura JS en un solo archivo

**Patrón de módulo IIFE con namespaces:**

```js
const AutoValeur = (() => {
  // DB de coches
  const DB = { brands: {...}, models: {...} };
  
  // Motor de valoración
  const Engine = { estimate(params) {...} };
  
  // Historial (localStorage)
  const History = { save(val) {...}, getAll() {...}, clear() {...} };
  
  // Comparador
  const Comparer = { render(id1, id2) {...} };
  
  // UI / Router
  const App = { init() {...}, navigate(page) {...} };
  
  return { init: App.init };
})();

document.addEventListener('DOMContentLoaded', AutoValeur.init);
```

Esto mantiene el código organizado sin ningún bundler.

### Service Worker para single-file PWA

**Estrategia Cache-First para una app offline:**

El service worker DEBE ser un archivo separado (`sw.js`) — los navegadores requieren que esté en su propio archivo para poder controlar el scope. Para mantener "un solo archivo desplegable", se puede usar un truco con Blob URL:

```js
// Inline service worker via Blob — funciona en https:// y localhost
const swCode = `
  const CACHE = 'autovaleur-v1';
  self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/'])));
  });
  self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  });
`;
const blob = new Blob([swCode], {type: 'application/javascript'});
navigator.serviceWorker.register(URL.createObjectURL(blob));
```

**Limitación:** Blob URL SW no funciona en file://. Para producción (GitHub Pages, Netlify), sí funciona. Alternativa: generar sw.js como segundo archivo pequeño.

**Recomendación:** Usar dos archivos: `index.html` + `sw.js`. Sigue siendo "sin servidor, sin npm", y sw.js puede ser mínimo (< 20 líneas).

### Web App Manifest

El manifest puede ser inline via `<link>` apuntando a un data URI:

```html
<link rel="manifest" href="data:application/json,{...}">
```

O como segundo archivo `manifest.json`. Para máxima compatibilidad, usar archivo externo.

### localStorage — Estructura recomendada

```js
const STORAGE_KEY = 'autovaleur_history';

// Guardar valoración
function saveValuation(record) {
  const history = getHistory();
  history.unshift({ ...record, id: Date.now(), timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100))); // max 100
}

// Schema de un registro
{
  id: 1713456789000,
  timestamp: "2026-04-11T10:00:00Z",
  brand: "Dacia",
  model: "Logan",
  year: 2019,
  km: 85000,
  fuel: "diesel",
  transmission: "manual",
  condition: "bon",
  city: "casablanca",
  estimated_price: 58000,
  breakdown: {
    base_price: 85000,
    age_factor: -0.28,
    km_factor: -0.12,
    condition_factor: 0,
    fuel_bonus: 0.05,
    city_correction: 0.08,
    transmission_factor: 0
  }
}
```

### RTL / Bidireccional (French + Arabic)

```html
<!-- Usar lang y dir dinámicamente -->
<html lang="fr" dir="ltr">

<!-- En JS al cambiar idioma -->
document.documentElement.lang = lang; // 'fr' o 'ar'
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
```

**CSS con logical properties (recomendado):**

```css
/* En lugar de margin-left: 1rem */
.card { margin-inline-start: 1rem; }

/* En lugar de border-left */
.nav-item { border-inline-start: 3px solid var(--accent); }
```

Los logical properties se adaptan automáticamente a RTL sin media queries adicionales.

**Fuentes:**
- Francés: `system-ui, -apple-system, sans-serif`
- Árabe: añadir `'Noto Sans Arabic', 'Cairo', sans-serif` — Google Fonts o bundle en base64

### CSS — Arquitectura recomendada

```css
:root {
  /* Paleta */
  --primary: #1a73e8;
  --surface: #ffffff;
  --surface-2: #f8f9fa;
  --text: #202124;
  --text-muted: #5f6368;
  --accent: #34a853;
  --danger: #ea4335;
  
  /* Espaciado */
  --sp-xs: 0.25rem;
  --sp-sm: 0.5rem;
  --sp-md: 1rem;
  --sp-lg: 1.5rem;
  --sp-xl: 2rem;
  
  /* Radios */
  --radius: 12px;
  --radius-sm: 6px;
}

/* Mobile-first */
.container { max-width: 480px; margin: 0 auto; padding: 0 var(--sp-md); }
```

## Veredicto de Stack

| Componente | Elección | Confianza |
|------------|----------|-----------|
| Estructura | HTML semántico + secciones ocultas + hash routing | Alta |
| JS | Vanilla ES6+ IIFE namespaces | Alta |
| CSS | Custom properties + logical properties, mobile-first | Alta |
| Service Worker | sw.js separado (mínimo) + cache-first | Alta |
| Persistencia | localStorage con JSON serializado | Alta |
| Fuentes árabe | Google Fonts Cairo (1 request) o system-ui | Media |
| Iconos | SVG inline o lucide-static (CDN) | Alta |
