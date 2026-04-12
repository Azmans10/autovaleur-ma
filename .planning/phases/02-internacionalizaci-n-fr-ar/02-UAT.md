---
status: complete
phase: 02-internacionalizaci-n-fr-ar
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md]
started: 2026-04-12T00:00:00Z
updated: 2026-04-12T12:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Botón FR/AR visible en el header
expected: Abres index.html en el navegador. En el header, junto a "AutoValeur MA", hay un pill toggle con "FR" y "AR". El idioma activo (FR) aparece resaltado con fondo de color y texto blanco.
result: pass

### 2. Cambio de idioma FR → AR
expected: Al hacer clic en "AR", todos los textos de la navegación inferior (Estimer → nombre árabe), los títulos h2 de cada página y el banner iOS cambian al árabe. El botón "AR" queda resaltado, "FR" queda sin resaltar.
result: pass

### 3. Layout RTL en modo árabe
expected: Con AR activo, el layout se espeja: el título "AutoValeur MA" queda a la derecha del header, el toggle FR/AR queda a la izquierda. La navegación inferior y su contenido también se alinean a la derecha.
result: pass

### 4. Persistencia del idioma tras recarga
expected: Con AR activo, recargas la página (F5). La app arranca directamente en árabe con RTL — no hay flash del layout en francés antes de cambiar.
result: pass

### 5. Dígitos latinos en formatPrice
expected: Abre la consola del navegador (F12) y ejecuta `formatPrice(65000, 'ar')`. El resultado es `"65.000 DH"` con dígitos latinos 0-9, NO dígitos árabes (٦٥٫٠٠٠). También `formatPrice(65000, 'fr')` devuelve `"65 000 DH"`.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
