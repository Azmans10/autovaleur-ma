---
phase: 6
slug: pulido-y-despliegue
status: draft
shadcn_initialized: false
preset: none
created: 2026-04-16
---

# Phase 06 — UI Design Contract: Pulido y Despliegue

> Contrato visual e interactivo para la fase de auditoría visual, corrección de errores y despliegue.
> Esta fase NO construye nueva UI — audita y refuerza la existente en `index.html`.
> Generado por gsd-ui-researcher.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — PWA vanilla JS, archivo único `index.html` |
| Preset | not applicable |
| Component library | none — CSS custom properties nativas (`index.html` líneas 36-81) |
| Icon library | SVG inline (cero peticiones de red, offline-first — decisión Phase 01) |
| Font LTR | `system-ui, -apple-system, 'Segoe UI', sans-serif` |
| Font RTL | `'Tahoma', 'Arial', system-ui, sans-serif` (AR — `[dir="rtl"]` en línea 86) |

> Fuente: `index.html` `:root` lines 36-81. No se introducen nuevas dependencias externas en esta fase.

---

## Spacing Scale

Tokens ya declarados en `index.html` `:root` (líneas 51-56). Esta fase los **audita** — verifica que todos los componentes los consumen sin valores px literales sueltos.

| Token CSS | Value | Uso que se audita en esta fase |
|-----------|-------|-------------------------------|
| `--sp-xs` | 4px | Gaps internos de badges; padding del botón cierre del banner iOS |
| `--sp-sm` | 8px | Espaciado entre meta-datos de tarjetas; gap entre ítems de nav |
| `--sp-md` | 16px | Padding de página `.page`; separación de `.form-group` |
| `--sp-lg` | 24px | `margin-bottom` en encabezados de página; separación entre secciones de resultado |
| `--sp-xl` | 32px | Margen superior de `.result-section`; margen de `.compare-grid` |
| `--sp-2xl` | 48px | Padding vertical de `.empty-state` |

**Criterio de auditoría (plan 06-01):** Ningún elemento visible debe usar valores `px` literales en propiedades de `margin`, `padding`, o `gap` donde exista un token equivalente.

Excepción documentada: `scroll-padding-bottom: 200px` en `html` (línea 104) — valor deliberadamente fuera de escala para compensar el teclado virtual en Android; no se modifica.

---

## Typography

Tokens ya declarados en `index.html` `:root` (líneas 69-73). Esta fase los audita y los asigna a roles concretos.

| Role | Token CSS | Size | Weight | Line Height | Uso concreto |
|------|-----------|------|--------|-------------|-------------|
| Body | `--font-size-base` | 16px | 400 (regular) | 1.5 | Texto de párrafos, opciones de select, copy de errores en plan 06-03 |
| Label / Meta | `--font-size-sm` | 14px | 400 (regular) | 1.4 | Labels de formulario, fecha relativa, texto `--text-muted`; mensajes de error inline |
| Card heading | `--font-size-lg` | 18px | 600 (semibold) | 1.2 | Títulos de tarjeta; headings de estados vacíos |
| Price / Display | `--font-size-2xl` | 24px | 600 (semibold) | 1.1 | Precios en tarjetas de historial y Comparer |
| Price hero | `2.5rem` (40px) | 800 (extrabold) | 1.1 | `.result-price` — precio principal en página Estimer (sin token propio; auditar que no se regrese) |

Pesos en uso: 400 (regular), 600 (semibold), 700 (bold en `h2`/`.app-title`), 800 (extrabold en `.result-price`). No se añaden pesos adicionales en esta fase.

**Criterio de auditoría:** Verificar que en Chrome Android 360px y Safari iOS 375px ningún texto queda cortado (overflow) ni superpuesto a la nav inferior fija.

---

## Color

Paleta ya definida en `index.html` `:root` (líneas 38-47). Esta fase audita el uso correcto de cada token.

| Role | Token CSS | Value hex | Uso específico en esta fase |
|------|-----------|-----------|----------------------------|
| Dominant (60%) | `--surface` / `--surface-2` | #ffffff / #f8f9fa | Fondo de página y fondo de header/nav; fondo de mensajes de error nuevos |
| Secondary (30%) | `--surface-3` / `--border` | #f1f3f4 / #e0e0e0 | Fondo de tarjetas `.card`, bordes, selects deshabilitados |
| Accent (10%) | `--accent` | #34a853 | Reservado exclusivamente para: (1) borde de tarjeta ganadora `.compare-winner`, (2) badge "Meilleur rapport" |
| Destructive | `--danger` | #ea4335 | Reservado para: (1) `.btn-danger` (confirmación borrado), (2) `.field-error` texto de error de formulario, (3) nuevo estado de error `error.storage` en plan 06-03 |
| Warning | `--warning` | #fbbc04 | Reservado para: (1) banner de advertencia de `localStorage` bloqueado (plan 06-03) |
| Primary | `--primary` | #1a73e8 | Botones primarios, precios, indicador de nav activo, banner iOS |
| Primary dark | `--primary-dark` | #1558b0 | Hover de botones primarios únicamente |

**Accent NO se usa en:** botones primarios, links de marketplace, indicadores de nav activa.

**Criterio de auditoría (plan 06-01):** En Chrome Android 360px, el contraste de `--text-muted` (#5f6368) sobre `--surface` (#ffffff) debe ser ≥ 4.5:1. Valor calculado: ~5.9:1 — pasa WCAG AA.

---

## Component Inventory

Componentes existentes que se **auditan** en plan 06-01 (no rediseñar; solo corregir si hay defecto visual):

| Componente | Clase CSS | Breakpoints a verificar | Riesgo visual conocido |
|------------|-----------|------------------------|----------------------|
| Nav inferior | `.bottom-nav` | 360px, 375px, 390px | `safe-area-inset-bottom` en iPhone Dynamic Island |
| Header sticky | `.app-header-wrapper` | todos | Sombra vs. contenido al hacer scroll |
| Pill FR/AR | `.lang-toggle` | todos | Tap target: verificar ≥ 44px |
| Formulario cascada | `.form-group select` | 360px | Flecha custom SVG desplazada en select RTL |
| Tarjeta historial | `.history-card` | 360px | Precio truncado si marca+modelo+año es largo |
| Banner iOS | `.ios-install-banner` | 375px Safari | Solapamiento con nav inferior en iPhone SE |
| Comparer grid | `.compare-grid` | 360px | Flex-wrap: confirmar que cada `.compare-card` tiene `min-width: 140px` |
| Resultado precio | `.result-price` (2.5rem) | 360px | Overflow en precios > 6 dígitos (ej: 1.000.000 DH) |

Componentes **nuevos a crear** en plan 06-03 (mensajes de error):

| Componente | Clase CSS nueva | Descripción |
|------------|----------------|-------------|
| Banner error storage | `.error-banner` | Banner no-invasivo que aparece debajo del header cuando localStorage está bloqueado; fondo `--warning` (#fbbc04), texto `--text` (#202124), icono SVG inline |
| Mensaje error inline | `.error-inline` | Párrafo con `color: var(--danger)` y `font-size: var(--font-size-sm)`; usado para historial corrompido o formulario sin datos |

---

## Interaction Contracts

### Plan 06-01: Auditoría visual — criterios de "PASS" por breakpoint

| Breakpoint | Dispositivo objetivo | Criterio de PASS |
|------------|---------------------|-----------------|
| 360px ancho, Chrome Android | Galaxy A series (mercado MA) | Sin scroll horizontal; nav inferior no tapa el último elemento del formulario; precio hero ≤ 1 línea |
| 375px ancho, Safari iOS | iPhone SE / iPhone 12 mini | Banner iOS visible y no solapa nav; safe-area-inset-bottom aplicado correctamente |
| 390px ancho, Chrome Android | Pixel 7, Samsung S23 | Layout idéntico a 360px escalado; no aparecen elementos flotantes fuera de su contenedor |
| 390px ancho, Safari iOS | iPhone 14/15 | Dynamic Island no solapa header sticky |

### Plan 06-02: Lighthouse PWA — criterios de "PASS"

| Check | Criterio |
|-------|---------|
| Score PWA | ≥ 90 sin advertencias en Lighthouse 12+ |
| Manifest | `name`, `short_name`, `start_url`, `display: standalone`, `icons` con 192px y 512px presentes |
| Service Worker | Registrado, activo, responde en offline |
| HTTPS | Requerido por GitHub Pages (automático) |
| theme-color | `#1a73e8` ya declarado en `<meta name="theme-color">` |

### Plan 06-03: Estados de error — comportamiento interactivo

**Error 1: localStorage bloqueado (escritura)**

- Trigger: `localStorage.setItem()` lanza `SecurityError` o `QuotaExceededError`
- Comportamiento actual: `console.warn` silencioso (Phases 1-5)
- Comportamiento nuevo (plan 06-03): mostrar `.error-banner` al tope del contenido de la página activa, por debajo del header
- Persistencia: el banner permanece hasta que el usuario lo cierra (botón ×)
- No bloquear la UI — la estimación se muestra aunque no se guarde

**Error 2: historial corrompido**

- Trigger: `JSON.parse()` lanza error en `History.getAll()`
- Comportamiento actual: `catch` retorna `[]` silenciosamente
- Comportamiento nuevo: junto al empty state de Historique, mostrar mensaje `.error-inline` explicando que los datos no pudieron cargarse

**Error 3: formulario sin datos (submit sin marca/modelo/año)**

- Trigger: usuario fuerza submit con campos en blanco (aunque el botón está `disabled`, el atributo puede ser eliminado desde DevTools)
- Comportamiento actual: validación existe (`Engine.estimate()` retorna `null`)
- Comportamiento nuevo: si `Engine.estimate()` retorna `null`, mostrar `.error-inline` debajo del botón "Estimer" con el copy definido en el Copywriting Contract

### Plan 06-04: Optimización de carga

- Criterio de PASS: primera carga < 3 segundos en 3G lento (Lighthouse Network Throttling: "Slow 3G")
- Si `index.html` > 400 KB: aplicar minificación con `html-minifier-terser` sin cambiar la funcionalidad
- El CSS y JS deben seguir inline (requisito de arquitectura offline-first)

---

## Copywriting Contract

Todas las cadenas siguen el sistema i18n existente (`STRINGS.fr` / `STRINGS.ar`). Las claves nuevas que añade el plan 06-03 se definen aquí.

### Cadenas existentes confirmadas (no cambiar)

| Clave i18n | FR | AR |
|-----------|----|----|
| `historique.empty` | "Aucune estimation enregistrée" | "لا يوجد تقدير مسجل" |
| `comparer.empty` | "Comparez 2 estimations" | "قارن بين تقييمين" |
| `estimer.form.mileage.error` | "Veuillez entrer un kilométrage valide (> 0)" | "الرجاء إدخال عدد كيلومترات صحيح (> 0)" |

### Cadenas nuevas — plan 06-03

| Clave i18n | Texto FR | Texto AR | Dónde aparece |
|-----------|----------|----------|--------------|
| `error.storage.title` | "Stockage non disponible" | "التخزين غير متاح" | Heading del `.error-banner` |
| `error.storage.body` | "Les estimations ne peuvent pas être sauvegardées. Vérifiez les paramètres de confidentialité de votre navigateur." | "لا يمكن حفظ التقديرات. تحقق من إعدادات الخصوصية في متصفحك." | Body del `.error-banner` |
| `error.storage.close` | "Fermer" | "إغلاق" | Botón × del `.error-banner`; también `aria-label` |
| `error.history.corrupt` | "Les données du journal ont été réinitialisées." | "تمت إعادة تعيين بيانات السجل." | `.error-inline` en página Historique cuando `getAll()` falla |
| `error.form.no_result` | "Impossible d'estimer ce véhicule. Vérifiez les champs du formulaire." | "لا يمكن تقدير هذه السيارة. تحقق من حقول النموذج." | `.error-inline` debajo del botón "Estimer" cuando `Engine.estimate()` retorna `null` |

### Estados de acción destructiva (ya definidos en Phase 05 — confirmar sin cambios)

| Acción | Paso 1 copy | Paso 2 copy | Timeout |
|--------|------------|-------------|---------|
| "Effacer tout" el historial | `historique.clear` → "Effacer tout" / "مسح الكل" | `historique.confirm_clear` → "Confirmer ?" / "تأكيد ؟" | 3 segundos automático |

### CTA primario de esta fase

| Contexto | Label FR | Label AR |
|----------|----------|----------|
| Empty state Historique | "Estimer un véhicule" (reutiliza `nav.estimer`) | "تقييم" |
| Empty state Comparer | "Estimer un véhicule" (reutiliza `nav.estimer`) | "تقييم" |
| Botón cierre error banner | "Fermer" (`error.storage.close`) | "إغلاق" |

---

## Viewport Audit Checklist

Esta sección es el contrato de "qué significa pasar" el plan 06-01. El ejecutor comprueba cada ítem en DevTools (Chrome Device Emulation y Safari Responsive Design Mode).

### Chrome Android — 360 × 800 (Galaxy A)

- [ ] Sin scroll horizontal (`document.body.scrollWidth === 360`)
- [ ] Nav inferior fija visible y completa; no cortada por safe-area
- [ ] Header sticky no se descuadra al scrollear
- [ ] Formulario Estimer: todos los campos son tocables y el teclado virtual no tapa el campo activo (gracias a `scroll-padding-bottom`)
- [ ] Resultado: precio hero en 1 línea incluso con precios de 6 dígitos (ej: "750 000 DH")
- [ ] Historique: tarjetas se adaptan a 360px sin overflow de texto
- [ ] Comparer: cada `.compare-card` ocupa al menos 140px y las barras se renderizan

### Safari iOS — 375 × 667 (iPhone SE / 12 mini)

- [ ] Banner iOS aparece correctamente sobre la nav inferior (`bottom: calc(var(--nav-height) + env(safe-area-inset-bottom))`)
- [ ] El botón × del banner tiene mínimo 44×44px de área tapable
- [ ] `overscroll-behavior: none` previene el rebote de scroll en iOS
- [ ] Header sticky se mantiene al tope incluyendo el área de safe-area-inset-top
- [ ] Pill FR/AR toglea entre idiomas y el cambio RTL es instantáneo sin FOUC

### Safari iOS — 390 × 844 (iPhone 14)

- [ ] Dynamic Island no solapa el header (safe-area-inset-top cubren el espacio)
- [ ] Todos los criterios de 375px aplican igualmente

---

## RTL y Accesibilidad

Todas las propiedades de posicionamiento usan CSS logical properties (obligatorio por decisión de Phase 02, confirmado en `index.html`):

| Propiedad física | Propiedad logical usada | Verificar en esta fase |
|-----------------|------------------------|----------------------|
| `text-align: right` | `text-align: end` | Alineación de desglose en tabla cuando `dir="rtl"` |
| `margin-left: auto` | `margin-inline-start: auto` | Botón × en history cards |
| `padding-left/right` | `padding-inline-start/end` | Flecha de select en RTL (líneas 574-579 ya correctas) |
| `top/right` en badge | `top` / `inset-inline-end` | Badge "Meilleur rapport" en Comparer |

**Criterios de accesibilidad a auditar en plan 06-01:**

- `aria-label` en botón × de historial: valor viene de `I18n.t('historique.delete')` — verificar que se actualiza al cambiar idioma
- `role="list"` en `#history-list`, `role="listitem"` en cada `.history-card` — presentes en render JS
- `aria-live="polite"` en `#ios-install-banner` — ya presente en HTML
- Nuevo `.error-banner`: debe tener `role="alert"` (aria-live implícito assertive) para anunciarse a lectores de pantalla

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | not applicable — vanilla JS, sin shadcn, sin npm | not required |

No se introducen dependencias externas en esta fase. Todo CSS y JS nuevo se escribe directamente en `index.html`.

Excepción de herramienta de despliegue (plan 06-04/06-05): `html-minifier-terser` se ejecuta como herramienta de build solo si `index.html > 400 KB`; el resultado no modifica la arquitectura del archivo en producción.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

## Pre-Population Sources

| Fuente | Decisiones incorporadas |
|--------|------------------------|
| `index.html` `:root` (líneas 36-81) | 11 — todos los tokens de espaciado, tipografía, color, radios y sombras extraídos directamente |
| `index.html` CSS (líneas 82-820) | 8 — clases existentes catalogadas en Component Inventory con sus riesgos visuales conocidos |
| `05-UI-SPEC.md` (Phase 05, aprobado) | 7 — paleta 60/30/10, accent reservado para ganador, tipografía 4 tamaños, copywriting AR existente, RTL logical properties, registry safety |
| `ROADMAP.md` Phase 6 | 4 — criterios de éxito Lighthouse ≥ 90, Chrome Android 360px, Safari iOS 375px, offline PWA |
| `REQUIREMENTS.md` PWA-01 a PWA-05 | 5 — offline-first, instalable Android, instrucciones iOS, responsive 360px+ |
| User input (esta sesión) | 0 — todo pre-poblado desde upstream |
