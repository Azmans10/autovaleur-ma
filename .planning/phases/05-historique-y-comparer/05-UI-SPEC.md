---
phase: 5
slug: historique-y-comparer
status: approved
reviewed_at: 2026-04-13
shadcn_initialized: false
preset: none
created: 2026-04-13
---

# Phase 05 — UI Design Contract: Historique y Comparer

> Visual and interaction contract para la página Historique (lista/gestión de valoraciones) y la página Comparer (comparación visual lado a lado con ganador destacado).
> Generado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — PWA vanilla JS (archivo único index.html) |
| Preset | not applicable |
| Component library | none — CSS custom properties nativas en index.html |
| Icon library | SVG inline (cero peticiones de red, offline-first) |
| Font | `system-ui, -apple-system, 'Segoe UI', sans-serif` (FR); fallback árabe con Tahoma |

> Fuente: `index.html` líneas 68, 86 — tokens ya definidos, no requieren re-especificación.

---

## Spacing Scale

Tokens ya declarados en `index.html` `:root` (líneas 51-56). Esta fase los consume sin modificarlos.

| Token | Value | Usage en esta fase |
|-------|-------|--------------------|
| `--sp-xs` | 4px | Gap entre icono × y borde en botón eliminar; gap interno de badges |
| `--sp-sm` | 8px | Padding interno de tarjetas compactas; gap entre líneas de meta-datos |
| `--sp-md` | 16px | Padding de sección y separación entre tarjetas del historial |
| `--sp-lg` | 24px | Padding interno de la sección empty-state |
| `--sp-xl` | 32px | Margen superior de la comparación en Comparer |
| `--sp-2xl` | 48px | Padding vertical del estado vacío (consistente con `.empty-state` existente) |

Excepciones: Touch target mínimo del botón × (eliminar individual) = 44px de área tapable — logrado con `padding: var(--sp-sm) var(--sp-sm)` en el elemento interactivo.

---

## Typography

Tokens ya declarados en `index.html` `:root` (líneas 69-73). Esta fase usa exactamente 4 tamaños.

| Role | Token CSS | Size | Weight | Line Height | Uso en esta fase |
|------|-----------|------|--------|-------------|-----------------|
| Body | `--font-size-base` | 16px | 400 (regular) | 1.5 | Texto de descripción, opciones de select |
| Label / Meta | `--font-size-sm` | 14px | 400 (regular) | 1.4 | km, fecha relativa, texto `--text-muted` en tarjetas |
| Heading de tarjeta | `--font-size-lg` | 18px | 600 (semibold) | 1.2 | Línea "Marca Modelo Año" en cada tarjeta del historial |
| Precio destacado | `--font-size-2xl` | 24px | 600 (semibold) | 1.1 | Precio estimado en cada tarjeta, color `--primary` |

Pesos declarados: 400 (regular) y 600 (semibold). No se añaden pesos adicionales.

---

## Color

Paleta ya definida en `index.html` `:root` (líneas 38-47). Esta fase especifica qué elementos usan qué valor.

| Role | Token CSS | Value | Uso en esta fase |
|------|-----------|-------|-----------------|
| Dominant (60%) | `--surface` / `--surface-2` | #ffffff / #f8f9fa | Fondo de página, fondo del área de contenido principal |
| Secondary (30%) | `--surface-3` / `--border` | #f1f3f4 / #e0e0e0 | Fondo de tarjetas `.card`, bordes entre tarjetas, background de selects |
| Accent (10%) | `--accent` | #34a853 | Reservado exclusivamente para: borde del ganador en Comparer + badge "Meilleur rapport" |
| Destructive | `--danger` | #ea4335 | Reservado exclusivamente para: botón "Confirmar?" (2.º clic en flujo de 2 pasos de "Effacer tout") |

Accent reservado para:
1. `border: 2px solid var(--accent)` — tarjeta ganadora en la comparación
2. `.badge` con `background: var(--accent)` — texto "Meilleur rapport" sobre la tarjeta ganadora

Accent NO se usa en: botones primarios (usan `--primary`), links de navegación, barras de precio.

Color del texto:
- Texto principal: `--text` (#202124)
- Texto secundario/meta: `--text-muted` (#5f6368)
- Precio: `--primary` (#1a73e8)

---

## Component Inventory

Componentes reutilizados de fases anteriores (no rediseñar):

| Componente | Clase CSS existente | Uso en esta fase |
|------------|--------------------|--------------------|
| Tarjeta base | `.card` | Base de cada entrada del historial |
| Botón primario | `.btn-primary` | CTA "Aller à Estimer" en estados vacíos |
| Estado vacío | `.empty-state` | Estado vacío de Historique y Comparer |
| Badge | `.badge` | Badge "Meilleur rapport" sobre el ganador |

Componentes nuevos a crear en esta fase:

| Componente | Descripción |
|------------|-------------|
| `.history-card` | Extensión de `.card`: layout con precio alineado a la derecha y botón × |
| `.btn-danger` | Botón variante roja para estado "confirmar" del borrado; `background: var(--danger)` |
| `.compare-bar` | Barra CSS proporcional para precio; altura 12px, `border-radius: var(--radius-sm)`, color `--primary` |
| `.compare-card` | Contenedor de cada coche en Comparer; apila datos + barra + precio |
| `.compare-winner` | Modificador: `border: 2px solid var(--accent)` sobre `.compare-card` |

---

## Interaction Contracts

### Historique — Flujo de eliminación individual

1. Cada `.history-card` tiene un botón × alineado `end` (CSS logical: `margin-inline-start: auto`)
2. `aria-label="Supprimer cette estimation"` en el botón ×
3. Al hacer clic: `History.remove(id)` → re-render lista → sin animación de salida (mantener simplicidad)
4. Touch target mínimo: 44×44px logrado con padding `var(--sp-sm)` en el botón ×

### Historique — Flujo "Effacer tout" (2 pasos)

| Estado | Texto del botón | Estilo | Comportamiento |
|--------|-----------------|--------|----------------|
| Normal | "Effacer tout" (i18n: `historique.clear`) | `.btn-primary` con `border` outline | Primer clic → estado "confirmar" |
| Confirmación | "Confirmer ?" (i18n: `historique.confirm_clear`) | `.btn-danger` | Segundo clic → `History.clear()` → re-render |
| Timeout | Vuelve a "Normal" | — | Automático después de 3 segundos sin segundo clic |

El botón "Effacer tout" solo aparece cuando hay al menos 1 entrada. Se oculta con `hidden` cuando el historial está vacío.

### Comparer — Renderizado automático

1. Dos `<select>` con `<option value="">` como primera opción (placeholder vacío)
2. Listener `change` en ambos selects
3. Si algún select = `""` → no renderizar comparación → mantener área de resultado vacía (o mostrar mensaje orientativo)
4. Si ambos selects tienen valor → renderizar inmediatamente sin botón adicional

### Barras visuales de precio

- El precio más alto recibe `width: 100%`
- El precio más bajo recibe `width: calc(precio_min / precio_max * 100%)`
- Animación: `transition: width 0.3s ease` al actualizar (consistente con transiciones existentes)

### Ganador (ratio precio/km)

- `ratio = precio_estimado / mileage` — menor ratio = ganador
- Si `mileage === 0` para alguno: ganador = coche con precio estimado menor
- Si ambos son iguales: ninguno recibe clase `.compare-winner` (empate sin destacar)
- El badge "Meilleur rapport" se posiciona absolute: `top: var(--sp-sm); inset-inline-end: var(--sp-sm)` (CSS logical property para RTL)

---

## Copywriting Contract

Todas las cadenas usan el sistema i18n existente (`STRINGS.fr` / `STRINGS.ar` con `data-i18n`).

| Elemento | Clave i18n | Texto FR | Texto AR |
|----------|-----------|----------|----------|
| CTA principal (ambos estados vacíos) | `nav.estimer` (reusar) | "Estimer un véhicule" | "تقدير سيارة" |
| Empty state heading — Historique | `historique.empty` | "Aucune estimation enregistrée" | "لا يوجد تقدير مسجل" |
| Botón borrado total | `historique.clear` | "Effacer tout" | "مسح الكل" |
| Botón confirmación borrado | `historique.confirm_clear` | "Confirmer ?" | "تأكيد ؟" |
| Tooltip/aria botón eliminar individual | `historique.delete` | "Supprimer" | "حذف" |
| Fecha — hoy | `date.today` | "Aujourd'hui" | "اليوم" |
| Fecha — N días | `date.days_ago` | "Il y a {n} jour(s)" | "منذ {n} يوم" |
| Fecha — N semanas | `date.weeks_ago` | "Il y a {n} semaine(s)" | "منذ {n} أسبوع" |
| Empty state heading — Comparer | `comparer.empty` | "Comparez 2 estimations" | "قارن بين تقييمين" |
| Empty state body — Comparer | `comparer.empty_body` | "Ajoutez au moins 2 estimations pour comparer" | "أضف تقييمين على الأقل للمقارنة" |
| Select placeholder A | `comparer.select_a` | "Choisir véhicule A" | "اختر السيارة أ" |
| Select placeholder B | `comparer.select_b` | "Choisir véhicule B" | "اختر السيارة ب" |
| Badge ganador | `comparer.winner_badge` | "Meilleur rapport" | "أفضل عرض" |

### Estados de error

| Situación | Manejo | Copy |
|-----------|--------|------|
| localStorage bloqueado al guardar | `try/catch` silencioso — no mostrar al usuario (patrón de fases 1-4) | — |
| localStorage bloqueado al leer | `getAll()` retorna `[]` → se muestra el empty state normal | — |
| Historial corrompido (JSON inválido) | `History.getAll()` retorna `[]` con catch — empty state | — |

No se crean mensajes de error visibles en esta fase para fallo de localStorage (se reserva para Fase 6 según ROADMAP).

### Acción destructiva: "Effacer tout"

Flujo de confirmación de 2 pasos inline (sin modal, sin `window.confirm()`):
- Paso 1: Botón "Effacer tout" (outline, estilo secundario)
- Paso 2: El mismo botón muta a "Confirmer ?" con `background: var(--danger)`, `color: white`
- Timeout 3s: si no hay 2.º clic, vuelve al estado original
- No se confirma eliminación individual — el botón × actúa directamente

---

## RTL y Accesibilidad

Todas las propiedades de posicionamiento usan CSS logical properties (obligatorio por decisión de Fase 2):

| Propiedad física | Propiedad logical |
|-----------------|-------------------|
| `text-align: right` | `text-align: end` |
| `margin-left: auto` | `margin-inline-start: auto` |
| `padding-left` | `padding-inline-start` |
| `top/right` en badge | `top` / `inset-inline-end` |

ARIA mínimo requerido:
- `aria-label` en botón × (texto localizado: `History.t('historique.delete')`)
- `role="list"` en contenedor de tarjetas del historial
- `role="listitem"` en cada `.history-card`

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | not applicable — vanilla JS, sin shadcn | not required |

No se usan registros de terceros. Todo CSS y JS se escribe directamente en `index.html`.

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
| CONTEXT.md (05-CONTEXT.md) | 12 — layout tarjetas, fecha relativa, flujo 2 pasos, selects Comparer, barra solo precio, lógica ganador, empty states, i18n keys, patrones a mantener |
| REQUIREMENTS.md | 10 — HIST-01 a HIST-05, COMP-01 a COMP-05 |
| index.html (tokens existentes) | 8 — spacing scale, paleta de colores, tipografía, componentes `.card`/`.btn-primary`/`.empty-state`, font stack |
| User input (esta sesión) | 0 — todo pre-poblado desde upstream |
