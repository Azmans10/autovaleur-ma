---
status: partial
phase: 06-pulido-y-despliegue
source: [06-VERIFICATION.md]
started: 2026-04-17
updated: 2026-04-17
---

## Current Test

[awaiting human testing]

## Tests

### 1. URL de producción accesible
expected: https://Azmans10.github.io/autovaleur-ma/ carga la app correctamente en Chrome
result: [pending]

### 2. Service Worker activo
expected: DevTools > Application > Service Workers muestra scope `/autovaleur-ma/` activo
result: [pending]

### 3. Modo offline funcional
expected: Con DevTools > Network > Offline activado, al recargar la app sigue funcionando
result: [pending]

### 4. Banner iOS en 375px
expected: En Device Mode iPhone SE (o Safari real), el banner de instalación iOS es visible y su botón de cierre tiene tap target >= 44px
result: [pending]

### 5. Lighthouse PWA >= 90
expected: DevTools > Lighthouse > Mobile en https://Azmans10.github.io/autovaleur-ma/ obtiene puntuación PWA >= 90
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
