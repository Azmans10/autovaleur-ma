---
phase: 02-internacionalizaci-n-fr-ar
plan: 02
subsystem: i18n-engine
tags: [i18n, data-i18n, translation-engine, rtl, fouc-prevention]
dependency_graph:
  requires: [STRINGS-object]
  provides: [I18n-module, data-i18n-attributes]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [data-i18n-attributes, singleton-module, early-iife-fouc-prevention, innerhtml-flag]
key_files:
  created: []
  modified: [index.html]
decisions:
  - Early IIFE outside 'use strict' to set dir/lang before DOM parse prevents RTL layout shift
  - SVG icon injected via {icon} placeholder replacement in _applyTranslations for iOS banner
  - localStorage lang value validated with strict equality (only 'ar' accepted, everything else defaults to 'fr')
  - data-i18n-html flag attribute (no value) distinguishes innerHTML vs textContent targets
metrics:
  duration: 566s
  completed: "2026-04-11"
  tasks_completed: 2
  tasks_total: 2
  files_touched: 1
requirements:
  - I18N-01
  - I18N-02
---

# Phase 2 Plan 2: I18n Module + data-i18n Attributes Summary

I18n translation engine with t()/setLang()/_applyTranslations()/init() plus data-i18n attribute annotations on all 12 translatable HTML elements, with early IIFE for RTL FOUC prevention.

## What Was Done

### Task 1: Add data-i18n and data-i18n-aria attributes to translatable HTML elements

Added translation marker attributes to all 12 translatable elements without changing visible text (French remains default):

- 3 page h2 titles: `data-i18n="page.estimer.title"`, `page.historique.title`, `page.comparer.title`
- 3 nav span labels: `data-i18n="nav.estimer"`, `nav.historique`, `nav.comparer`
- 4 nav aria-labels: `data-i18n-aria="nav.aria.main"` (nav container), plus 3 button aria-labels
- 1 iOS banner text: `data-i18n="ios.banner.text" data-i18n-html` (flag for innerHTML)
- 1 iOS banner close: `data-i18n-aria="ios.banner.close"`

h1 "AutoValeur MA" intentionally left without data-i18n (D-06: brand invariant).

**Commit:** `f9d8405`

### Task 2: Implement I18n module in index.html script

Inserted three code blocks into the script section:

1. **Early IIFE** (before `'use strict'`): Reads localStorage('lang'), sets `document.documentElement.dir='rtl'` and `.lang='ar'` if saved language is Arabic. Prevents layout FOUC on page load.

2. **I18n module** (after STRINGS, before Router):
   - `t(key)`: Resolves translation from STRINGS[currentLang][key], returns key itself on miss (fail visible)
   - `setLang(lang)`: Validates lang exists in STRINGS, updates dir/lang/localStorage, calls _applyTranslations, updates pill toggle class
   - `_applyTranslations()`: Iterates `[data-i18n]` elements (textContent or innerHTML based on data-i18n-html flag), iterates `[data-i18n-aria]` elements (sets aria-label). For innerHTML targets, replaces `{icon}` placeholder with inline SVG.
   - `init()`: Reads localStorage, validates (only 'ar' accepted, else 'fr'), calls setLang

3. **DOMContentLoaded modification**: `I18n.init()` inserted before `Router.init()` so translations are applied before pages are shown.

**Commit:** `18af0ac`

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Expected | Actual |
|-------|----------|--------|
| `data-i18n="page.*"` count | 3 | 3 |
| `data-i18n="nav.*"` count | 3 | 3 |
| `data-i18n-aria="nav.*"` count | 4 | 4 |
| `data-i18n="ios.*"` count | 1 | 1 |
| `data-i18n-html` count | 1 | 1 |
| `data-i18n-aria="ios.*"` count | 1 | 1 |
| `var I18n` count | 1 | 1 |
| I18n.init() before Router.init() | yes (lower line) | yes (682 vs 683) |
| `document.documentElement.dir` count | >=2 | 2 |
| `document.documentElement.lang` count | >=2 | 2 |
| `localStorage.setItem` lang count | 1 | 1 |
| `localStorage.getItem` lang count | >=2 | 2 |
| Early IIFE before 'use strict' | yes | yes (line 490 vs 497) |
| AutoValeur MA has data-i18n | no | no (correct) |

## Known Stubs

None -- I18n module is fully functional with all methods implemented.

## Self-Check: PASSED

- [x] index.html exists with data-i18n attributes and I18n module
- [x] Commit f9d8405 exists (Task 1: data-i18n attributes)
- [x] Commit 18af0ac exists (Task 2: I18n module)
