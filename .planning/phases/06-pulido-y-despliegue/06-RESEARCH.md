# Phase 06: Pulido y Despliegue — Research

**Researched:** 2026-04-17
**Domain:** PWA Audit, GitHub Pages Deployment, Error Handling, Visual QA
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Criterio de PASS para plan 06-02: score PWA >= 90 unicamente. Warnings que no impiden ese score se documentan pero no bloquean el cierre.
- **D-02:** Se corrigen todos los issues que Lighthouse clasifica como "failing" en la categoria PWA. Warnings de accesibilidad/performance que no afectan el score PWA se anotan.
- **D-03:** PASS visual si la app es funcional en el breakpoint. Defectos de 1-2px no bloquean si no hay overflow real, elementos solapados o texto cortado.
- **D-04:** Criterios minimos de PASS (UI-SPEC Viewport Audit Checklist): sin scroll horizontal, nav inferior completa y visible, precio hero <= 1 linea, tarjetas sin overflow de texto, tap targets >= 44px.
- **D-05:** Deploy manual — push a rama `main`. GitHub Pages configurado para servir desde `main` root. Sin GitHub Actions.
- **D-06:** Proceso de actualizacion futuro: editar `index.html` -> (opcionalmente) `npm run build` -> `git push origin main`.
- **D-07:** Si `index.html` > 400 KB: crear `package.json` con script `npm run build` usando `html-minifier-terser`. La minificacion se aplica localmente antes del push.
- **D-08:** Si `index.html` <= 400 KB: no se crea `package.json` ni se aplica minificacion.
- **D-09:** Repo nuevo llamado `autovaleur-ma`. URL final: `https://{usuario}.github.io/autovaleur-ma/`.
- **D-10:** Rama de despliegue: `main` (GitHub Pages > Source > Deploy from branch > main / root).
- **D-11:** Plan 06-05 incluye pasos de inicializacion: `git remote add origin`, push inicial, configuracion de GitHub Pages en Settings.
- **D-12:** Actualizar paths para subpath `/autovaleur-ma/`: `manifest.json` (`start_url`, `scope`), `sw.js` (`PRECACHE_URLS`). El `<link rel="manifest">` permanece relativo.
- **D-13:** Verificar que el SW registrado en produccion usa el scope correcto y que el precache no rompe la navegacion offline.
- **D-14:** README audiencia: usuarios finales + curiosos. Estructura: descripcion + link en vivo + como instalar como PWA (Android/iOS) + seccion tecnica al final.
- **D-15:** Capturas de pantalla como placeholders (`screenshots/estimer.png`, `screenshots/historique.png`, `screenshots/comparer.png`).
- **D-16:** Link "ver en vivo" usa el placeholder `{GITHUB_USER}` que el executor reemplaza con el usuario real.

### Claude's Discretion

- El orden exacto de las tareas dentro de plan 06-05 (crear repo antes o despues de corregir paths)
- Si usar `git push -u origin main` o `gh repo create` para la creacion del repo
- Numero exacto de palabras y secciones del README (dentro del marco definido en D-14)
- Si `screenshots/README.md` o un comentario en el README explica como anadir capturas reales

### Deferred Ideas (OUT OF SCOPE)

- GitHub Actions para CI/CD automatico
- Dominio personalizado (autovaleur.ma)
- Script de build mas completo (watch mode, hot reload)

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PWA-01 | La app existe como archivos estaticos desplegables en GitHub Pages sin config de servidor | Plan 06-04 crea el repo y configura Pages; la arquitectura single-file ya lo cumple |
| PWA-02 | La app funciona completamente offline tras la primera carga (Service Worker cache-first) | Plan 06-03 audita y corrige el SW; D-12 actualiza PRECACHE_URLS para subpath |
| PWA-03 | La app es instalable en pantalla de inicio de Android (Web App Manifest completo) | Plan 06-03 verifica manifest; D-12 corrige `start_url` y `scope` para subpath |
| PWA-04 | La app muestra instrucciones de instalacion manual para iOS Safari | El banner iOS ya existe (`.ios-install-banner`); plan 06-01 audita que no solape la nav en 375px |
| PWA-05 | La interfaz es responsive y funciona correctamente en moviles Android (pantallas 360px+) | Plan 06-01 audita 360px/390px Chrome Android y 375px/390px Safari iOS |

</phase_requirements>

---

## Summary

La Fase 06 es una fase de cierre y auditoria — no construye nueva UI de negocio, sino que pule y despliega la app ya construida en fases anteriores. Los entregables son: `index.html` corregido (tipografia auditada, errores manejados), `manifest.json` y `sw.js` actualizados con los paths de GitHub Pages, `README.md` orientado a usuarios finales, y el repositorio `autovaleur-ma` publicado en GitHub Pages.

El estado actual del codigo esta bien caracterizado: `index.html` mide 119 KB (muy por debajo del umbral de 400 KB — **no se necesita minificacion ni `package.json`**). El `manifest.json` usa paths relativos (`start_url: "./"`, `scope: "./"`) que deben convertirse a paths absolutos de subpath para GitHub Pages. El `sw.js` usa paths relativos (`./`, `./index.html`) que tambien requieren el prefijo `/autovaleur-ma/`. Hay cuatro ocurrencias de `font-weight: 700` y una de `font-weight: 800` que la UI-SPEC ordena cambiar a 600. No existe ningun sistema de tests previo — la validacion es manual via DevTools y Lighthouse.

**Primary recommendation:** Ejecutar los planes en orden secuencial (06-01 -> 06-02 -> 06-03 -> 06-04). Los planes 06-03 y 06-04 dependen del estado final del HTML corregido por 06-01/06-02.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Auditoria visual (breakpoints) | Browser / Client | — | Se verifica en DevTools emulando dispositivos; no hay logica de servidor |
| Lighthouse PWA score | Browser / Client | CDN / Static | Lighthouse evalua el SW, manifest y HTTPS — todo vive en el cliente y en el servidor estatico de GitHub Pages |
| Manejo de errores localStorage | Browser / Client | — | `localStorage` es una API de browser; los errores se capturan y muestran en el cliente |
| Service Worker (cache-first) | Browser / Client | CDN / Static | El SW se registra en el browser; los assets cacheados vienen del CDN de GitHub Pages |
| Correccion de paths para subpath | CDN / Static | Browser / Client | GitHub Pages sirve desde `/autovaleur-ma/`; los paths en `manifest.json` y `sw.js` deben coincidir con el origen del CDN |
| Minificacion (condicional) | Build / Local | — | `html-minifier-terser` se ejecuta localmente antes del push; no requiere servidor |
| GitHub Pages deployment | CDN / Static | — | GitHub Pages es el servidor estatico; la configuracion es en Settings del repo |
| README.md | Documentacion | — | Archivo estatico en raiz del repo |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html-minifier-terser | 7.2.0 | Minificacion HTML+CSS+JS inline | Estandar de facto para minificar HTML con JS/CSS inline; mantenido activamente [VERIFIED: npm registry] |
| GitHub Pages | N/A | Hosting estatico gratuito | Zero-cost, zero-server; sirve desde rama `main` sin configuracion de servidor [ASSUMED] |

**Nota D-08:** `index.html` mide actualmente **119 KB** (verificado: `wc -c` -> 119955 bytes). El umbral es 400 KB. La minificacion y el `package.json` NO se crean en esta fase. Plan 06-03 termina en la verificacion de tamano + primera carga < 3s. [VERIFIED: wc -c en codebase]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lighthouse CLI | incluido en Chrome DevTools | Auditoria PWA, performance, accesibilidad | Plan 06-02 — score PWA >= 90 |
| Chrome DevTools Device Emulation | N/A (browser tool) | Simular 360px/375px/390px | Plan 06-01 auditoria visual |
| Safari Responsive Design Mode | N/A (browser tool) | Simular iOS 375px/390px | Plan 06-01 iOS audit |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html-minifier-terser | terser (solo JS) | terser no maneja HTML; html-minifier-terser procesa el archivo completo |
| GitHub Pages manual push | GitHub Actions | Deferred (D-05) — innecesario para archivo unico |

**Installation (solo si se necesitara en el futuro):**
```bash
npm install html-minifier-terser --save-dev
```
(No se instala en esta fase — D-08 aplica.)

---

## Architecture Patterns

### System Architecture Diagram

```
Developer workstation
        |
        | git push origin main
        v
GitHub remote (repo: autovaleur-ma)
        |
        | GitHub Pages auto-serve (branch: main, root: /)
        v
https://{usuario}.github.io/autovaleur-ma/
        |
        +---> index.html  (HTML + CSS + JS inline — 119 KB)
        +---> manifest.json  (start_url: /autovaleur-ma/, scope: /autovaleur-ma/)
        +---> sw.js  (PRECACHE_URLS con prefijo /autovaleur-ma/)
        +---> icon-192.png
        +---> icon-512.png
        +---> apple-touch-icon.png
        +---> screenshots/  (placeholders para README)
        |
        v
Browser (Android Chrome 360px / Safari iOS 375px)
        |
        +---> SW install event -> precachea todos los assets
        +---> Subsequent loads -> cache-first (offline-first)
        +---> manifest.json -> Add to Home Screen (Android)
        +---> .ios-install-banner -> instrucciones manuales (iOS)
```

### Recommended Project Structure

```
autovaleur-ma/          (raiz del repo)
├── index.html          (app completa — HTML + CSS + JS inline)
├── manifest.json       (Web App Manifest — paths actualizados)
├── sw.js               (Service Worker — paths actualizados)
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── screenshots/        (placeholders para README)
│   ├── estimer.png     (placeholder)
│   ├── historique.png  (placeholder)
│   └── comparer.png    (placeholder)
└── README.md
```

### Pattern 1: Correccion de paths para subpath GitHub Pages

**What:** GitHub Pages sirve en `https://user.github.io/autovaleur-ma/` — el Service Worker debe usar paths absolutos para que su scope sea correcto.

**When to use:** Siempre que una PWA se despliegue en un subpath (no en el root del dominio).

**Example:**
```json
// manifest.json — ANTES (relativo, valido en localhost)
{ "start_url": "./", "scope": "./" }

// manifest.json — DESPUES (absoluto, correcto en subpath)
{ "start_url": "/autovaleur-ma/", "scope": "/autovaleur-ma/" }
```

```javascript
// sw.js — ANTES
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// sw.js — DESPUES
const PRECACHE_URLS = [
  '/autovaleur-ma/',
  '/autovaleur-ma/index.html',
  '/autovaleur-ma/manifest.json',
  '/autovaleur-ma/icon-192.png',
  '/autovaleur-ma/icon-512.png',
  '/autovaleur-ma/apple-touch-icon.png'
];
```
[ASSUMED: patron estandar de GitHub Pages; no hay doc oficial Context7 para este flujo]

### Pattern 2: Error Banner de localStorage

**What:** Capturar `SecurityError`/`QuotaExceededError` en `localStorage.setItem()` y mostrar un banner no-invasivo con `role="alert"`.

**When to use:** Cada vez que se llama a `localStorage.setItem()` en los modulos `History`, `I18n`.

**Example:**
```javascript
// En History.save() — ANTES
try {
  localStorage.setItem(History._KEY, JSON.stringify(all));
} catch (e) {
  console.warn('AutoValeur — no se pudo guardar en historial:', e.message);
}

// En History.save() — DESPUES
try {
  localStorage.setItem(History._KEY, JSON.stringify(all));
} catch (e) {
  ErrorUI.showStorageBanner(); // nueva funcion plan 06-02
}
```

```html
<!-- Banner HTML (insertar en index.html debajo del .app-header-wrapper) -->
<div id="error-storage-banner" class="error-banner" role="alert" hidden>
  <div class="error-banner-content">
    <strong data-i18n="error.storage.title"></strong>
    <p data-i18n="error.storage.body"></p>
  </div>
  <button class="error-banner-close" data-i18n-aria="error.storage.close"
          onclick="ErrorUI.closeBanner()">x</button>
</div>
```

### Pattern 3: Correccion tipografica (UI-SPEC)

**What:** La UI-SPEC ordena cambiar pesos prohibidos (700, 800) a 600 y anadir el token `--font-size-hero`.

**Cambios concretos identificados en el codigo actual:**

| Linea | Selector | Cambio |
|-------|----------|--------|
| 155 | `.app-title` | `font-weight: 700` -> `font-weight: 600` |
| 221 | `.page h2` | `font-weight: 700` -> `font-weight: 600` |
| 649 | `.result-price` | `font-weight: 800` -> `font-weight: 600` |
| 686 | `.breakdown-table tr:last-child td` | `font-weight: 700` -> `font-weight: 600` |
| 71 | `:root` | Anadir `--font-size-hero: 2.5rem` |
| 648 | `.result-price` | `font-size: 2.5rem` -> `font-size: var(--font-size-hero)` |
| 71 | `:root` | Eliminar `--font-size-lg: 1.125rem` |
| 154 | `.app-title` | `font-size: var(--font-size-lg)` -> `font-size: var(--font-size-base)` |

[VERIFIED: grep en index.html]

### Anti-Patterns to Avoid

- **Paths relativos en `start_url`/`scope` del manifest para subpath:** `"./"` funciona en localhost pero no en GitHub Pages subpath — el SW se registra con scope incorrecto y las peticiones de la app real no son interceptadas.
- **PRECACHE_URLS con paths relativos en produccion:** El SW en `/autovaleur-ma/sw.js` tiene origen `/autovaleur-ma/` — los paths `./` se resuelven como `/autovaleur-ma/`, pero `caches.match(event.request)` compara la URL completa de la request contra las entradas del cache. Con paths relativos en precache los requests de GitHub Pages (`/autovaleur-ma/index.html`) no coinciden con las entradas cacheadas (`./index.html`). [ASSUMED: conocimiento de specs de SW]
- **Usar `innerHTML` para mensajes de error:** La convencion del proyecto es `textContent` para datos de usuario. Las cadenas del sistema de errores van a traves de `I18n.t()` y el atributo `data-i18n`.
- **Bloquear la UI cuando localStorage falla:** El banner debe aparecer sin impedir que el resultado de la estimacion se muestre al usuario.
- **Eliminar `scroll-padding-bottom: 200px`:** Excepcion documentada en UI-SPEC — no modificar.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Minificacion HTML+JS+CSS inline | Parser propio, sed/regex | html-minifier-terser 7.2.0 | Maneja scripts inline, preserva estructura, evita rotura de template literals |
| Auditoria PWA | Script manual | Chrome Lighthouse (DevTools > Audits) | Criterios oficiales, categoria PWA estandarizada, score reproducible |
| Simulacion de dispositivos | Test en dispositivo fisico para cada iteracion | Chrome DevTools Device Emulation + Safari Responsive Design Mode | Iteracion rapida; los criterios de la UI-SPEC estan definidos para estas herramientas |

**Key insight:** Esta fase es fundamentalmente de auditoria y edicion de archivos existentes. Casi todos los problemas ya tienen solucion conocida y documentada en la UI-SPEC — no inventar nada nuevo.

---

## Common Pitfalls

### Pitfall 1: SW scope incorrecto tras cambio de paths
**What goes wrong:** El Service Worker se registra pero su scope no cubre la URL de produccion. Las requests a `https://user.github.io/autovaleur-ma/` no son interceptadas. La app no funciona offline.
**Why it happens:** El manifest y el SW fueron disenados para localhost root (`./`). En GitHub Pages, el origen del archivo `sw.js` determina el scope maximo — si `sw.js` vive en `/autovaleur-ma/sw.js`, el scope maximo es `/autovaleur-ma/`.
**How to avoid:** Usar paths absolutos en `PRECACHE_URLS` con el prefijo `/autovaleur-ma/`. Verificar en Chrome DevTools > Application > Service Workers que el scope sea `https://user.github.io/autovaleur-ma/`.
**Warning signs:** En DevTools > Application > Service Workers, el campo "Scope" muestra `https://user.github.io/` en lugar de `https://user.github.io/autovaleur-ma/`.

### Pitfall 2: Cache stale tras correccion de paths
**What goes wrong:** El navegador tiene un SW antiguo cacheado con los paths viejos. Despues del push, el nuevo SW no se activa porque el usuario ya tiene una version en cache.
**Why it happens:** `skipWaiting()` esta implementado (linea 31 de sw.js), por lo que no es un problema de activacion — pero si el desarrollador prueba localmente antes de hacer el push, puede haber conflicto de cache.
**How to avoid:** Incrementar `CACHE_NAME` de `'autovaleur-v1'` a `'autovaleur-v2'` al actualizar los paths. Esto fuerza limpieza de cache old en el evento `activate`.
**Warning signs:** Lighthouse muestra el SW activo pero offline sigue sin funcionar; DevTools muestra dos SWs ("waiting" y "activated").

### Pitfall 3: Lighthouse Offline check falla por paths relativos
**What goes wrong:** Lighthouse PWA falla el check "Responds with a 200 when offline" porque el SW precachea `./index.html` pero la request es `/autovaleur-ma/index.html`.
**Why it happens:** La URL absoluta de la request no coincide con la entrada relativa del precache.
**How to avoid:** Asegurarse de que `PRECACHE_URLS` usa paths absolutos antes de ejecutar Lighthouse en produccion.

### Pitfall 4: `.error-banner` solapa el contenido de la pagina
**What goes wrong:** El banner de error se inserta en el DOM y el contenido de la pagina queda parcialmente tapado.
**Why it happens:** El banner tiene `position: fixed` o no tiene espacio reservado.
**How to avoid:** El banner debe ser `position: static` (flujo normal), insertado despues del `.app-header-wrapper` y antes del primer `.page`. El scroll del contenido compensa naturalmente.

### Pitfall 5: `--font-size-lg` eliminado pero todavia referenciado
**What goes wrong:** Se elimina el token `--font-size-lg` del `:root` pero quedan referencias a `var(--font-size-lg)` en el HTML.
**Why it happens:** Hay referencias inline en atributos `style=` en el HTML (lineas 975, 998, 1007) ademas de las declaraciones CSS.
**How to avoid:** Hacer busqueda global de `--font-size-lg` en `index.html` antes de eliminarlo. Las lineas HTML inline tambien deben actualizarse a `var(--font-size-base)`.
**Warning signs (verificado en codigo actual):**
  - Linea 154: `.app-title { font-size: var(--font-size-lg) }` (CSS)
  - Linea 421: uso CSS adicional de `--font-size-lg`
  - Linea 448: uso CSS adicional de `--font-size-lg`
  - Linea 773: uso CSS adicional de `--font-size-lg`
  - Linea 975: `style="font-size: var(--font-size-lg)..."` (HTML inline)
  - Linea 998: `style="font-size: var(--font-size-lg)..."` (HTML inline)
  - Linea 1007: `style="font-size: var(--font-size-lg)..."` (HTML inline)
  [VERIFIED: grep en index.html]

### Pitfall 6: README con usuario hardcodeado
**What goes wrong:** El README se escribe con un username especifico que puede diferir del usuario que hace el deploy.
**How to avoid:** Usar el placeholder `{GITHUB_USER}` en todas las URLs del README (D-16). El ejecutor lo reemplaza con el nombre real antes del commit.

---

## Code Examples

### Error Banner CSS
```css
/* Insertar en index.html despues de la seccion .app-header-wrapper */
.error-banner {
  background: var(--warning);
  color: var(--text);
  padding: var(--sp-sm) var(--sp-md);
  display: flex;
  align-items: flex-start;
  gap: var(--sp-sm);
  border-bottom: 1px solid var(--border);
  font-size: var(--font-size-sm);
}

.error-banner-content {
  flex: 1;
}

.error-banner-close {
  background: none;
  border: none;
  font-size: var(--font-size-base);
  cursor: pointer;
  padding: var(--sp-xs);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-family: inherit;
}
```

### Error Inline CSS
```css
.error-inline {
  color: var(--danger);
  font-size: var(--font-size-sm);
  margin-block-start: var(--sp-sm);
}
```

### Cadenas i18n nuevas a anadir a STRINGS (plan 06-02)
```javascript
// En STRINGS.fr — anadir al objeto fr:
'error.storage.title':   'Stockage non disponible',
'error.storage.body':    'Les estimations ne peuvent pas etre sauvegardees. Verifiez les parametres de confidentialite de votre navigateur.',
'error.storage.close':   'Fermer',
'error.history.corrupt': 'Les donnees du journal ont ete reinitialisees.',
'error.form.no_result':  'Impossible d\'estimer ce vehicule. Verifiez les champs du formulaire.',

// En STRINGS.ar — anadir al objeto ar:
'error.storage.title':   'التخزين غير متاح',
'error.storage.body':    'لا يمكن حفظ التقديرات. تحقق من إعدادات الخصوصية في متصفحك.',
'error.storage.close':   'إغلاق',
'error.history.corrupt': 'تمت إعادة تعيين بيانات السجل.',
'error.form.no_result':  'لا يمكن تقدير هذه السيارة. تحقق من حقول النموذج.',
```
[CITED: 06-UI-SPEC.md Copywriting Contract]

### Deploy manual — secuencia de comandos (plan 06-04)
```bash
# 1. Inicializar git remote (asumiendo repo ya creado en GitHub)
git remote add origin https://github.com/{GITHUB_USER}/autovaleur-ma.git

# 2. Push inicial
git push -u origin main

# 3. Verificar: ir a repo > Settings > Pages > Source = "Deploy from branch"
#    Branch: main, Folder: / (root)
#    Guardar — GitHub Pages tardara ~1 min en publicar

# 4. URL de la app:
#    https://{GITHUB_USER}.github.io/autovaleur-ma/
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `manifest.json` con `start_url: "./"` (relativo) | `start_url: "/autovaleur-ma/"` (absoluto) | Esta fase | Necesario para que Lighthouse y el SW funcionen en subpath |
| Paths relativos en `PRECACHE_URLS` | Paths absolutos con prefijo de subpath | Esta fase | Necesario para que el cache-match funcione en produccion |
| `font-weight: 700/800` en varios selectores | `font-weight: 600` en todos | Esta fase (plan 06-01) | Cumplimiento del contrato tipografico de UI-SPEC |
| `font-size: 2.5rem` hardcoded en `.result-price` | `font-size: var(--font-size-hero)` | Esta fase (plan 06-01) | Token anadido: `--font-size-hero: 2.5rem` |
| `--font-size-lg` en uso (18px) | Eliminado; reemplazado por `--font-size-base` + `font-weight: 600` | Esta fase (plan 06-01) | Reduce la escala tipografica a 4 tamanos definidos |
| Errores localStorage silenciosos (`console.warn`) | `.error-banner` visible con `role="alert"` | Esta fase (plan 06-02) | PWA-05: la app no falla silenciosamente en moviles |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Paths relativos en `PRECACHE_URLS` causan fallo de cache-match en GitHub Pages subpath | Common Pitfalls, Pattern 1 | Bajo — la correccion es necesaria de todos modos por el scope del SW; el riesgo es que la correccion sea innecesaria (no dana) |
| A2 | GitHub Pages tarda ~1 min en publicar tras el push inicial | Code Examples (deploy) | Bajo — el tiempo real puede variar; el ejecutor debe verificar en el navegador |
| A3 | `gh` CLI no esta disponible en el entorno del desarrollador | Environment Availability | Medio — si el ejecutor tiene `gh`, puede usar `gh repo create` en lugar de crear el repo manualmente en la UI. La secuencia de comandos usa `git remote add` como fallback universal |

**Ninguna de las decisiones tecnicas centrales (correccion de paths, tipografia, errores) depende de asunciones de alto riesgo.** Todas estan verificadas directamente en el codigo fuente.

---

## Open Questions (RESOLVED)

1. **Username de GitHub** — RESOLVED: El plan 06-04 usa el placeholder `{GITHUB_USER}` en README.md y la Task 2 (checkpoint humano) incluye un paso explicito donde el usuario reemplaza el placeholder con su username real antes del push. No se necesita resolver en el codigo — es una accion humana documentada.

2. **`font-size-lg` en referencias adicionales (lineas 421, 448, 773)** — RESOLVED: El plan 06-01 Task 1 incluye una busqueda global exhaustiva (`grep`) de todas las referencias a `--font-size-lg` en index.html. Las 7+ referencias identificadas (lineas 154, 421, 448, 773, 975, 998, 1007) estan documentadas en la accion de la tarea con instruccion explicita de reemplazar cada una por `--font-size-base`. El executor debe hacer grep adicional para detectar cualquier referencia no listada.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | html-minifier-terser (si se necesitara) | Si | v24.14.1 | — |
| npm | html-minifier-terser (si se necesitara) | Si | 11.11.0 | — |
| html-minifier-terser | Plan 06-03 (solo si > 400 KB) | No instalado (no hay package.json) | 7.2.0 en npm | No aplica — D-08 descarta la minificacion |
| git | Plan 06-04 deploy | Si | (repo activo) | — |
| gh CLI | Plan 06-04 (alternativa) | No encontrado | — | Usar `git remote add` + UI de GitHub |
| GitHub Pages | Plan 06-04 | Si (GitHub servicio) | — | — |
| Chrome DevTools | Plan 06-01 audit | Si (cualquier Chrome) | — | — |
| Safari DevTools | Plan 06-01 iOS audit | No verificado en maquina [ASSUMED] | — | BrowserStack / dispositivo fisico |

**Missing dependencies con fallback:**
- `gh` CLI: no disponible — el plan 06-04 usa `git remote add origin` + configuracion manual de GitHub Pages en la UI web. No bloquea.
- Safari DevTools: no verificado — si no hay Safari en la maquina, el ejecutor puede usar un iPhone fisico o BrowserStack para el audit iOS.

**Missing dependencies sin fallback:**
- Ninguno — todas las dependencias bloqueantes (git, Node.js) estan disponibles.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Ninguno — proyecto vanilla HTML/JS sin infraestructura de tests |
| Config file | Ninguno — no existe ni `package.json` ni `jest.config.*` ni `vitest.config.*` |
| Quick run command | Manual: abrir Chrome DevTools > Lighthouse > PWA |
| Full suite command | Manual: Lighthouse + DevTools emulation en los 4 breakpoints definidos |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | App desplegada y accesible en GitHub Pages URL | Smoke manual | `curl -I https://{user}.github.io/autovaleur-ma/` | No aplica (URL externa) |
| PWA-02 | App funciona offline tras primera carga | Manual + Lighthouse | Lighthouse > PWA > "Responds with a 200 when offline" | No aplica |
| PWA-03 | App instalable en Android (manifest valido) | Manual + Lighthouse | Lighthouse > PWA > "Installable" checks | No aplica |
| PWA-04 | Banner iOS visible y no solapa nav en 375px | Manual visual | DevTools Device Emulation (iPhone SE 375px) | No aplica |
| PWA-05 | Responsive en 360px+ sin scroll horizontal | Manual visual | DevTools > 360px: `document.body.scrollWidth === 360` | No aplica |

### Sampling Rate

- **Por tarea:** Verificacion visual inmediata en DevTools tras cada cambio
- **Por plan completado:** Lighthouse PWA run completo (plan 06-02), o audit visual en los 4 breakpoints (plan 06-01)
- **Phase gate:** Lighthouse PWA >= 90 + app live en GitHub Pages antes de `/gsd-verify-work`

### Wave 0 Gaps

No hay infraestructura de tests que crear — el proyecto es vanilla HTML/JS y las verificaciones son manuales. No se requiere Wave 0 de setup de tests.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No aplica — app sin autenticacion |
| V3 Session Management | No | No aplica — sin sesiones de servidor |
| V4 Access Control | No | No aplica — app publica, sin roles |
| V5 Input Validation | Si (limitado) | `Engine.estimate()` retorna `null` para inputs invalidos; ya implementado |
| V6 Cryptography | No | No aplica — sin datos sensibles ni cifrado |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via innerHTML con datos de usuario | Spoofing/Tampering | Uso de `textContent` (patron establecido); los mensajes de error usan `data-i18n` + `I18n.t()` — nunca `innerHTML` con input del usuario |
| localStorage poisoning (datos corrompidos) | Tampering | `try/catch` en `History.getAll()` con retorno `[]` seguro (ya implementado); plan 06-02 anade el mensaje visible |
| localStorage bloqueado (modo privado iOS) | Availability | Plan 06-02 captura `SecurityError`/`QuotaExceededError` y muestra `.error-banner` en lugar de fallar silenciosamente |

---

## Sources

### Primary (HIGH confidence)

- Codigo fuente `index.html` (grep verificado) — analisis de `font-weight`, `font-size-lg`, estructura de `STRINGS`, modulo `History`, tamano del archivo
- Codigo fuente `manifest.json` — estado actual de `start_url` y `scope`
- Codigo fuente `sw.js` — estado actual de `PRECACHE_URLS` y `CACHE_NAME`
- `06-CONTEXT.md` — todas las decisiones D-01 a D-16
- `06-UI-SPEC.md` — contrato visual completo, copywriting de errores
- npm registry (`npm view html-minifier-terser version`) — version 7.2.0 verificada

### Secondary (MEDIUM confidence)

- `REQUIREMENTS.md` — PWA-01 a PWA-05
- `STATE.md` + `ROADMAP.md` — estado del proyecto

### Tertiary (LOW confidence)

- Comportamiento de paths absolutos vs. relativos en Service Workers en subpath GitHub Pages [ASSUMED]
- Tiempo de propagacion de GitHub Pages tras push [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Estado actual del codigo: HIGH — verificado directamente con grep y wc
- Correcciones de tipografia: HIGH — lineas exactas identificadas
- Correccion de paths SW/manifest: MEDIUM — patron ampliamente conocido, pero no verificado contra docs oficiales de GitHub Pages en esta sesion
- Validacion Lighthouse: HIGH — criterios definidos en UI-SPEC y CONTEXT.md
- Deploy GitHub Pages manual: MEDIUM — proceso estandar, pero el username es desconocido

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stack estable; GitHub Pages no cambia frecuentemente)
