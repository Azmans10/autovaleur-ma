---
phase: "01"
plan: "04"
subsystem: pwa-shell
tags: [pwa, service-worker, ios, android, install-prompt, meta-tags]
requires: [01-03]
provides: [pwa-meta-tags, sw-registration, ios-install-banner, android-install-prompt]
affects: [index.html]
tech_stack:
  added: []
  patterns: [beforeinstallprompt, navigator.standalone, env(safe-area-inset-bottom), window.matchMedia(display-mode:standalone)]
key_files:
  modified: [index.html]
decisions:
  - "Banner iOS con delay de 2s para no competir visualmente con la carga inicial de la página"
  - "Detección standalone combina window.navigator.standalone (iOS propietario) y matchMedia display-mode para cubrir ambas plataformas"
  - "SW registrado en window load (no DOMContentLoaded) para no competir con carga inicial"
  - "beforeinstallprompt capturado pero no mostrado en Fase 1 — botón de instalación Android queda para fases futuras"
metrics:
  duration: "8min"
  completed_date: "2026-04-11"
  tasks_completed: 2
  files_modified: 1
---

# Phase 01 Plan 04: Registrar SW y añadir meta tags PWA — Summary

**One-liner:** Meta tags PWA completos (iOS + Android), registro del SW en load event, y banner iOS con instrucciones manuales en francés.

## What Was Built

Se completó la integración PWA de `index.html` conectando los artefactos del plan 01-03 (sw.js, manifest.json, iconos) con la página principal. Los cambios se dividieron en dos commits atómicos.

### Tarea 1 — Meta tags PWA en `<head>` (commit d595909)

Añadidos al `<head>` de `index.html`:

- `<meta name="theme-color" content="#1a73e8">` — color de barra de browser en Android Chrome
- `<meta name="apple-mobile-web-app-capable" content="yes">` — activa modo standalone en iOS Safari
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">` — status bar visible con iconos del sistema
- `<meta name="apple-mobile-web-app-title" content="AutoValeur">` — nombre en pantalla de inicio iOS
- `<link rel="icon" href="icon-192.png" type="image/png">` — favicon para pestañas de escritorio
- Estilos CSS para `.ios-install-banner` con soporte `env(safe-area-inset-bottom)` para iPhone notch

### Tarea 2 — Banner iOS y registro SW (commit 7f5de21)

- **Banner HTML:** `<div id="ios-install-banner">` con ícono SVG Share, texto "Pour installer... puis Sur l'écran d'accueil", botón de cierre ✕
- **SW registration:** `navigator.serviceWorker.register('./sw.js')` dentro de `window.addEventListener('load', ...)` — no compite con carga inicial
- **Android:** Captura `beforeinstallprompt` en `deferredInstallPrompt` (con `event.preventDefault()` para suprimir el mini-infobar automático de Chrome)
- **iOS:** IIFE `checkIOSInstall()` — detecta `/iphone|ipad|ipod/i` AND NOT standalone → muestra banner tras 2s de delay

## Files Modified

| File | Change |
|------|--------|
| `index.html` | +105 líneas: meta tags PWA, CSS banner, HTML banner, JS SW registration + install logic |

## Commits

| Hash | Message |
|------|---------|
| d595909 | feat(01-04): añadir meta tags PWA al head — theme-color, apple-mobile-web-app-*, favicon |
| 7f5de21 | feat(01-04): añadir banner iOS y registro SW — lógica de instalación completa |

## Decisions Made

1. **Banner iOS delay 2s:** Tradeoff entre visibilidad y UX — evita competir visualmente con la carga de la página. Ajustable en Fase 6 si testing de usuarios lo requiere.
2. **deferredInstallPrompt sin botón UI:** El prompt de Android se captura pero no se expone en la UI en Fase 1. El botón "Installer l'app" se implementará en una fase posterior cuando haya UI completa.
3. **standalone detection dual:** `window.navigator.standalone === true` cubre iOS propietario; `matchMedia('(display-mode: standalone)')` cubre Android/Chrome. Combinación robusta multiplataforma.
4. **SW en load, no DOMContentLoaded:** Sigue el anti-pattern detectado en RESEARCH.md — el SW no debe competir con la carga inicial de recursos críticos.

## Deviations from Plan

Ninguna — el plan se ejecutó exactamente como estaba especificado.

## Requirements Addressed

| Req ID | Description | Status |
|--------|-------------|--------|
| PWA-02 | Offline tras primera carga (SW registrado) | Implementado |
| PWA-03 | Instalable en Android (manifest + SW + beforeinstallprompt) | Implementado |
| PWA-04 | Instrucciones instalación iOS Safari | Implementado |

## Known Stubs

Ninguno. El banner iOS muestra instrucciones reales (no placeholder). El `deferredInstallPrompt` para Android está capturado pero el botón de UI para mostrarlo es intencional para fases futuras (comentado en código: "En fases futuras: mostrar un botón").

## Verification Steps

Para verificar tras completar la Fase 1:

1. `npx http-server . -p 8080` en el directorio del proyecto
2. Abrir `http://localhost:8080` en Chrome → DevTools → Application → Service Workers → confirmar "activated and is running"
3. DevTools → Application → Manifest → confirmar sin errores rojos
4. DevTools → Network → activar "Offline" → recargar → app carga desde caché
5. DevTools → Device Mode → iPhone → recargar → banner azul aparece a los 2s con instrucciones iOS
6. Consola: verificar "AutoValeur — SW registrado, scope: http://localhost:8080/"

## Self-Check: PASSED

- [x] `index.html` modificado con todos los meta tags del plan
- [x] Banner iOS presente con HTML correcto
- [x] SW registration code presente en window load event
- [x] beforeinstallprompt capture presente
- [x] Commits d595909 y 7f5de21 existen en el repositorio
