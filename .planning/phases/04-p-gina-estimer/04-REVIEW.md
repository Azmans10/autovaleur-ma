---
phase: 04-pagina-estimer
reviewed: 2026-04-13T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - index.html
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-04-13
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Phase 04 adds the Estimer page to a vanilla JS/HTML/CSS offline PWA for vehicle valuation in Morocco. The code is generally well-structured with good separation of concerns (Engine, EstimerForm, History, Marketplaces, I18n, Router modules). localStorage usage is appropriate for offline-first data. The i18n system is complete and symmetric between FR and AR for all phase-4 keys.

Two critical issues are present: an XSS vector in `renderBreakdown()` via `tr.innerHTML` with unsanitized i18n lookup values, and an open-redirect / URL injection risk in `Marketplaces.getLinks()` where marketplace URLs are built from CAR_DB strings without validation. Six warnings cover logic correctness: a missing user-facing error notification when `Engine.estimate()` returns null, a silent mileage integer truncation bug, an incorrect range string using a hardcoded separator instead of the i18n key, missing `'use strict'` scope for the top-level ES5 code, a CSS `dir` attribute conflict at page load, and a `Date.now()` collision risk in `History.save()`. Four informational items cover dead code, console.log left in production paths, a magic number, and inconsistent use of `const`/`var`.

---

## Critical Issues

### CR-01: XSS via `innerHTML` in `renderBreakdown()` — unsanitized i18n key lookup

**File:** `index.html:1860-1863`
**Issue:** `tr.innerHTML` is assigned a concatenated string that includes `I18n.t(BREAKDOWN_KEYS[i])`. While `BREAKDOWN_KEYS` is a static array of known keys and the current STRINGS values are plain text, any future addition of HTML-containing strings (already demonstrated by `ios.banner.text` which contains `<strong>` tags) would inject raw HTML into the table without escaping. The pattern sets a dangerous precedent: the same `I18n.t()` function is used for the iOS banner with `data-i18n-html`, meaning contributors may reasonably add markup to any string, including breakdown labels.

Additionally, `row.factor.toFixed(2)` and `formatPrice()` output are inserted into innerHTML. `toFixed` output is safe, but the pattern as a whole creates an easy-to-misuse template.

**Fix:** Replace the `innerHTML` assignment with DOM element creation and `textContent` assignment:
```javascript
function renderBreakdown(breakdown) {
  var tbody = document.getElementById('breakdown-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  breakdown.forEach(function(row, i) {
    var tr = document.createElement('tr');

    var tdLabel = document.createElement('td');
    tdLabel.textContent = I18n.t(BREAKDOWN_KEYS[i]);

    var factorClass = 'factor-neutral';
    if (i > 0) {
      if (row.factor > 1.0)      factorClass = 'factor-up';
      else if (row.factor < 1.0) factorClass = 'factor-down';
    }

    var tdFactor = document.createElement('td');
    tdFactor.className = factorClass;
    tdFactor.textContent = '\u00d7' + row.factor.toFixed(2);

    var tdAmount = document.createElement('td');
    tdAmount.className = factorClass;
    tdAmount.textContent = formatPrice(row.amount_dh, I18n.currentLang);

    tr.appendChild(tdLabel);
    tr.appendChild(tdFactor);
    tr.appendChild(tdAmount);
    tbody.appendChild(tr);
  });
}
```

---

### CR-02: URL injection in `Marketplaces.getLinks()` — `_slug()` does not validate make/model origin

**File:** `index.html:1441-1458`
**Issue:** `Marketplaces.getLinks(make, model, year)` is called with values that come directly from `<select>` DOM elements (lines 1724-1731). Although the select options are generated from `CAR_DB` keys (which are hardcoded strings), the function accepts any arbitrary string. The `_slug()` method strips accents and lowercases, but does not strip URL metacharacters such as `?`, `#`, `&`, `=`, `/`, or null bytes. A value like `"Logan/../../../evil"` would produce a valid-looking but path-traversal URL for Avito and Moteur. The Wandaloo link uses `encodeURIComponent` correctly, but the Avito and Moteur URLs do not encode the slug output.

The immediate risk is low because inputs come from a controlled `<select>`, but if the History module ever replays saved records (Phase 5) and those records are loaded back into `renderMarketplaces()`, a poisoned localStorage entry (e.g., from DevTools or a storage migration bug) could generate a malicious `href` that opens a phishing URL in a new tab (`target="_blank"` is already set on the chips).

**Fix:** Encode the slug output and/or whitelist against CAR_DB before building URLs:
```javascript
getLinks: function(make, model, year) {
  // Validate make and model exist in CAR_DB before building URLs
  if (!CAR_DB[make] || !CAR_DB[make][model]) {
    return { avito: '#', moteur: '#', wandaloo: '#' };
  }
  var slugMake  = encodeURIComponent(this._slug(make));
  var slugModel = encodeURIComponent(this._slug(model));
  var safeYear  = parseInt(year, 10);
  if (isNaN(safeYear)) return { avito: '#', moteur: '#', wandaloo: '#' };

  return {
    avito:    'https://www.avito.ma/sp/voitures/' + slugMake + '-' + slugModel + '-' + safeYear,
    moteur:   'https://www.moteur.ma/fr/voiture/achat-voiture-occasion/marque/' + slugMake + '/modele/' + slugModel + '/',
    wandaloo: 'https://www.wandaloo.com/occasion/voiture-occasion-maroc-annonce.html?q=' + encodeURIComponent(make + ' ' + model + ' ' + safeYear)
  };
}
```

---

## Warnings

### WR-01: Silent failure when `Engine.estimate()` returns `null` — user receives no feedback

**File:** `index.html:1754-1757`
**Issue:** When `Engine.estimate()` returns `null` (e.g., if `condition`, `fuel`, `transmission`, or `city` values do not match DEPRECIATION keys), the submit handler logs a `console.warn` and returns silently. The user sees nothing — the button just stops responding without any error message displayed in the UI. This is a correctness issue because the user cannot know whether the form submission failed or is pending.
```javascript
if (!result) {
  console.warn('AutoValeur — Engine.estimate() retornó null para los parámetros dados');
  return;  // no user-visible feedback
}
```

**Fix:** Display a user-visible error. A minimal fix using the existing error pattern:
```javascript
if (!result) {
  // Show a visible error — reuse mileage-error pattern or add a generic form-error element
  var mileageError = document.getElementById('mileage-error');
  mileageError.hidden = false;  // temporary re-use; ideally a dedicated error element
  console.warn('AutoValeur — Engine.estimate() retornó null');
  return;
}
```
Ideally, add a `<span class="field-error" id="form-error" hidden data-i18n="estimer.form.error">` element and display it here.

---

### WR-02: Mileage parsed with `parseInt` — decimal input silently truncated

**File:** `index.html:1728`
**Issue:** `parseInt(mileageRaw, 10)` truncates decimal input without error. A user entering `85000.5` gets `mileage = 85000` silently. The validation at line 1736 checks `isNaN(mileage) || mileage <= 0`, but `parseInt("abc123")` returns `NaN` correctly — however `parseInt("123abc")` returns `123` silently (e.g., "85000km" typed by a user becomes `85000`). The `type="number"` input prevents this in most browsers, but `parseInt` on the raw string value bypasses browser validation for the `NaN` check.

More importantly, the validation accepts `mileage = 0` only if `mileageRaw` is empty (first condition handles empty string). But `parseInt("0")` returns `0`, which passes `isNaN` but fails `mileage <= 0` — so `0` km is correctly rejected. However `mileageRaw = "0.5"` gives `parseInt = 0` which IS `<= 0`, triggering an error even though `0.5` is a valid-ish input. The inconsistency between `parseInt` and `parseFloat` (which would match the `type="number"` semantics) is a correctness mismatch.

**Fix:** Use `parseFloat` or `Number()` to be consistent with the `type="number"` input, then apply `Math.floor()` if integer km is required:
```javascript
var mileage = Math.floor(Number(mileageRaw));
// validation: !mileageRaw || isNaN(mileage) || mileage <= 0
```

---

### WR-03: Result range text uses hardcoded `' – '` separator instead of the i18n `result.range` string

**File:** `index.html:1790-1793`
**Issue:** `rangeEl.textContent` is built by concatenating two `formatPrice()` calls with a hardcoded `' – '` (EN DASH) separator:
```javascript
rangeEl.textContent =
  formatPrice(result.price_range.min, I18n.currentLang) +
  ' – ' +
  formatPrice(result.price_range.max, I18n.currentLang);
```
However, `STRINGS.fr` has `'result.range': 'Fourchette\u00a0: {min}\u00a0–\u00a0{max}'` (line 927) and `STRINGS.ar` has `'result.range': '\u0627\u0644\u0646\u0637\u0627\u0642: {min} \u2013 {max}'` (line 994). The i18n key provides a language-aware label prefix ("Fourchette" in FR, "النطاق" in AR) that is entirely lost. In AR mode the range will display without any label prefix — just two prices with a dash.

**Fix:**
```javascript
if (rangeEl) {
  var minStr = formatPrice(result.price_range.min, I18n.currentLang);
  var maxStr = formatPrice(result.price_range.max, I18n.currentLang);
  rangeEl.textContent = I18n.t('result.range')
    .replace('{min}', minStr)
    .replace('{max}', maxStr);
}
```

---

### WR-04: `'use strict'` is declared inside a function but the module-level code runs without it

**File:** `index.html:867`
**Issue:** The `'use strict'` directive at line 867 is placed at the top level of the `<script>` block but **after** the IIFE on lines 859-865 (the early `dir`/`lang` flash-prevention code). In browsers, `'use strict'` at the top level of a classic (non-module) script does apply to the rest of the script — but the IIFE on lines 859-865 runs before the directive is encountered and is therefore not in strict mode. This means the IIFE's `var lang = localStorage.getItem('lang')` and the `if` block run without strict mode protections.

More importantly: `const` and arrow functions are used in the Router object (lines 1646, 1653, 1660, 1668, 1693) while `var` is used throughout the rest of the file. This mixed ES5/ES6 style is inconsistent and will confuse future contributors about the intended compatibility baseline.

**Fix:** Move `'use strict'` to the very first statement inside the script (before the IIFE), or wrap all code in a single IIFE that starts with `'use strict'`. Decide on ES5 or ES6+ as the baseline and apply it consistently.

---

### WR-05: `History.save()` uses `Date.now()` as unique ID — collision possible in rapid saves

**File:** `index.html:1601`
**Issue:** `id: Date.now()` produces millisecond-precision timestamps. Two rapid calls to `History.save()` within the same millisecond (possible in automated testing, or if the form is submitted via keyboard Enter in rapid succession) will generate duplicate IDs. Phase 5 plans to use these IDs for `delete()` and `clear()` operations, so duplicate IDs would cause silent deletion of the wrong record.

**Fix:** Use a counter or a UUID-like approach:
```javascript
id: Date.now() + '_' + Math.random().toString(36).slice(2, 9),
```
Or maintain a monotonic counter:
```javascript
id: Date.now() + '_' + (History._counter = (History._counter || 0) + 1),
```

---

### WR-06: CSS `dir` attribute flash not fully prevented — `lang` stored but `dir` not stored

**File:** `index.html:858-865`
**Issue:** The early inline script reads `localStorage.getItem('lang')` and sets both `document.documentElement.lang` and `document.documentElement.dir` to prevent a LTR→RTL layout flash. However, `I18n.setLang()` (line 1038) stores only `'lang'` to localStorage. On the next page load, the early script correctly derives `dir` from `lang`. This is functional today.

The risk: if a developer later adds a third language or changes the `lang → dir` mapping inside `I18n.setLang()` but forgets to update the early script, the flash prevention will break silently. The early script and `I18n.setLang()` duplicate the `lang → dir` mapping logic without a single source of truth.

**Fix:** Add a comment pairing both locations explicitly:
```javascript
// IMPORTANT: This early-script dir mapping MUST stay in sync with I18n.setLang() below.
// Both use: 'ar' → 'rtl', anything else → 'ltr'.
```
A structural fix would store `'dir'` to localStorage alongside `'lang'` in `I18n.setLang()` and read it directly in the early script, eliminating the duplicated mapping.

---

## Info

### IN-01: `console.log` statements left in production code paths

**File:** `index.html:1878, 1890, 1912, 1916`
**Issue:** Four `console.log`/`console.warn` calls are reachable in production:
- Line 1878: `'AutoValeur MA — i18n + Router + EstimerForm inicializados'` — runs on every page load for all users.
- Line 1890: SW registration success log.
- Line 1912: `'AutoValeur — Install prompt capturado (Android)'`.
- Line 1916: `'AutoValeur — App instalada correctamente'`.

The test suite (lines 1329-1410) is correctly guarded with `location.hostname === 'localhost'`.

**Fix:** Remove or wrap production logs in a `DEBUG` flag, consistent with the dev-only guard already used for tests:
```javascript
var DEBUG = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
// then: if (DEBUG) console.log(...)
```

---

### IN-02: Age label in breakdown is hardcoded French string in `Engine.estimate()`

**File:** `index.html:1308`
**Issue:** The `breakdown` array hardcodes French labels as plain strings:
```javascript
{ label: 'Age (' + age + ' ans)', ...}
```
These labels are never used to render the table — `renderBreakdown()` instead uses `BREAKDOWN_KEYS[i]` (line 1861). So the `label` field in the breakdown object is dead data: set in `Engine.estimate()`, stored to `History`, but never read by the UI. Future code reading `record.breakdown[i].label` from History (Phase 5) would get French-only labels regardless of UI language.

**Fix:** Remove the `label` field from the breakdown rows in `Engine.estimate()` since it is unused by `renderBreakdown()`, or replace it with a i18n key string:
```javascript
{ key: 'result.breakdown.age', factor: f_age, amount_dh: ... }
```

---

### IN-03: Magic number `250` in `btn-new-estimate` setTimeout

**File:** `index.html:1829`
**Issue:** `setTimeout(function() { resultSection.hidden = true; }, 250)` uses a magic number that must match the CSS transition duration defined as `var(--transition-normal): 0.25s` (line 79). If the CSS variable is ever updated, the JS timeout will be out of sync (the element will be hidden before or after the animation completes), without any visible connection between the two values.

**Fix:** Define the duration as a named constant at the top of the script block:
```javascript
var RESULT_TRANSITION_MS = 250; // Must match --transition-normal CSS variable (0.25s)
// ...
setTimeout(function() { resultSection.hidden = true; }, RESULT_TRANSITION_MS);
```

---

### IN-04: Unused `data-i18n-html` attribute on iOS banner conflicts with `_applyTranslations()`

**File:** `index.html:847, 1054-1057`
**Issue:** The iOS banner `<span>` at line 847 has both `data-i18n="ios.banner.text"` and `data-i18n-html` attributes. The `_applyTranslations()` function checks `el.hasAttribute('data-i18n-html')` to decide whether to use `innerHTML` with `{icon}` replacement. The corresponding STRINGS for both `fr` and `ar` contain `{icon}` and `<strong>` tags, so this is intentional.

However, the `data-i18n-html` marker is also the attribute that gates all innerHTML usage in the system. Any future string added with an `{icon}` placeholder but without `data-i18n-html` would silently display the literal `{icon}` text. Conversely, marking any element `data-i18n-html` would allow a string contributor to inject arbitrary HTML. There is no allowlist for which keys are permitted to have HTML content.

**Fix:** Document the convention explicitly in a comment near `_applyTranslations()`, and consider validating at init time that only the specific banner key has HTML content:
```javascript
// SECURITY NOTE: data-i18n-html bypasses XSS protection. Only keys listed here
// are permitted to contain HTML: ['ios.banner.text']
var HTML_ALLOWED_KEYS = ['ios.banner.text'];
// In _applyTranslations: assert HTML_ALLOWED_KEYS.indexOf(key) !== -1 before innerHTML
```

---

_Reviewed: 2026-04-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
