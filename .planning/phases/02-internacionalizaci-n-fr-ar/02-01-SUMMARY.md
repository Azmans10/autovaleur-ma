---
phase: 02-internacionalizaci-n-fr-ar
plan: 01
subsystem: i18n-strings
tags: [i18n, strings, fr, ar, translations]
dependency_graph:
  requires: []
  provides: [STRINGS-object]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [flat-strings-object, dot-notation-keys, unicode-escapes]
key_files:
  created: []
  modified: [index.html]
decisions:
  - Unicode escapes for Arabic strings to avoid encoding issues in single-file HTML
  - Dot-notation keys (nav.estimer, page.estimer.title) for hierarchical organization
  - {icon} placeholder in ios.banner.text for SVG injection by I18n module (Plan 02)
metrics:
  duration: 88s
  completed: "2026-04-11"
  tasks_completed: 1
  tasks_total: 1
  files_touched: 1
requirements:
  - I18N-01
---

# Phase 2 Plan 1: STRINGS Object (fr/ar translations) Summary

Centralized i18n STRINGS object with 12 keys per language (fr/ar) covering all Phase 1 UI texts: nav labels, aria-labels, page titles, and iOS install banner.

## What Was Done

### Task 1: Insert STRINGS object with fr and ar translations

Inserted `var STRINGS = { fr: {...}, ar: {...} }` into the `<script>` block of index.html, immediately after `'use strict';` and before the Router code.

**Keys covered (12 per language):**
- `nav.estimer`, `nav.historique`, `nav.comparer` -- bottom nav labels
- `nav.aria.main`, `nav.aria.estimer`, `nav.aria.historique`, `nav.aria.comparer` -- aria-labels
- `page.estimer.title`, `page.historique.title`, `page.comparer.title` -- h2 page titles
- `ios.banner.text` -- iOS install banner (contains HTML `<strong>` and `{icon}` placeholder)
- `ios.banner.close` -- iOS banner close button aria-label

**Excluded per decisions:**
- "AutoValeur MA" (D-06: brand name, invariant)
- Phase 4/5 placeholder texts (D-08: not translated)

**Commit:** `0327316` -- feat(02-01): add STRINGS object with fr/ar translations for Phase 1 texts

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

| Check | Expected | Actual |
|-------|----------|--------|
| `var STRINGS` count | 1 | 1 |
| `nav.estimer` count (fr+ar) | >=2 | 2 |
| `ios.banner.text` count (fr+ar) | 2 | 2 |
| `ios.banner.close` count (fr+ar) | 2 | 2 |
| `page.comparer.title` count | 2 | 2 |
| AutoValeur inside STRINGS | 0 | 0 |
| fr keys count | 12 | 12 |
| ar keys count | 12 | 12 |
| STRINGS before Router | yes | yes |

## Known Stubs

None -- STRINGS object is complete data, not stubs.

## Self-Check: PASSED

- [x] index.html modified with STRINGS object
- [x] Commit 0327316 exists
- [x] All 12 keys present in both fr and ar
- [x] No AutoValeur in STRINGS block
