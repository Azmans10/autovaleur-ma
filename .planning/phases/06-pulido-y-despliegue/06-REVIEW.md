---
phase: 06-pulido-y-despliegue
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - index.html
  - manifest.json
  - sw.js
  - README.md
  - screenshots/README.md
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the complete single-file PWA (`index.html`, `sw.js`, `manifest.json`, `README.md`, `screenshots/README.md`). The application is architecturally solid: vanilla JS, no eval, no user data injected via innerHTML, proper XSS-safe DOM construction throughout, localStorage errors are caught and surfaced. No critical security vulnerabilities were found.

Four warnings require attention before production deployment: an undefined CSS custom property that causes missing border-radius on comparison cards, a SW precache failure scenario where `skipWaiting()` fires before the cache is confirmed populated, a broken fetch fallback that can return `undefined` to the browser, and a deprecated manifest icon `purpose` string. Four info-level items round out the report.

---

## Warnings

### WR-01: Undefined CSS custom property `--radius-md` on `.compare-card`

**File:** `index.html:794`
**Issue:** `.compare-card` uses `border-radius: var(--radius-md)` but `--radius-md` is never defined in `:root`. Only `--radius` (12px), `--radius-sm` (6px), and `--radius-lg` (20px) are declared. When a `var()` reference is unresolved the browser falls back to the property's initial value, which for `border-radius` is `0` — so comparison cards render with sharp corners instead of rounded ones.
**Fix:** Add the missing token to `:root`, or replace the reference with an existing token:

```css
/* Option A: define the missing token */
:root {
  /* ... existing tokens ... */
  --radius-md: 8px;
}

/* Option B: replace the reference (line 794) */
.compare-card {
  border-radius: var(--radius); /* 12px — matches other cards */
}
```

---

### WR-02: `skipWaiting()` called before precache completes — new SW activates with empty cache on failure

**File:** `sw.js:30`
**Issue:** `self.skipWaiting()` is called synchronously at the top of the `install` handler, outside of `event.waitUntil()`. If `cache.addAll(PRECACHE_URLS)` subsequently rejects (e.g., one asset 404s on first deploy), the install promise resolves as failed — but `skipWaiting()` has already fired. The new SW activates and claims clients while `PRECACHE_URLS` were never actually cached. On the next fetch the cache is empty and if the network is also unavailable the fallback `caches.match('/autovaleur-ma/index.html')` at line 83 returns `undefined`.

**Fix:** Move `skipWaiting()` inside the `waitUntil` chain so it only fires after the precache succeeds:

```js
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting(); // only fires if precache succeeded
    })
  );
});
```

---

### WR-03: Fetch fallback can resolve to `undefined` when offline and cache is cold

**File:** `sw.js:81-84`
**Issue:** The `catch` block in the fetch handler returns `caches.match('/autovaleur-ma/index.html')`. `caches.match()` resolves to `undefined` when the key is not found (not a rejection). If the SW is in an intermediate state where `index.html` has not yet been cached (e.g., immediately after WR-02 scenario, or if the cache was cleared externally), `event.respondWith(undefined)` causes the browser to treat the request as failed with a network error — worse than a 404 and potentially triggers a blank white screen.

**Fix:** Chain a hard fallback after the cache match:

```js
}).catch(function() {
  return caches.match('/autovaleur-ma/index.html').then(function(cached) {
    if (cached) return cached;
    // Last resort: return a minimal offline response
    return new Response(
      '<html><body><p>Application hors-ligne — veuillez réessayer.</p></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  });
});
```

---

### WR-04: Deprecated `"purpose": "any maskable"` combined value in manifest

**File:** `manifest.json:22`
**Issue:** The 192×192 icon entry uses `"purpose": "any maskable"` as a space-separated combined string. This format was deprecated in the Web App Manifest spec. Current browsers and Lighthouse expect two separate icon entries — one with `"purpose": "any"` and one with `"purpose": "maskable"`. Using the old combined string generates a Lighthouse warning and may cause the maskable icon to be ignored on some platforms, falling back to a non-masked display that crops the icon in circle/squircle launchers.

**Fix:** Split into two separate entries:

```json
{
  "src": "icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any"
},
{
  "src": "icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "maskable"
}
```

---

## Info

### IN-01: Production `console.log` statement left in init code

**File:** `index.html:2772`
**Issue:** `console.log('AutoValeur MA — i18n + Router + EstimerForm inicializados')` fires on every page load in production. The engine tests (lines 1710–1867) are correctly guarded with a `localhost` check, but this init log is not. Minor noise in production DevTools that also slightly reveals internal module names.
**Fix:** Remove the log or wrap it in the same localhost guard used for tests:

```js
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('AutoValeur MA — i18n + Router + EstimerForm inicializados');
}
```

---

### IN-02: Dynamic cache `put` has no error handler — silent failures on storage quota exceeded

**File:** `sw.js:76-78`
**Issue:** The fire-and-forget `caches.open(...).then(cache.put(...))` has no `.catch()`. On low-storage devices or when the origin's storage quota is exceeded, this rejects silently. The failure is non-critical (the next request simply goes to the network again), but it cannot be observed or debugged.
**Fix:** Add a `.catch()` to surface the failure in development:

```js
caches.open(CACHE_NAME).then(function(cache) {
  cache.put(event.request, responseClone);
}).catch(function(err) {
  // Non-fatal: dynamic caching failed (quota or permissions)
  // console.warn('SW: dynamic cache put failed', err);
});
```

---

### IN-03: README references screenshot files that do not exist yet

**File:** `README.md:9-11`
**Issue:** The README embeds three image references (`screenshots/estimer.png`, `screenshots/historique.png`, `screenshots/comparer.png`). Only `screenshots/README.md` exists; the actual PNG files are absent. On GitHub Pages and the GitHub repo page these render as broken image placeholders, degrading the project's first impression.
**Fix:** Either capture and add the screenshots before the Phase 06 deployment, or temporarily remove the image references from README.md until the screenshots are ready.

---

### IN-04: Inconsistent use of `const`/`let` vs `var` within the same `<script>` block

**File:** `index.html:2530-2537`
**Issue:** `ROUTES` and `Router` are declared with `const` (ES6) while the rest of the application — `STRINGS`, `I18n`, `CAR_DB`, `DEPRECIATION`, `Engine`, `Marketplaces`, `EstimerForm`, `History`, `ErrorUI`, `Comparer` — all use `var`. This inconsistency suggests an incomplete migration. While functional, it makes the codebase harder to reason about and can confuse contributors about which style to follow.
**Fix:** Choose one style consistently. Given the rest of the file uses `var` and targets broad browser compatibility, the safest choice is to change the two `const` declarations to `var`:

```js
var ROUTES = {
  '':           'estimer',
  'estimer':    'estimer',
  'historique': 'historique',
  'comparer':   'comparer'
};

var Router = {
  navigate: function(page) { ... },
  _show: function() { ... },
  init: function() { ... }
};
```

---

_Reviewed: 2026-04-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
