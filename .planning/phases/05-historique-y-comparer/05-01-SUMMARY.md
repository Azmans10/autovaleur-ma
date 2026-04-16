---
phase: 05-historique-y-comparer
plan: "01"
subsystem: history-module
tags: [history, i18n, localStorage, tests-inline]
dependency_graph:
  requires: []
  provides: [History.remove, History.clear, i18n-fase5-keys]
  affects: [index.html]
tech_stack:
  added: []
  patterns: [try-catch-localStorage, inline-tests-iife, flat-plus-nested-strings]
key_files:
  created: []
  modified:
    - index.html
decisions:
  - "Claves i18n de Fase 5 añadidas como objetos anidados (historique:{}, comparer:{}, date:{}) dentro de STRINGS.fr y STRINGS.ar, preservando las claves planas existentes de Fases 1-4"
  - "Tests inline ubicados dentro del bloque if(location.hostname==='localhost') existente, después del bloque de tests del Engine de Fase 3"
metrics:
  duration: "~10min"
  completed_date: "2026-04-16T16:10:59Z"
  tasks_completed: 2
  files_modified: 1
requirements_satisfied: [HIST-03, HIST-04]
---

# Phase 05 Plan 01: History.remove + History.clear + i18n Fase 5 Summary

**One-liner:** `History.remove(id)` y `History.clear()` con try/catch + 11 claves i18n fr/ar para Historique y Comparer, con tests inline IIFE que validan comportamiento en localhost.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | History.remove(id) + History.clear() + claves i18n | 820e952 | index.html |
| 2 | Tests inline Fase 5 en bloque localhost | 820e952 | index.html |

## What Was Built

### History.remove(id) — línea 1752 de index.html

```javascript
remove: function(id) {
  var all = History.getAll();
  var filtered = all.filter(function(entry) {
    return entry.id !== id;
  });
  try {
    localStorage.setItem(History._KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('AutoValeur — no se pudo actualizar historial:', e.message);
  }
  return filtered;
},
```

### History.clear() — línea 1769 de index.html

```javascript
clear: function() {
  try {
    localStorage.setItem(History._KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('AutoValeur — no se pudo limpiar historial:', e.message);
  }
  return [];
}
```

El módulo `var History` ahora tiene 4 métodos: `save`, `getAll`, `remove`, `clear`.

### Claves i18n añadidas

En `STRINGS.fr` (después de `result.new_estimate`):

| Clave | Valor |
|-------|-------|
| `historique.empty` | `'Aucune estimation enregistrée'` |
| `historique.clear` | `'Effacer tout'` |
| `historique.confirm_clear` | `'Confirmer ?'` |
| `historique.delete` | `'Supprimer'` |
| `comparer.empty` | `'Comparez 2 estimations'` |
| `comparer.empty_body` | `'Ajoutez au moins 2 estimations pour comparer'` |
| `comparer.select_a` | `'Choisir véhicule A'` |
| `comparer.select_b` | `'Choisir véhicule B'` |
| `comparer.winner_badge` | `'Meilleur rapport'` |
| `date.today` | `"Aujourd'hui"` |
| `date.days_ago` | `'Il y a {n} jour(s)'` |
| `date.weeks_ago` | `'Il y a {n} semaine(s)'` |

En `STRINGS.ar`: mismas 12 claves con texto en árabe (unicode escapado). Valores clave: `date.today = 'اليوم'`, `comparer.winner_badge = 'أفضل عرض'`.

### Tests inline añadidos — líneas 1522–1568 de index.html

Dentro del bloque `if (location.hostname === 'localhost' || location.hostname === '127.0.0.1')`:

**testHistoryFase5** (4 console.assert):
1. `History.clear()` deja array vacío
2. `History.getAll().length === 1` tras `save()`
3. `History.remove(id)` elimina la entrada correcta
4. `History.clear()` con 2 entradas deja array vacío

**testI18nKeysFase5** (24 console.assert = 12 keys × 2 idiomas):
- Verifica los 12 keys de Fase 5 en `fr` y `ar` usando acceso anidado por split('.')

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito.

## Known Stubs

None — no hay datos hardcodeados ni placeholders. Los métodos operan sobre localStorage real.

## Threat Flags

None — todos los threats del plan están mitigados:
- T-05-01-01: `remove()` llama `getAll()` que ya tiene try/catch; si localStorage está corrompido, filter opera sobre [] y sobreescribe con array válido
- T-05-01-02: id comparado con `!==` sin eval ni interpretación
- T-05-01-03: try/catch en ambos métodos captura QuotaExceededError con console.warn silencioso

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| index.html exists | FOUND |
| 05-01-SUMMARY.md exists | FOUND |
| commit 820e952 exists | FOUND |
| History.remove in index.html | 1 occurrence |
| History.clear in index.html | 1 occurrence |
| testHistoryFase5 in index.html | 1 occurrence |
| testI18nKeysFase5 in index.html | 1 occurrence |
