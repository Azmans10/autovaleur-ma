# Phase 1: Estructura base, SPA y PWA - Research

**Researched:** 2026-04-11
**Domain:** Vanilla JS PWA — Hash Routing, Service Worker, Web App Manifest, CSS mobile-first
**Confidence:** HIGH

---

## Summary

La Fase 1 construye el esqueleto funcional de AutoValeur MA: tres páginas navegables vía hash routing, un Service Worker cache-first que habilita el modo offline, y un Web App Manifest que satisface los criterios de instalabilidad de Chrome en Android. Todo sin frameworks, sin bundler, sin npm en runtime.

Los requisitos técnicos de instalabilidad de Chrome en 2025 son concretos y alcanzables: dos iconos PNG (192px y 512px), un manifest con `name`, `start_url`, `display: standalone`, y un Service Worker con `fetch` handler activo. Nada más. iOS Safari requiere un tratamiento paralelo con meta tags propietarios y `apple-touch-icon` de 180px, ya que no muestra prompt automático de instalación.

El patrón hash routing con `hashchange` + secciones `hidden` es robusto, libre de dependencias y funciona correctamente con el botón Atrás del navegador. El único gotcha significativo es que el Service Worker no puede registrarse desde `file://` — se necesita un servidor HTTP local para desarrollo.

**Recomendación principal:** Usar exactamente tres archivos (`index.html`, `sw.js`, `manifest.json`) con cache-first versioned en el SW, `skipWaiting()` + `clients.claim()` para actualizaciones inmediatas, e iconos PNG inline (data URI o archivos externos). La barra nav inferior debe usar `padding-bottom: env(safe-area-inset-bottom, 0)` y el viewport meta debe incluir `viewport-fit=cover`.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | La app existe como archivos estáticos desplegables en GitHub Pages sin configuración de servidor | 3 archivos: index.html + sw.js + manifest.json — cualquier CDN estático los sirve |
| PWA-02 | La app funciona completamente offline tras la primera carga (Service Worker con cache-first) | Cache-first con `caches.addAll(['/','sw.js','manifest.json'])` en install event |
| PWA-03 | La app es instalable en pantalla de inicio de Android (Web App Manifest completo) | Manifest con name, start_url, display:standalone, iconos 192px+512px + SW con fetch handler |
| PWA-04 | La app muestra instrucciones de instalación manual para iOS Safari | iOS no tiene `beforeinstallprompt` — UI informativa es el único camino |
| PWA-05 | La interfaz es responsive y funciona en móviles Android (pantallas 360px+) | CSS mobile-first con `max-width: 480px` centrado, sin media queries complejos |
| NAV-01 | 3 páginas: Estimer / Historique / Comparer con navegación via hash routing sin recarga | `hashchange` + `hidden` attribute en secciones — patrón verificado |
| NAV-02 | Barra de navegación inferior fija con acceso a las 3 páginas | `position: fixed; bottom: 0` + `env(safe-area-inset-bottom)` para iPhone notch |
| NAV-03 | El botón Atrás del navegador funciona correctamente entre páginas | El hash routing maneja esto nativamente — cada `location.hash =` añade entrada al historial |
</phase_requirements>

---

## Standard Stack

### Core — Fase 1

| Componente | Elección | Versión/Spec | Por qué es estándar |
|------------|----------|--------------|---------------------|
| HTML estructura | Secciones semánticas con `hidden` attribute | HTML5 | `hidden` es nativo, no requiere CSS adicional para ocultar |
| JS routing | `hashchange` event + `location.hash` | ES5+ | Funciona en todos los browsers target, historial nativo gratis |
| Service Worker | Cache-first con versioning | SW API Level 1 | Estrategia probada para apps offline-first de archivos estáticos |
| Manifest | `manifest.json` externo | Web App Manifest W3C | Máxima compatibilidad; inline data-URI manifest tiene bugs en algunos Android |
| CSS theming | Custom properties en `:root` | CSS3 | Sin preprocesador, soporte completo en Chrome Android y Safari iOS |
| Nav safe area | `env(safe-area-inset-bottom)` | CSS Environment Variables | Estándar para iPhone notch/Dynamic Island en PWAs |

### Detalles de implementación verificados

**Manifest.json mínimo para instalabilidad en Android Chrome:**
```json
{
  "name": "AutoValeur MA",
  "short_name": "AutoValeur",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a73e8",
  "lang": "fr",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Iconos — formatos y tamaños requeridos:**

| Icono | Tamaño | Formato | Propósito |
|-------|--------|---------|-----------|
| `icon-192.png` | 192x192 | PNG | Chrome Android install prompt (OBLIGATORIO) |
| `icon-512.png` | 512x512 | PNG | Splash screen Android + Play Store (OBLIGATORIO) |
| `apple-touch-icon.png` | 180x180 | PNG | iOS Safari "Add to Home Screen" (no usa el manifest) |
| favicon | 32x32 o SVG | PNG/SVG | Tab del browser en desktop |

**Nota sobre SVG en manifest:** Chromium soporta SVG en manifest icons desde ~2022, pero para máxima compatibilidad con Samsung Internet y Android WebView se recomienda PNG. [CITED: developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons]

**Generación de iconos desde SVG (sin npm):**
Los iconos pueden ser un cuadrado de color sólido con las iniciales "AV" como base64 inline en el HTML. Para Fase 1, iconos placeholder de color son suficientes — la instalabilidad técnica importa, no el arte final.

---

## Architecture Patterns

### Estructura de archivos — Fase 1

```
autovaleur-ma/
├── index.html        ← app completa (HTML + CSS + JS)
├── sw.js             ← service worker (~25 líneas)
├── manifest.json     ← PWA manifest
├── icon-192.png      ← icono Android instalable
├── icon-512.png      ← icono splash screen
└── apple-touch-icon.png  ← icono iOS Safari
```

### Pattern 1: Hash Router con `hidden` attribute

**Qué es:** Cada "página" es una `<section class="page">` con `id="page-X"`. El router escucha `hashchange` y aplica/quita el atributo `hidden` nativo de HTML.

**Por qué `hidden` en lugar de `display:none` via CSS:** El atributo HTML `hidden` es semánticamente correcto, funciona sin CSS, y es sobreescribible con `[hidden] { display: block }` si se necesita override. Más robusto que clases CSS.

**Cuándo usar:** Siempre para SPAs de archivo único sin framework.

```javascript
// Source: basado en ARCHITECTURE.md del proyecto + verificado en MDN
const ROUTES = {
  '': 'estimer',
  'estimer': 'estimer',
  'historique': 'historique',
  'comparer': 'comparer'
};

const Router = {
  init() {
    window.addEventListener('hashchange', () => this._show());
    window.addEventListener('load', () => this._show());
    this._show();
  },
  navigate(page) {
    location.hash = page; // añade entrada al historial del browser — Atrás funciona gratis
  },
  _show() {
    const hash = location.hash.replace('#', '') || 'estimer';
    const pageId = ROUTES[hash] || 'estimer';
    document.querySelectorAll('.page').forEach(p => { p.hidden = true; });
    const target = document.getElementById('page-' + pageId);
    if (target) target.hidden = false;
    // Actualizar nav activo
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === pageId);
    });
  }
};
```

**Nota PWA standalone + iOS:** En modo standalone en iOS, `location.hash` funciona correctamente. El gotcha es diferente: iOS standalone NO mantiene el historial entre sesiones — si el usuario cierra la PWA y la reabre, vuelve a `start_url` (no a la última página visitada). Esto es comportamiento esperado, no un bug. [CITED: firt.dev/notes/pwa-ios/]

### Pattern 2: Service Worker Cache-First con Versioning y Skip Waiting

**Qué es:** El SW precachea los archivos en `install`, sirve siempre desde caché en `fetch`, y al activar borra cachés viejos. `skipWaiting()` + `clients.claim()` aseguran que la actualización se aplica en la próxima recarga sin esperar que el usuario cierre todas las pestañas.

```javascript
// sw.js — completo para Fase 1
// Source: MDN Service Worker API + web.dev service-worker-lifecycle
const CACHE_NAME = 'autovaleur-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Install: precaché de todos los assets
self.addEventListener('install', event => {
  self.skipWaiting(); // activa el nuevo SW inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// Activate: limpia cachés de versiones anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => clients.claim()) // toma control de páginas abiertas
  );
});

// Fetch: cache-first con fallback a red
self.addEventListener('fetch', event => {
  // Solo cachear GET requests del mismo origen
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          // Cachear recursos nuevos dinámicamente
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
      )
      .catch(() => caches.match('./index.html')) // fallback offline
  );
});
```

**Importante para actualizaciones:** Cuando se cambie código en `index.html`, hay que incrementar `CACHE_NAME` (`autovaleur-v2`, etc.) para que el browser detecte el nuevo SW y limpie el caché viejo. [CITED: web.dev/articles/install-criteria + MDN]

### Pattern 3: Registro del SW desde index.html

```html
<!-- En <head> de index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1a73e8">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="AutoValeur">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

```javascript
// Al final del body o en DOMContentLoaded
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.warn('SW error:', err));
  });
}
```

**`viewport-fit=cover`** es OBLIGATORIO para que `env(safe-area-inset-bottom)` funcione en iPhone. Sin este atributo, el navegador ignora la variable CSS y la barra nav se solapa con el Home Indicator.

### Pattern 4: CSS Nav Bar inferior con safe-area-inset

```css
/* Source: MDN env() + CSS-Tricks "The Notch and CSS" */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  z-index: 100;
}

/* El contenido de las páginas necesita padding para no quedar debajo de la nav */
.page {
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}
```

### Pattern 5: Instrucciones iOS (PWA-04)

iOS Safari NO muestra `beforeinstallprompt`. Para cumplir PWA-04, la app debe mostrar un banner o modal con instrucciones manuales. La detección se hace comprobando si la app YA está en modo standalone:

```javascript
// Detectar si ya está instalada como PWA
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true; // propiedad propietaria iOS

// Detectar iOS Safari (no Chrome en iOS)
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = isStandalone;

if (isIOS && !isInStandaloneMode) {
  // Mostrar banner: "Pour installer: bouton Partager → Sur l'écran d'accueil"
  showIOSInstallBanner();
}
```

**Nota:** `beforeinstallprompt` SOLO existe en Chrome/Edge/Samsung Internet (Android). En iOS no existe. [CITED: MDN Making PWAs installable]

### Anti-Patterns a evitar

- **Manifest inline como data URI en `<link href="data:...">` :** Tiene bugs en Samsung Internet y algunos Android WebView. Usar siempre `manifest.json` externo.
- **Registrar SW antes de `window.load`:** Puede competir con la carga inicial de la página. Registrar siempre dentro de `window.addEventListener('load', ...)`.
- **Cache de `sw.js` en el propio SW:** El browser gestiona la actualización del SW file directamente; no incluirlo en `PRECACHE_URLS` puede causar confusion aunque en práctica el browser lo maneja.
- **Sin `skipWaiting()`:** El nuevo SW esperaría hasta que el usuario cierre TODAS las pestañas. Para una app de archivo único esto es confuso.
- **`display: browser` en manifest:** No activa el modo standalone. Solo `standalone`, `fullscreen` o `minimal-ui` califican para el install prompt.

---

## Don't Hand-Roll

| Problema | No construir | Usar en cambio | Por qué |
|----------|-------------|----------------|---------|
| Servidor local de desarrollo | Script custom para servir archivos | `npx http-server .` | SW no funciona en `file://`; `http-server` disponible via npx (node v24 confirmado) |
| Detección offline | Polling con `fetch()` custom | `window.addEventListener('online'/'offline')` + `navigator.onLine` | API nativa, funciona en todos los targets |
| Gestión de caché | Sistema custom de versioning | Nombre de caché versionado + delete en activate | El browser actualiza sw.js automáticamente cuando cambia; solo cambiar el string de cache basta |
| Iconos PWA | Diseño desde cero en Fase 1 | Placeholder SVG/PNG generado como base64 | En Fase 1 lo que importa es la instalabilidad técnica, no el arte |

---

## Common Pitfalls

### Pitfall 1: SW no se registra en desarrollo (file://)

**Qué falla:** Abrir `index.html` directamente en el browser → el SW silenciosamente no se registra → la app "funciona" pero sin offline capability → falso positivo al testear.

**Por qué:** Los Service Workers solo se registran en `https://` o `localhost`/`127.0.0.1`. La URL `file://` está explícitamente excluida por el spec.

**Cómo evitar:** Usar siempre `npx http-server . -p 8080` para desarrollo local. Con Node v24 disponible en esta máquina, `npx http-server` funciona sin instalación previa.

**Señales de alerta:** No ver "SW registrado" en console; Application tab en DevTools no muestra ningún SW.

### Pitfall 2: `viewport-fit=cover` ausente → safe-area-inset no funciona en iPhone

**Qué falla:** La variable CSS `env(safe-area-inset-bottom)` devuelve siempre `0` aunque el iPhone tenga Dynamic Island o Home Indicator.

**Por qué:** Sin `viewport-fit=cover` en el meta viewport, el browser restringe el viewport al "safe area" automáticamente y las variables CSS de safe area no se exponen.

**Cómo evitar:** `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` — exactamente en ese orden.

### Pitfall 3: Manifest no reconocido → Chrome no muestra install prompt

**Causas más frecuentes:**
1. `display` no está en `["standalone","fullscreen","minimal-ui"]` — `"browser"` NO califica.
2. Faltan los iconos de **exactamente** 192px y 512px (cualquier otro tamaño no sustituye).
3. El manifest se sirve con MIME type incorrecto — debe ser `application/manifest+json` o `application/json`. GitHub Pages lo hace correctamente.
4. `prefer_related_applications: true` bloquea el install prompt.

**Señales de alerta:** Chrome DevTools → Application → Manifest muestra warnings en rojo.

### Pitfall 4: Caché stale — usuario no ve actualizaciones del código

**Qué falla:** Se actualiza `index.html` pero el SW sigue sirviendo la versión cacheada. Incluso con `skipWaiting()`, si `CACHE_NAME` no cambia, el SW detecta que ya está instalado y no re-cachea.

**Por qué:** El browser solo reinstala el SW cuando detecta que el *archivo* `sw.js` ha cambiado (diferente contenido byte a byte). Si el nombre de caché no cambia, el SW no reprecachea los assets.

**Cómo evitar:** Cada deploy debe cambiar `CACHE_NAME`. Estrategia: `autovaleur-v1`, `autovaleur-v2`... o usar timestamp: `autovaleur-${BUILD_DATE}`.

### Pitfall 5: iOS Safari — `beforeinstallprompt` inexistente

**Qué falla:** Código que escucha `beforeinstallprompt` para mostrar un botón "Instalar" no hace nada en iOS → los usuarios de iOS nunca ven instrucciones de instalación.

**Cómo evitar:** Lógica bifurcada: Android → esperar `beforeinstallprompt`; iOS → detectar `navigator.standalone !== true` y mostrar instrucciones manuales. Ver Pattern 5 arriba.

### Pitfall 6: Hash router + navegación interna rompe el botón Atrás

**Qué falla:** Si el código del router navega con `location.replace('#page')` en lugar de `location.hash = 'page'`, no añade entradas al historial del browser → el botón Atrás sale de la app en lugar de navegar entre páginas.

**Cómo evitar:** Siempre `location.hash = pageName` (no `location.replace()`). El hashchange lo maneja el listener. [VERIFIED: MDN Hash routing glossary]

---

## Code Examples

### HTML base estructura Fase 1

```html
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#1a73e8">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="AutoValeur">
  <title>AutoValeur MA</title>
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <style>/* CSS aquí */</style>
</head>
<body>

  <header>
    <h1>AutoValeur MA</h1>
  </header>

  <main>
    <section id="page-estimer" class="page">
      <h2>Estimer</h2>
      <!-- contenido placeholder Fase 1 -->
    </section>

    <section id="page-historique" class="page" hidden>
      <h2>Historique</h2>
    </section>

    <section id="page-comparer" class="page" hidden>
      <h2>Comparer</h2>
    </section>
  </main>

  <nav class="bottom-nav" role="navigation" aria-label="Navigation principale">
    <button class="nav-item active" data-page="estimer" onclick="Router.navigate('estimer')">
      <!-- icono SVG inline -->
      <span>Estimer</span>
    </button>
    <button class="nav-item" data-page="historique" onclick="Router.navigate('historique')">
      <span>Historique</span>
    </button>
    <button class="nav-item" data-page="comparer" onclick="Router.navigate('comparer')">
      <span>Comparer</span>
    </button>
  </nav>

  <script>/* JS aquí */</script>
</body>
</html>
```

### CSS Custom Properties base

```css
/* Source: STACK.md del proyecto + verificado contra MDN CSS Custom Properties */
:root {
  --primary:      #1a73e8;
  --surface:      #ffffff;
  --surface-2:    #f8f9fa;
  --text:         #202124;
  --text-muted:   #5f6368;
  --accent:       #34a853;
  --danger:       #ea4335;
  --border:       #e0e0e0;

  --sp-xs:  0.25rem;   /* 4px  */
  --sp-sm:  0.5rem;    /* 8px  */
  --sp-md:  1rem;      /* 16px */
  --sp-lg:  1.5rem;    /* 24px */
  --sp-xl:  2rem;      /* 32px */

  --radius:    12px;
  --radius-sm: 6px;

  --nav-height: 56px;
}

/* Reset mínimo */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--surface-2);
  color: var(--text);
  min-height: 100dvh; /* dvh para móviles con barra de browser */
}

/* Layout */
.page {
  min-height: 100dvh;
  padding: var(--sp-md);
  padding-bottom: calc(var(--nav-height) + var(--sp-xl) + env(safe-area-inset-bottom, 0px));
}

/* Nav inferior */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: stretch;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-xs);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s;
}
.nav-item.active { color: var(--primary); }

/* Transición suave entre páginas */
.page { animation: fadeIn 0.15s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Responsive: centrado en pantallas grandes */
main { max-width: 480px; margin: 0 auto; }
```

---

## Offline Indicator — Recomendación

Para una app de valoración de coches offline-first, el indicador de offline es **útil pero no bloqueante** — la app funciona igual sin internet. La recomendación para Fase 1 es **no incluir un indicador** en este momento:

- La app **siempre funciona offline** (no hay peticiones de red en el flujo principal)
- Un banner "mode hors-ligne" podría confundir al usuario pensando que la app está "rota"
- El indicador se añade mejor en Fase 6 (pulido), si los test de usuario lo requieren

Si se quiere implementar en fases futuras:

```javascript
// Patrón simple y no invasivo
window.addEventListener('offline', () => {
  document.body.classList.add('is-offline');
});
window.addEventListener('online', () => {
  document.body.classList.remove('is-offline');
});
// En CSS: .is-offline::before { content: "Hors ligne"; ... }
```

`navigator.onLine` es no fiable (puede reportar `true` aunque no haya internet real), por lo que los eventos `online`/`offline` son más precisos.

---

## Validation Architecture

### Test Framework

| Propiedad | Valor |
|-----------|-------|
| Framework | Manual + Chrome DevTools (no hay test runner en proyecto vanilla sin npm) |
| Config file | No aplica |
| Quick run command | `npx http-server . -p 8080 -c-1` (sin cache) |
| Full suite command | Chrome DevTools → Application → Manifest + Service Workers |

### Phase Requirements → Test Map

| Req ID | Comportamiento | Tipo de test | Comando/Método | Automatizable |
|--------|---------------|--------------|----------------|---------------|
| PWA-01 | Archivos estáticos sin config servidor | Smoke | Abrir en `http://localhost:8080` con `http-server` | Manual |
| PWA-02 | Offline tras primera carga | Funcional | DevTools → Network → Offline → recargar | Manual |
| PWA-03 | Instalable en Android | PWA audit | DevTools → Application → Manifest (sin errores rojos) | Manual |
| PWA-04 | Instrucciones iOS visibles | UI | Verificar que el banner iOS aparece en Safari o emulación | Manual |
| PWA-05 | Responsive 360px+ | Visual | DevTools → Device Mode → Moto G4 (360px) | Manual |
| NAV-01 | Hash routing sin recarga | Funcional | Navegar entre páginas, verificar que no hay `reload` en Network tab | Manual |
| NAV-02 | Nav inferior fija | Visual | Scroll down, verificar que la nav no desaparece | Manual |
| NAV-03 | Botón Atrás funciona | Funcional | Navegar A→B→C, presionar Atrás × 2, debe llegar a A | Manual |

### Sampling Rate

- **Por cada plan completado:** Verificar en `http://localhost:8080` que nada se ha roto
- **Al completar Fase 1:** Checklist completo de todos los success criteria
- **Gate de fase:** DevTools Manifest sin errores rojos + SW registrado y activo

### Wave 0 Gaps

No hay framework de tests automatizados en este proyecto (vanilla sin npm). Los tests son manuales en Chrome DevTools. Asegurarse de que `npx http-server` está disponible antes de ejecutar los planes (confirmado: Node v24 + npx disponibles en esta máquina).

---

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|---------------|------------|---------|---------|
| Node.js + npx | Servidor local dev (SW testing) | Sí | v24.14.1 | `python -m http.server 8080` |
| http-server (via npx) | Servir archivos localmente | Sí | v14.1.1 | `python -m http.server` |
| Chrome DevTools | Verificar PWA manifest y SW | Asumido disponible | — | Firefox DevTools (limitado para PWA) |
| Android Chrome | Test PWA install prompt | [ASSUMED] | — | Chrome DevTools Device Mode |
| Python | Fallback servidor local | No verificado | — | npx http-server (ya disponible) |

**Dependencias sin fallback:** Ninguna que bloquee la ejecución de la fase.

---

## State of the Art

| Enfoque antiguo | Enfoque actual (2025) | Cuándo cambió | Impacto |
|----------------|----------------------|---------------|---------|
| SW requerido para instalabilidad Chrome | SW NO requerido para instalar desde menú | Chrome 108 (mobile) / 112 (desktop) | Simplifica requisitos mínimos pero SW sigue siendo necesario para offline |
| Lighthouse PWA audit en CI | Chrome deprecó Lighthouse PWA testing | ~2023 | No usar Lighthouse PWA score como gate; usar DevTools Application tab |
| `display: browser` en manifest | No activa install prompt | Siempre fue así, documentado mejor en 2024 | Usar `standalone` |
| `apple-mobile-web-app-capable` como único mecanismo iOS | iOS 15.4+ también lee el manifest para iconos | iOS 15.4 (2022) | Incluir ambos para compatibilidad con iOS <15.4 |

**Deprecado/obsoleto:**
- `beforeinstallprompt` en iOS: nunca existió, no esperar que aparezca
- Iconos en formato `.ico` para manifest: obsoleto, usar PNG o SVG

---

## Assumptions Log

| # | Claim | Sección | Riesgo si es incorrecto |
|---|-------|---------|------------------------|
| A1 | `skipWaiting()` en `install` + `clients.claim()` en `activate` es el patrón estándar recomendado para actualizaciones inmediatas | Pattern 2 (SW) | Bajo — múltiples fuentes confirman este patrón |
| A2 | `http-server` v14.1.1 via npx funciona correctamente para servir PWA con SW en localhost | Environment | Bajo — confirmado via `npx http-server --version` en esta máquina |
| A3 | Los iconos placeholder (color sólido) son suficientes para que Chrome muestre el install prompt sin errores en DevTools | Iconos | Bajo — Chrome no verifica el contenido del icono, solo sus dimensiones y que sea PNG válido |
| A4 | `dvh` (dynamic viewport height) tiene soporte suficiente en Android Chrome y iOS Safari para usarlo en Fase 1 | CSS base | Medio — `dvh` disponible desde Chrome 108 y Safari 15.4; cubrir con `min-height: 100vh` como fallback |

---

## Open Questions

1. **¿Iconos como archivos externos vs base64 embebido?**
   - Lo que sabemos: Chrome requiere que los iconos del manifest sean URLs alcanzables, no data URIs en el manifest
   - Lo que no está claro: si embeber las imágenes como base64 en el propio index.html y referenciarlas desde el manifest funciona en todos los browsers target
   - Recomendación: Usar archivos PNG externos (icon-192.png, icon-512.png). Son 3-5KB cada uno, triviales de incluir en el repo.

2. **¿Cómo generar los iconos PNG sin herramientas de diseño?**
   - Lo que sabemos: Para Fase 1, un icono simple (cuadrado de color + texto "AV") es suficiente
   - Recomendación: Usar un script HTML+Canvas de una línea para exportar como PNG, o usar favicon.io/realfavicongenerator.net

---

## Security Domain

| Categoría ASVS | Aplica | Control estándar |
|----------------|--------|-----------------|
| V2 Authentication | No | Sin autenticación en esta app |
| V3 Session Management | No | Sin sesiones |
| V4 Access Control | No | Sin recursos protegidos |
| V5 Input Validation | Parcial | Fase 1 no tiene inputs de usuario aún |
| V6 Cryptography | No | Sin datos sensibles; localStorage es plaintext pero aceptable para historial de valoraciones |

**Amenazas específicas para esta fase:**

| Patrón | STRIDE | Mitigación |
|--------|--------|-----------|
| XSS via innerHTML en páginas | Tampering | En Fase 1, el HTML es estático — no hay innerHTML con datos de usuario |
| Cache poisoning del SW | Tampering | Solo se cachean assets propios del origen; no recursos externos |
| Scope del SW demasiado amplio | Elevation of Privilege | `sw.js` en raíz del proyecto = scope `/` correctamente limitado al origen |

---

## Sources

### Primary (HIGH confidence)
- [MDN — Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — criterios de instalabilidad, manifest requeridos
- [web.dev — What does it take to be installable?](https://web.dev/articles/install-criteria) — Chrome install criteria actuales
- [Chrome for Developers — Revisiting Chrome's installability criteria](https://developer.chrome.com/blog/update-install-criteria) — cambios en Chrome 108/112
- [MDN — Define app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons) — formatos y tamaños de iconos
- [MDN — env() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) — safe-area-inset
- [MDN — Service Worker API / Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) — lifecycle y cache
- [web.dev — The service worker lifecycle](https://web.dev/service-worker-lifecycle/) — skipWaiting, clients.claim

### Secondary (MEDIUM confidence)
- [firt.dev — iOS PWA Compatibility](https://firt.dev/notes/pwa-ios/) — limitaciones iOS Safari, standalone mode behavior
- [MDN — Hash routing glossary](https://developer.mozilla.org/en-US/docs/Glossary/Hash_routing) — comportamiento location.hash
- [CSS-Tricks — The Notch and CSS](https://css-tricks.com/the-notch-and-css/) — safe-area-inset implementación

### Tertiary (LOW confidence — verificar en implementación)
- [magicbell.com — PWA iOS Limitations 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — estado actual iOS Safari PWA
- [dev.to — PWA Icon Requirements 2025 Checklist](https://dev.to/albert_nahas_cdc8469a6ae8/pwa-icon-requirements-the-complete-2025-checklist-i3g) — resumen de tamaños

---

## Metadata

**Confidence breakdown:**
- Criterios instalabilidad Chrome: HIGH — verificado contra web.dev oficial y Chrome blog
- Hash routing + historial browser: HIGH — comportamiento nativo documentado en MDN
- Service Worker cache-first pattern: HIGH — MDN + web.dev + ARCHITECTURE.md del proyecto
- iOS Safari limitaciones: MEDIUM — firt.dev es fuente especializada pero puede desactualizarse
- safe-area-inset CSS: HIGH — MDN + verificado como estándar W3C
- Iconos PNG vs SVG: MEDIUM — recomendación conservadora (PNG) basada en compatibilidad amplia

**Research date:** 2026-04-11
**Válido hasta:** 2026-07-11 (stack estable; criterios PWA de Chrome rara vez cambian sin anuncio)
