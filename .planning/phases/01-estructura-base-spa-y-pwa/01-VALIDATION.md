---
phase: 1
slug: estructura-base-spa-y-pwa
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser testing + Chrome DevTools |
| **Config file** | none — proyecto vanilla sin bundler ni test runner |
| **Quick run command** | `open index.html en Chrome (via http-server)` |
| **Full suite command** | `npx http-server . -p 3000` + Lighthouse PWA audit |
| **Estimated runtime** | ~30 segundos (manual) |

> Nota: Proyecto vanilla HTML/CSS/JS sin npm. La "suite de tests" es verificación manual en Chrome DevTools + Lighthouse. No hay test runner automatizable en esta fase.

---

## Sampling Rate

- **After every task commit:** Verificar en Chrome que la página carga sin errores de consola
- **After every plan wave:** Lighthouse PWA snapshot + verificar navegación entre las 3 páginas
- **Before `/gsd-verify-work`:** Lighthouse PWA score + verificación offline + instalación manual en Android
- **Max feedback latency:** ~60 segundos (abrir browser, navegar, verificar)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Command / Steps | Status |
|---------|------|------|-------------|-----------------|-----------|-----------------|--------|
| 1-01-01 | 01-01 | 1 | NAV-01 | N/A | manual | Abrir index.html — verificar 3 secciones .page en el DOM | ⬜ pending |
| 1-01-02 | 01-02 | 1 | NAV-01, NAV-02, NAV-03 | N/A | manual | Click en nav → URL cambia a #historique, sección visible, sin recarga | ⬜ pending |
| 1-01-03 | 01-03 | 2 | PWA-02, PWA-03 | N/A | manual | DevTools → Application → Manifest sin errores + SW registrado | ⬜ pending |
| 1-01-04 | 01-04 | 2 | PWA-01, PWA-02, PWA-03, PWA-04 | N/A | manual | DevTools → Application → Manifest + Service Workers → activo; offline mode funciona | ⬜ pending |
| 1-01-05 | 01-05 | 2 | PWA-05 | N/A | manual | Redimensionar Chrome a 360px → layout correcto, nav inferior visible y fija | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No aplica — proyecto vanilla sin framework de tests. Toda verificación es manual via Chrome DevTools.

*Existing infrastructure covers all phase requirements (via manual browser testing).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| App funciona offline tras primera carga | PWA-02 | Requiere SW activo en servidor HTTP real | 1. Servir con `npx http-server` 2. Cargar app 3. DevTools → Network → Offline 4. Recargar → app debe cargar |
| Banner "Add to Home Screen" en Android | PWA-03 | Requiere dispositivo Android real o Chrome DevTools device emulation | DevTools → ⋮ → More tools → Application → Manifest → "Add to homescreen" |
| Instrucciones iOS visibles en Safari | PWA-04 | Requiere Safari iOS o emulación UA | Cambiar UA a iPhone → verificar que aparece el banner de instrucciones manuales |
| Barra nav inferior con safe-area-inset | PWA-05 | Requiere dispositivo con notch/Home Indicator | Verificar en iPhone simulado que nav no se solapa con el gesto de inicio |

---

## Validation Sign-Off

- [ ] Todas las tareas tienen verificación manual documentada
- [ ] Verificación de SW requiere servidor HTTP (no file://) — documentado
- [ ] No hay dependencias de test runner externo
- [ ] `nyquist_compliant: true` pendiente hasta verificación manual completada

**Approval:** pending
