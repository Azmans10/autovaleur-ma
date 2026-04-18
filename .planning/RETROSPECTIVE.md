# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-18
**Phases:** 6 | **Plans:** 30 | **Sessions:** ~8

### What Was Built
- PWA de archivo único (`index.html`, ~2.500 líneas) sin dependencias externas — HTML + CSS + JS vanilla
- Motor de valoración calibrado para Marruecos: 8 factores (edad, km, estado, carburant, ciudad, transmisión), 14 marcas, BD embebida
- Sistema i18n bilingüe FR/AR con layout RTL automático via CSS logical properties
- 3 páginas SPA (Estimer/Historique/Comparer) con navegación hash, historial localStorage, comparador visual
- Deploy en GitHub Pages con SW cache-first y paths absolutos para subpath `/autovaleur-ma/`
- Módulo ErrorUI para localStorage bloqueado, historial corrompido y Engine null

### What Worked
- **Arquitectura de archivo único**: La decisión de todo-en-un-HTML eliminó complejidad de build, bundler y deploy. El archivo se comparte por WhatsApp y abre directamente en browser.
- **Incremental por fases**: Cada fase entregó valor standalone (Fase 1 = app navegable, Fase 3 = motor funcional). Sin dependencies circulares entre fases.
- **CSS logical properties desde el principio**: RTL árabe funcionó sin rework porque los logical properties se planearon desde Fase 2, no como afterthought.
- **Tests inline en localhost**: El bloque `if(location.hostname==='localhost')` permitió verificar Engine y History sin infraestructura de tests externa.

### What Was Inefficient
- **Checkboxes de REQUIREMENTS.md nunca actualizados durante desarrollo**: Los 46 requisitos quedaron en "Pending" hasta el cierre del milestone. Una actualización por fase hubiera dado mejor visibilidad del progreso.
- **Paths del SW/manifest para GitHub Pages corregidos en Fase 6**: El subpath `/autovaleur-ma/` era predecible desde el inicio. Haberlo configurado en Fase 1 habría evitado la corrección de última hora.
- **Calibración de precios revisada ~20-25% al alza en Fase 3**: El RESEARCH inicial subestimó los precios de mercado MA 2024-2025. Más investigación de mercado inicial habría evitado el ajuste mid-phase.

### Patterns Established
- **Dependency graph en SUMMARY.md**: Documentar `requires/provides/affects` por plan evitó regresiones al modificar módulos JS compartidos.
- **`var` en lugar de `const` para módulos globales**: Patrón establecido en Fase 1 para compatibilidad cross-plan dentro del archivo único.
- **CACHE_NAME versionado**: `autovaleur-v1` → `autovaleur-v2` como mecanismo de cache-busting sin lógica adicional.
- **Unicode escapes para strings árabes**: Evita problemas de encoding en archivo HTML único (decidido en Fase 2, validado en producción).

### Key Lessons
1. **Definir el subpath de despliegue en Fase 1**: El subpath de GitHub Pages afecta SW, manifest y cache. No es un detalle de Fase final — es una constraint de arquitectura que debe entrar en el plan inicial.
2. **Marcar requisitos como completos tras cada fase**: Los checkboxes de REQUIREMENTS.md deben actualizarse al completar cada fase, no al cerrar el milestone.
3. **Calibrar datos de mercado con fuentes primarias antes de codificar**: Los precios base de la BD se ajustaron en Fase 3. Para v2, verificar en Avito.ma antes de escribir el JSON.

### Cost Observations
- Model mix: ~100% opus (GSD en modo quality)
- Sessions: ~8 sesiones de trabajo
- Notable: 7 días de desarrollo wall-clock (2026-04-11 → 2026-04-18), app funcional y desplegada en producción

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 MVP | ~8 | 6 | Proyecto inicial — baseline establecido |

### Cumulative Quality

| Milestone | Req. Cubiertos | Tests inline | Zero-Dep Additions |
|-----------|---------------|--------------|-------------------|
| v1.0 | 46/46 | Engine + History (localhost) | 8 módulos JS |

### Top Lessons (Verified Across Milestones)

1. Las constraints de deploy (subpath, CDN, paths) son constraints de arquitectura — documentarlas en Fase 1, no en Fase final.
2. Los datos de mercado calibrados (precios base, factores) necesitan fuentes primarias verificadas antes de codificar — no estimar.
