# Phase 06: Pulido y Despliegue — Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase afina y despliega la app ya construida. NO construye nueva UI de negocio — audita lo existente, añade manejo de errores, verifica PWA score ≥ 90 y publica en GitHub Pages.

Entregables concretos: `index.html` pulido + `manifest.json` actualizado + `sw.js` actualizado + `README.md` + repositorio GitHub Pages publicado.

</domain>

<decisions>
## Implementation Decisions

### Umbral de corrección — Auditoría Lighthouse (plan 06-02)

- **D-01:** El criterio de PASS para plan 06-02 es score PWA ≥ 90 **únicamente**. Los warnings que no impiden alcanzar ese score se documentan en el SUMMARY del plan pero **no bloquean** su cierre.
- **D-02:** Se corrigen todos los issues que Lighthouse clasifica como "failing" en la categoría PWA. Los warnings de accesibilidad o performance que no afectan el score PWA se dejan anotados.

### Umbral de corrección — Auditoría visual (plan 06-01)

- **D-03:** PASS si la app es **funcional** en el breakpoint. Los defectos de 1-2px no bloquean siempre que no haya overflow real, elementos solapados o texto cortado.
- **D-04:** Criterios mínimos de PASS (definidos en UI-SPEC, secc. Viewport Audit Checklist): sin scroll horizontal, nav inferior completa y visible, precio hero ≤ 1 línea, tarjetas sin overflow de texto, tap targets ≥ 44px.

### Flujo de despliegue (plan 06-05)

- **D-05:** Deploy **manual** — push a rama `main`, GitHub Pages está configurado para servir desde `main` root. Sin GitHub Actions. Cada push a main = nueva versión publicada.
- **D-06:** El proceso de actualización futuro es: editar `index.html` → (opcionalmente) `npm run build` → `git push origin main`.

### Minificación (plan 06-04)

- **D-07:** Si `index.html` supera 400 KB: crear `package.json` con script `npm run build` que ejecuta `html-minifier-terser`. La minificación se aplica localmente antes del push; el archivo resultante reemplaza `index.html` en el commit.
- **D-08:** Si `index.html` ≤ 400 KB: no se crea `package.json` ni se aplica minificación. El plan 06-04 termina en la verificación de tamaño + primera carga < 3s.

### Repositorio GitHub (plan 06-05)

- **D-09:** Crear repo nuevo llamado **`autovaleur-ma`**. URL final: `https://{usuario}.github.io/autovaleur-ma/`.
- **D-10:** Rama de despliegue: `main` (GitHub Pages > Source > Deploy from branch > main / root).
- **D-11:** El plan 06-05 incluye los pasos de inicialización: `git remote add origin`, push inicial, y configuración de GitHub Pages en Settings.

### Corrección de paths para subpath GitHub Pages (plan 06-05)

- **D-12:** GitHub Pages sirve en subpath `/autovaleur-ma/` — los siguientes archivos deben actualizarse para incluir el prefijo:
  - `manifest.json`: `"start_url": "/autovaleur-ma/"` y `"scope": "/autovaleur-ma/"`
  - `sw.js`: las URLs en `PRECACHE_URLS` deben incluir `/autovaleur-ma/` como prefijo (ej: `/autovaleur-ma/`, `/autovaleur-ma/index.html`)
  - `index.html`: el `<link rel="manifest" href="manifest.json">` se mantiene relativo — correcto.
- **D-13:** Verificar que el Service Worker registrado en producción usa el scope correcto (`/autovaleur-ma/`) y que el precache no rompe la navegación offline.

### README.md (plan 06-05)

- **D-14:** Audiencia: **usuarios finales + curiosos**. Estructura: descripción de la app + link a app en vivo + cómo instalar como PWA (Android y iOS) + sección técnica al final (stack, arquitectura, cómo contribuir).
- **D-15:** Incluir capturas de pantalla como **placeholders** (`![Estimer](screenshots/estimer.png)`, `![Historique](screenshots/historique.png)`, `![Comparer](screenshots/comparer.png)`). El directorio `screenshots/` se crea vacío o con instrucción de cómo añadir las imágenes.
- **D-16:** El link "ver en vivo" en el README apunta a `https://{usuario}.github.io/autovaleur-ma/` — el plan usa el placeholder `{GITHUB_USER}` que el executor reemplaza con el usuario real.

### Claude's Discretion

- El orden exacto de las tareas dentro de plan 06-05 (crear repo antes o después de corregir paths)
- Si usar `git push -u origin main` o `gh repo create` para la creación del repo
- Número exacto de palabras y secciones del README (dentro del marco definido en D-14)
- Si `screenshots/README.md` o un comentario en el README explica cómo añadir capturas reales

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI-SPEC aprobada (criterios visuales y de errores)
- `.planning/phases/06-pulido-y-despliegue/06-UI-SPEC.md` — contrato visual completo: criterios de auditoría por breakpoint, paleta, tipografía, componentes de error (`.error-banner`, `.error-inline`), copywriting FR/AR de errores (secc. Copywriting Contract), checklist Viewport Audit

### Código fuente actual
- `index.html` — archivo único que contiene todo: HTML, CSS (incluyendo tokens `:root`), JS (Router, I18n, STRINGS, History, Engine, Marketplaces), manifest link, SW registration
- `manifest.json` — Web App Manifest: `start_url`, `scope`, iconos — requiere actualización de paths en D-12
- `sw.js` — Service Worker: `PRECACHE_URLS` — requiere actualización de paths en D-12

### Requisitos
- `.planning/REQUIREMENTS.md` — PWA-01 a PWA-05 (los 5 requisitos asignados a esta fase)

### Decisiones de fases anteriores relevantes
- `.planning/phases/02-internacionalizaci-n-fr-ar/02-CONTEXT.md` — patrón i18n: cómo añadir cadenas nuevas a `STRINGS.fr` y `STRINGS.ar`
- `.planning/phases/05-historique-y-comparer/05-CONTEXT.md` — patrones de módulos, atributo `hidden`, `textContent` para datos usuario

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `I18n.t(key)` + `I18n.setLang()` — sistema de traducción existente; las cadenas de error nuevas (plan 06-03) se añaden a `STRINGS.fr/ar` y se referencia con `data-i18n` o `I18n.t()`
- `.card` CSS class — base reutilizable para componentes nuevos (`.error-banner` puede heredar estructura)
- `History.getAll()`, `History.save()`, `History.remove()`, `History.clear()` — módulo completo en `index.html`
- `Engine.estimate()` — retorna `null` si parámetros inválidos; plan 06-03 captura este caso

### Established Patterns
- `hidden` nativo para mostrar/ocultar elementos — no `display:none` via CSS
- `textContent` para insertar datos de usuario — no `innerHTML`
- CSS logical properties (`padding-inline-start`, `margin-inline-end`) para RTL automático
- `try/catch` en operaciones localStorage con retorno seguro

### Integration Points
- Las cadenas nuevas de error (plan 06-03) se añaden al objeto `STRINGS` en `index.html` y en la función que invoca `I18n.t()` al cambiar idioma
- El `.error-banner` se inserta en el DOM debajo del `.app-header-wrapper` para no solapar la nav
- `manifest.json` y `sw.js` son archivos separados en la raíz del proyecto (no inline en `index.html`)

</code_context>

<specifics>
## Specific Ideas

- El banner de error de localStorage (`.error-banner`) debe tener `role="alert"` para anunciarse a lectores de pantalla (UI-SPEC secc. RTL y Accesibilidad)
- `scroll-padding-bottom: 200px` en `html` es una excepción documentada — NO modificar (compensa teclado virtual Android)
- Los pesos de fuente permitidos son únicamente 400 y 600 — `h2`, `.app-title` y `.result-price` deben cambiarse de 700/800 → 600 (UI-SPEC secc. Typography)
- Token `--font-size-hero: 2.5rem` debe añadirse a `:root` y aplicarse a `.result-price` (UI-SPEC secc. Typography)
- `--font-size-lg` (18px) debe eliminarse del CSS — los card headings usan `--font-size-base` + `font-weight: 600`

</specifics>

<deferred>
## Deferred Ideas

- GitHub Actions para CI/CD automático — si el proyecto crece y necesita pipeline, se añade en v2
- Dominio personalizado (autovaleur.ma) — fuera de scope para v1
- Script de build más completo (watch mode, hot reload) — innecesario para archivo único

</deferred>

---

*Phase: 06-pulido-y-despliegue*
*Context gathered: 2026-04-16 via discuss-phase interactive*
