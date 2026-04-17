---
phase: 06-pulido-y-despliegue
plan: 02
subsystem: ui
tags: [error-handling, i18n, localStorage, accessibility, pwa]

# Dependency graph
requires:
  - phase: 06-01
    provides: correcciones tipograficas y banner iOS con tap targets PWA-04

provides:
  - ErrorUI module (showStorageBanner, closeBanner, showInline, clearInline)
  - Banner de error visible (#error-storage-banner, role=alert, hidden nativo)
  - CSS de .error-banner, .error-banner-close (44px tap target), .error-inline
  - 5 cadenas i18n de error en FR y AR (error.storage.*, error.history.corrupt, error.form.no_result)
  - Catch handlers de History actualizados: save/remove/clear muestran banner; getAll marca _corrupted
  - Historique.render() muestra error inline cuando historial corrompido
  - Form submit muestra error inline cuando Engine.estimate() retorna null

affects:
  - 06-03
  - 06-04
  - 06-05

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ErrorUI module pattern (showStorageBanner/showInline/clearInline) para errores visibles en PWA offline-first
    - hidden nativo para banner de error (consistente con patron de .page y ios-install-banner)
    - textContent via createElement para insertar mensajes de error (nunca innerHTML)
    - _corrupted flag en History para comunicar estado entre getAll() y render()

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "ErrorUI.showStorageBanner() llama I18n._applyTranslations() para actualizar las cadenas del banner al idioma activo en el momento del error"
  - "History._corrupted flag transmite la deteccion de JSON invalido desde getAll() a Historique.render() sin acoplamiento directo"
  - "ErrorUI.showInline inserta el error al final del contenedor (page-estimer / page-historique) — no bloquea el formulario ni el historial"
  - "El banner de storage no bloquea la estimacion — el resultado se muestra aunque el guardado falle"

patterns-established:
  - "Patron ErrorUI: todos los errores visibles al usuario pasan por ErrorUI (no console.warn directo)"
  - "Patron inline error: contenedor = id de la pagina SPA, clave = STRINGS key, remove previo antes de insertar"

requirements-completed:
  - PWA-05

# Metrics
duration: 12min
completed: 2026-04-17
---

# Phase 06 Plan 02: Error UI — manejo visible de 3 escenarios de fallo Summary

**Modulo ErrorUI vanilla con banner accesible (role=alert, 44px) y mensajes inline para localStorage bloqueado, historial corrompido y Engine.estimate() null, con 5 cadenas i18n en FR y AR**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-17T21:02:00Z
- **Completed:** 2026-04-17T21:14:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Implementadas 5 cadenas i18n de error en STRINGS.fr y STRINGS.ar con texto definitivo (UTF-8 directo, no escape unicode)
- CSS de .error-banner con patron de posicion estatica (no fixed como iOS banner), fondo --warning, boton cierre >= 44px tap target
- Modulo ErrorUI completo con 4 metodos; ninguno usa innerHTML — todo via createElement + textContent
- Los 3 catch handlers de History (save/remove/clear) sustituyen console.warn por ErrorUI.showStorageBanner()
- History.getAll() marca _corrupted flag; Historique.render() lo comprueba y muestra error inline
- Form submit handler muestra error inline si Engine.estimate() retorna null y lo limpia en exito

## Task Commits

1. **Task 1: Cadenas i18n + CSS error-banner + HTML banner** - `ad2bacb` (feat)
2. **Task 2: Modulo ErrorUI + catch handlers** - `1418c91` (feat)

## Files Created/Modified

- `index.html` - Añadidas 5 cadenas i18n FR/AR, CSS Error UI, HTML banner #error-storage-banner, modulo ErrorUI, actualizados 3 catch handlers y Historique.render() y form submit handler

## Decisions Made

- `I18n._applyTranslations()` en lugar de `I18n.update()` (que no existe) para aplicar traducciones al banner al mostrarse
- `_corrupted` flag en el objeto `History` en lugar de variable modular para simplicidad en JS vanilla de archivo unico
- Error inline insertado al final del contenedor de pagina (no junto al boton submit especificamente) para mantener la implementacion simple y consistente entre escenarios

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] I18n.update() no existe — usar I18n._applyTranslations()**
- **Found during:** Task 2 (modulo ErrorUI)
- **Issue:** El plan especificaba `I18n.update()` en showStorageBanner pero la funcion publica del modulo I18n se llama `_applyTranslations()` (prefijo _ indica uso interno) — llamar `I18n.update()` causaria error en runtime
- **Fix:** Usar `I18n._applyTranslations()` que es la funcion real del modulo
- **Files modified:** index.html
- **Verification:** grep de la definicion confirma `_applyTranslations: function()`
- **Committed in:** 1418c91 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — nombre incorrecto de funcion i18n)
**Impact on plan:** Correccion necesaria para que el banner muestre el texto correcto al idioma activo. Sin scope creep.

## Issues Encountered

None — el unico ajuste fue la correccion del nombre de la funcion I18n (vease Deviations).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ErrorUI module disponible para que planes 06-03 a 06-05 reutilicen si aparecen nuevos escenarios de error
- Los 3 escenarios de fallo del requisito PWA-05 estan cubiertos y accesibles
- El banner tiene role=alert y boton cierre con tap target >= 44px cumpliendo estandares de accesibilidad PWA

---
*Phase: 06-pulido-y-despliegue*
*Completed: 2026-04-17*
