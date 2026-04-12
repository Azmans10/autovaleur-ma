# Phase 4: Página Estimer - Context

**Gathered:** 2026-04-12
**Mode:** --auto (all gray areas auto-resolved with recommended options)
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar la página Estimer completa: formulario cascada con 8 campos, handler de submit que llama a Engine.estimate() y guarda en historial, sección de resultado con precio prominente y rango, tabla de desglose de 7 líneas con colores, y 3 chips de links a marketplaces.

Esta fase NO incluye: la página Historique ni Comparer (Fase 5). Sí incluye el módulo `var History` mínimo (save + getAll) que Fase 5 extenderá.
</domain>

<decisions>
## Implementation Decisions

### Formulario — Layout y estructura

- **D-01:** **Scroll único, no wizard.** El formulario tiene 8 campos (marca, modelo, año, km, estado, carburante, transmisión, ciudad) en una sola pantalla scrollable. Sin pasos ni estado de wizard — demasiada complejidad para los beneficios en este contexto.
- **D-02:** **Selects en cascada:** marca → modelo (filtrado por marca) → año (rango de CAR_DB[marca][modelo].years). Los tres se implementan con `<select>` nativos — sin librerías externas, consistente con la arquitectura del proyecto.
- **D-03:** **Orden de los campos:** marca → modelo → año → km → estado → carburant → transmisión → ciudad. Los tres primeros definen el vehículo (cascada); los cinco restantes definen la condición (no en cascada).

### Formulario — Validación

- **D-04:** **Validación solo al submit.** Sin validación inline por campo — menos ruido en móvil, formulario corto. Al submit: verificar que todos los campos estén seleccionados/rellenados. Si km está vacío o es inválido (≤ 0 o no numérico), mostrar error bajo el campo. Sin submit si hay errores.
- **D-05:** El botón de submit está deshabilitado visualmente hasta que marca/modelo/año estén seleccionados (los tres obligatorios mínimos). Los demás campos tienen valores por defecto razonables (bon, diesel, manuelle, Casablanca) para reducir fricción.

### Resultado — Presentación

- **D-06:** **El resultado aparece inline debajo del formulario**, en la misma página. Al submit exitoso, se hace scroll suave hasta la sección de resultado. El formulario permanece visible arriba (el usuario puede volver a modificarlo sin perder el contexto).
- **D-07:** El precio estimado se muestra de forma muy prominente (tipografía grande, color `--primary`). El rango min-max aparece inmediatamente debajo en tipografía secundaria.
- **D-08:** **Animación de aparición:** La sección de resultado aparece con fade-in + slide-up suave (CSS transition, no JS animation). No hay spinner — el Engine.estimate() es síncrono e instantáneo.

### Resultado — Desglose

- **D-09:** **Tabla de 7 filas** correspondientes al breakdown de Engine.estimate(): precio base + 6 factores. Columnas: label (traducido vía I18n), factor (como ×1.06 o ×0.85), importe acumulado en DH.
- **D-10:** **Colores:** verde si factor > 1.0 (bonus), rojo si factor < 1.0 (penalización), neutro/gris si factor = 1.0. El color aplica al factor y al importe de esa fila. La primera fila (precio base) siempre es neutra.

### Resultado — Nueva valoración

- **D-11:** Tras el resultado aparece un botón "Nouvelle estimation" que limpia el formulario, oculta el resultado y hace scroll al top. El formulario se resetea a estado inicial (selects en blanco, campos a valores por defecto).

### Módulo History

- **D-12:** Implementar `var History` mínimo en el plan 04-02 (junto al handler de submit). Métodos requeridos en esta fase: `History.save(entry)` y `History.getAll()`. Estructura de entry: `{ id, make, model, year, mileage, condition, fuel, transmission, city, estimated_price, price_range, breakdown, date }`. Almacenamiento: JSON en localStorage bajo clave `'autoValeur_history'`.
- **D-13:** Phase 5 extiende History con `delete(id)`, `clear()`, y la UI de Historique/Comparer. El módulo se implementa como `var History = {...}` global, consistente con CAR_DB, Engine y Marketplaces.

### Sección Marketplaces

- **D-14:** **3 chips/botones** — Avito, Moteur, Wandaloo — que abren en nueva pestaña (`target="_blank"`). Las URLs se generan con `Marketplaces.getLinks(make, model, year)` (ya implementado en Fase 3).
- **D-15:** Los chips solo son visibles cuando hay un resultado calculado. Antes del primer submit, la sección de marketplaces está oculta.

### I18n y RTL

- **D-16:** Todos los labels del formulario, labels del desglose y textos de resultado usan atributos `data-i18n` para conectar con el módulo I18n de Fase 2. Las claves nuevas que se añadan siguen el patrón `estimer.*` (formulario) y `result.*` (resultado).
- **D-17:** Los valores del desglose (factores y precios en DH) usan `formatPrice()` ya existente para el formato numérico. Los factores se formatean como `×1.06` — sin I18n (formato universal).

### Claude's Discretion

- Estructura HTML exacta del formulario (fieldsets, clases CSS, ids)
- Lógica CSS de colores verde/rojo del desglose (clases `.factor-up`, `.factor-down`, `.factor-neutral`)
- Claves i18n exactas para los nuevos labels (el planificador las define consistentemente con el patrón de Fase 2)
- Comportamiento de los selects cascada en el borde (ej: qué pasa al cambiar marca después de haber seleccionado modelo)
</decisions>

<canonical_refs>
## Canonical Refs

- `index.html` — archivo único; toda la UI de Fase 4 se añade dentro de `<section id="page-estimer">` y el `<script>`
- `.planning/REQUIREMENTS.md` — requisitos EST-01 a EST-07, UI-01 a UI-04 (scope de esta fase)
- `.planning/ROADMAP.md` — Phase 4, plans 04-01 a 04-05
- `.planning/phases/03-motor-de-valoraci-n-y-base-de-datos/03-CONTEXT.md` — decisiones D-11 a D-18 (Engine.estimate signature, Marketplaces.getLinks, breakdown structure)
- `.planning/phases/02-internacionalizaci-n-fr-ar/02-CONTEXT.md` — decisiones I18n (data-i18n pattern, I18n.t() usage)
</canonical_refs>

<deferred>
## Ideas Diferidas

- **Modo "compartir valoración"** (SHARE-01) — fuera del scope de esta fase, ya en v2 requirements
- **Monetización / paywall** — discutida con el usuario, se planificará como fase post-v1 (después de Fase 6)
</deferred>
