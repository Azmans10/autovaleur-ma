---
phase: 02-internacionalizaci-n-fr-ar
plan: 03
subsystem: i18n-toggle
tags: [i18n, pill-toggle, header, fr, ar, accessibility]
dependency_graph:
  requires: [STRINGS-object, I18n-module]
  provides: [lang-toggle-button]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [pill-toggle-pattern, flex-header-layout, onclick-i18n-binding]
key_files:
  created: []
  modified: [index.html]
decisions:
  - Bilingual aria-label (French + Arabic) since the button must be accessible regardless of active language
  - FR default active class matches I18n default language (fr)
  - Button uses inline onclick calling I18n.setLang() which already handles .lang-option active class toggling
metrics:
  duration: 83s
  completed: "2026-04-11"
  tasks_completed: 1
  tasks_total: 1
  files_touched: 1
requirements:
  - I18N-03
  - I18N-04
---

# Phase 2 Plan 3: Pill Toggle FR/AR Button Summary

Pill toggle button in header for language switching between French and Arabic, with flex layout header and visual active-state highlighting via CSS.

## What Was Done

### Task 1: Add pill toggle FR/AR to header HTML + CSS + header flex

Made 3 changes to index.html:

1. **Header flex layout (D-04):** Added `display: flex; justify-content: space-between; align-items: center;` to `.app-header` CSS rule. Title stays left, toggle goes right.

2. **Pill toggle CSS:** New `.lang-toggle`, `.lang-option`, `.lang-option.active` rules inserted after `.app-title`. Active language gets `background: var(--primary)` + `color: white`. Toggle uses `border-radius: var(--radius-lg)` for pill shape with `overflow: hidden`.

3. **Button HTML:** Added `<button class="lang-toggle">` inside header after `<h1>`. Contains two `<span class="lang-option" data-lang="fr|ar">` elements. The `onclick` calls `I18n.setLang()` with toggled language. Bilingual `aria-label="Changer la langue / تغيير اللغة"` for keyboard accessibility.

**Key link verified:** `.lang-toggle click` -> `I18n.setLang()` -> `localStorage.setItem('lang')` chain is complete. The I18n module (Plan 02) already handles updating `.lang-option` active classes via `document.querySelectorAll('.lang-option')`.

**Commit:** `708200d`

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Expected | Actual |
|-------|----------|--------|
| `lang-toggle` count | 2 (CSS + HTML) | 2 |
| `lang-option` count | >=4 | 5 |
| `.app-header` has `display: flex` | yes | yes |
| `justify-content: space-between` | >=1 | 1 |
| `onclick="I18n.setLang"` count | 1 | 1 |
| `data-lang="fr"` count | 1 | 1 |
| `data-lang="ar"` count | 1 | 1 |
| `aria-label="Changer la langue"` | 1 | 1 |
| `.lang-option.active` has primary bg | yes | yes |
| Button inside `<header>` | yes | yes |

## Known Stubs

None -- pill toggle is fully functional, wired to I18n.setLang() from Plan 02.

## Self-Check: PASSED

- [x] index.html exists with lang-toggle button and CSS
- [x] Commit 708200d exists
- [x] 02-03-SUMMARY.md created
