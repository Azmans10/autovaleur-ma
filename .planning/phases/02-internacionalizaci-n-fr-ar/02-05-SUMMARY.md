---
phase: 02-internacionalizaci-n-fr-ar
plan: 05
subsystem: i18n-fonts-pricing
tags: [i18n, rtl, arabic-fonts, formatPrice, intl-numberformat]
dependency_graph:
  requires: [02-02, 02-03, 02-04]
  provides: [rtl-font-stack, formatPrice-function]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [css-dir-rtl-selector, intl-numberformat-latin-digits, system-font-stack]
key_files:
  created: []
  modified: [index.html]
decisions:
  - "ar-MA-u-nu-latn locale string (Unicode extension) instead of numberingSystem option for compact syntax"
  - "formatPrice as global function (not I18n method) for easy access from future phases"
  - "System fonts only per D-01/D-03: no @font-face, no @import, no base64 embeds"
metrics:
  duration: 63s
  completed: "2026-04-11"
  tasks_completed: 2
  tasks_total: 2
  files_touched: 1
requirements:
  - I18N-02
  - I18N-05
---

# Phase 02 Plan 05: Arabic Font Stack + formatPrice Summary

RTL Arabic system font stack via [dir="rtl"] CSS selector and formatPrice() function using Intl.NumberFormat with ar-MA-u-nu-latn to force latin digits 0-9 in Arabic mode.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add CSS font stack arabe for dir="rtl" and formatPrice function | 6f9a127 | index.html |
| 2 | Visual verification checkpoint (human-verify) | approved | index.html (visual) |

## What Was Done

### Task 1: CSS font stack + formatPrice

Made 2 changes to index.html:

1. **CSS RTL font stack (D-02):** Inserted `[dir="rtl"] { font-family: 'Tahoma', 'Arial', system-ui, sans-serif; }` after `:root` custom properties block and before the reset. This applies Arabic-compatible system fonts to the entire app when `dir="rtl"` is active on the html element. No external fonts downloaded (D-01), no base64 embeds (D-03).

2. **formatPrice function:** Inserted global `formatPrice(amount, lang)` function after the I18n module and before the Router. Uses `Intl.NumberFormat` with:
   - `ar-MA-u-nu-latn` locale for Arabic (forces latin digits 0-9, dot as thousands separator)
   - `fr-MA` locale for French (space as thousands separator)
   - Appends ` DH` currency suffix

**Key behaviors:**
- `formatPrice(65000, 'fr')` returns `"65 000 DH"`
- `formatPrice(65000, 'ar')` returns `"65.000 DH"` (latin digits, not Arabic-Indic)

**Commit:** `6f9a127`

### Task 2: Visual verification checkpoint

User approved ("aprobado") the complete i18n system visual verification. All 5 plans confirmed working: STRINGS dictionary, I18n module, FR/AR pill toggle, logical properties for RTL, Arabic font stack, and formatPrice with latin digits. FR mode displays LTR layout with French labels, AR mode mirrors to RTL with Arabic labels, language persistence works across reload, and formatPrice outputs latin digits in both locales.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `font-family.*Tahoma.*Arial.*system-ui` | 1 match | 1 | PASS |
| `function formatPrice` | 1 match | 1 | PASS |
| `Intl.NumberFormat` | >=1 match | 2 | PASS |
| `ar-MA-u-nu-latn` | 1 match | 1 | PASS |
| `fr-MA` | 1 match | 1 | PASS |
| `DH` in formatPrice | >=1 match | 1 | PASS |
| No `@import` | 0 matches | 0 | PASS |
| No `@font-face` | 0 matches | 0 | PASS |
| No `base64` | 0 matches | 0 | PASS |
| All i18n components present | 5 checks | 5 pass | PASS |

## Known Stubs

None -- formatPrice is fully functional, font stack is complete.

## Threat Flags

None -- no new trust boundaries introduced beyond those documented in the plan's threat model.

## Self-Check: PASSED

- [x] index.html exists with RTL font stack and formatPrice
- [x] Commit 6f9a127 exists
- [x] 02-05-SUMMARY.md created
- [x] Task 2 checkpoint approved by user ("aprobado")
- [x] All 2/2 tasks complete
