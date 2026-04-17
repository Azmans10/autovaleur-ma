---
phase: 6
slug: pulido-y-despliegue
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual — no test framework (single HTML file, no build tooling) |
| **Config file** | none |
| **Quick run command** | Open `index.html` in browser DevTools, run Lighthouse PWA audit |
| **Full suite command** | Lighthouse audit + manual device emulation + offline test |
| **Estimated runtime** | ~5 minutes manual |

---

## Sampling Rate

- **After every task commit:** Visual check in browser (no overflow, no JS errors in console)
- **After every plan wave:** Full Lighthouse PWA audit + manual device emulation
- **Before `/gsd-verify-work`:** Full suite must pass all 4 success criteria
- **Max feedback latency:** 5 minutes (manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | PWA-05 | — | No font-weight 700/800 en index.html | automated | `grep -cE "font-weight:\s*(700|800)" index.html \| grep "^0$"` | N/A | pending |
| 06-01-02 | 01 | 1 | PWA-05 | — | Token --font-size-lg eliminado, --font-size-hero presente | automated | `grep -c "font-size-lg" index.html \| grep "^0$" && grep -c "font-size-hero" index.html` | N/A | pending |
| 06-01-03 | 01 | 1 | PWA-04 | — | .ios-install-banner visible en 375px, tap targets OK | automated | `grep -c "ios-install-banner" index.html \| grep -v "^0$"` | N/A | pending |
| 06-02-01 | 02 | 2 | PWA-05 | T-06-02,T-06-03,T-06-04 | Error banner + inline + cadenas i18n presentes | automated | `grep -c "ErrorUI" index.html && grep -c "error.storage.title" index.html` | N/A | pending |
| 06-02-02 | 02 | 2 | PWA-05 | T-06-02 | ErrorUI module y catch handlers actualizados | automated | `grep -c "showStorageBanner" index.html && grep -c "_corrupted" index.html` | N/A | pending |
| 06-03-01 | 03 | 3 | PWA-02,PWA-03 | T-06-05 | manifest.json con paths /autovaleur-ma/ | automated | `grep "start_url" manifest.json \| grep "/autovaleur-ma/"` | N/A | pending |
| 06-03-02 | 03 | 3 | PWA-02 | T-06-05,T-06-06 | sw.js con CACHE_NAME v2 y paths absolutos | automated | `grep "autovaleur-v2" sw.js && grep -c "/autovaleur-ma/" sw.js` | N/A | pending |
| 06-03-03 | 03 | 3 | PWA-01 | — | index.html < 400KB | automated | `wc -c < index.html` (must be < 409600) | N/A | pending |
| 06-04-01 | 04 | 4 | PWA-01,PWA-05 | T-06-07 | README.md y screenshots/ creados | automated | `test -f README.md && test -f screenshots/README.md` | N/A | pending |
| 06-04-02 | 04 | 4 | PWA-01 | T-06-08 | GitHub Pages deploy con SW registrado | automated | `git remote get-url origin 2>/dev/null \| grep "autovaleur-ma"` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- No hay framework de tests que instalar.
- El archivo `index.html` es el unico artefacto — la validacion es manual + Lighthouse CLI si disponible.

*Existing infrastructure covers all phase requirements (manual verification + grep commands).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chrome Android 360px sin overflow horizontal | PWA-05 | No hay Selenium; emulacion en DevTools | DevTools > Responsive > 360px, scroll horizontal must be absent |
| Safari iOS 375px funcional | PWA-05 | Safari no disponible en CI | Probar en dispositivo real o BrowserStack |
| App offline tras primer load | PWA-02 | Requiere SW activo y red real cortada | DevTools > Network > Offline; recargar; verificar carga |
| GitHub Pages URL carga con SW | PWA-01 | Deploy externo; no automatizable localmente | Abrir https://{GITHUB_USER}.github.io/autovaleur-ma/ post-deploy |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [x] Feedback latency < 5 minutes
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
