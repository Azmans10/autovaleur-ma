# Phase 05: Historique y Comparer — Context

**Gathered:** 2026-04-13
**Status:** Ready for planning
**Source:** discuss-phase interactive

<domain>
## Phase Boundary

Esta fase entrega dos páginas funcionales: **Historique** (lista y gestión del historial de valoraciones) y **Comparer** (comparación lado a lado de 2 valoraciones con barras visuales y ganador destacado).

`var History` existe con `save()` y `getAll()` — esta fase añade `remove(id)` y `clear()` y construye las UIs sobre ellos.

</domain>

<decisions>
## Implementation Decisions

### Tarjetas del Historial (Página Historique)

- **Layout compacto:** Marca/Modelo/Año en grande, precio estimado destacado (color primary), km y fecha en texto pequeño (muted). Botón eliminar con icono ×, alineado a la derecha.
- **Fecha relativa:** "Aujourd'hui", "Il y a 2 jours", "Il y a 1 semaine" — calculada en JS a partir del timestamp ISO guardado. Sin mostrar fecha absoluta.
- **Ordenación:** Más reciente primero (ya garantizado por `History.save()` que hace unshift).
- **Eliminar individual:** Botón × por tarjeta invoca `History.remove(id)` y re-renderiza la lista sin recargar.
- **Clase CSS:** Usar `.card` existente como base para cada tarjeta del historial.

### Estado Vacío (Historique sin entradas)

- **Contenido:** Icono simple (SVG inline), texto "Aucune estimation enregistrée" + botón CTA `.btn-primary` que navega a `#estimer` via Router.
- **Sin ilustración compleja** — mantener consistencia con el estilo minimalista del resto de la app.

### Borrado Completo del Historial

- **Botón de 2 pasos** (decisión Claude): Primer clic cambia el botón a estado "confirmar" (color danger, texto "Confirmer ?"). Segundo clic ejecuta `History.clear()` y re-renderiza. Sin modal, sin `window.confirm()`, sin JS extra. Más elegante que el confirm nativo, más simple que un modal.
- **Reset automático:** Si el usuario no confirma en 3 segundos, el botón vuelve a su estado original.

### Módulo History — Métodos nuevos

- `History.remove(id)` — filtra el array por id, persiste, retorna el array actualizado.
- `History.clear()` — escribe `[]` en localStorage, retorna array vacío.
- Ambos con `try/catch` consistente con el patrón existente de `save()` y `getAll()`.

### Página Comparer — Selección de Valoraciones

- **Dos selects desplegables:** Uno para "Voiture A" y otro para "Voiture B". Cada opción muestra `{Marca} {Modelo} {Año} — {precio}`. Poblados desde `History.getAll()`.
- **Renderizado inmediato:** La comparación se actualiza automáticamente cada vez que cambia cualquiera de los dos selects (no hay botón "Comparar").
- **Validación:** Si alguno de los dos selects no tiene selección, no se renderiza comparación.

### Comparador — Barras Visuales y Ganador

- **Métricas con barra:** Solo precio. Barra proporcional — el coche más caro = 100%, el otro = % relativo.
- **Sin barras de km ni año** — mantener la comparación simple y legible.
- **Ganador:** El coche con mejor ratio `precio / km` queda destacado con borde verde (color --accent) y un badge "Meilleur rapport" (i18n).
- **Si km = 0** (no registrado), el ganador se determina solo por precio menor.

### Estado vacío Comparer

- Si hay 0 o 1 valoraciones: mensaje orientativo "Ajoutez au moins 2 estimations pour comparer" con CTA a `#estimer`.

### i18n

- Todas las cadenas nuevas en `STRINGS.fr` y `STRINGS.ar`:
  - `historique.empty`, `historique.clear`, `historique.confirm_clear`, `historique.delete`
  - `comparer.empty`, `comparer.select_a`, `comparer.select_b`, `comparer.winner_badge`
  - `date.today`, `date.days_ago`, `date.weeks_ago`

### Patrones a mantener (de fases anteriores)

- Atributo `hidden` nativo para mostrar/ocultar secciones (D-15)
- CSS logical properties para RTL (UI-03)
- `textContent` en lugar de `innerHTML` para datos de usuario (evitar XSS)
- `data-i18n` en todos los textos estáticos
- `var NombreModulo` para nuevos módulos JS

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Estado actual del código
- `index.html` — archivo único que contiene todo: HTML de `#page-historique` y `#page-comparer` (stubs), `var History` con `save()` y `getAll()`, CSS custom properties, Router, I18n, STRINGS

### Decisiones de fases anteriores relevantes
- `.planning/phases/02-internacionalizaci-n-fr-ar/02-CONTEXT.md` — patrón i18n (data-i18n, I18n.t, STRINGS structure)
- `.planning/phases/03-motor-de-valoraci-n-y-base-de-datos/03-CONTEXT.md` — decisiones D-11 a D-18

### Requisitos
- `.planning/REQUIREMENTS.md` — HIST-01 a HIST-05, COMP-01 a COMP-05

</canonical_refs>

<specifics>
## Specific Ideas

- El formato de precio usa `formatPrice()` existente — no crear función nueva
- El ratio precio/km para el ganador: `precio_estimado / mileage` — menor es mejor (menos MAD por km)
- Fecha relativa: calcular `Math.floor((Date.now() - entry.date) / 86400000)` días de diferencia
- Los selects del Comparer deben tener `<option value="">` vacío como primera opción (placeholder)

</specifics>

<deferred>
## Deferred Ideas

- Filtros o búsqueda en el historial — fuera de scope (Fase 5 solo lista + eliminar)
- Exportar historial a PDF o CSV — Fase 6 o backlog
- Compartir comparación por WhatsApp — backlog
- Más de 2 métricas en el comparador (km, año) — descartado por simplicidad

</deferred>

---

*Phase: 05-historique-y-comparer*
*Context gathered: 2026-04-13 via discuss-phase interactive*
