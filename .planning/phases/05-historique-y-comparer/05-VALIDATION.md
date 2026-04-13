---
phase: 5
slug: historique-y-comparer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Tests inline condicionales (`if (location.hostname === 'localhost')`) — mismo patrón de Fase 3 |
| **Config file** | No aplica — tests embebidos en `index.html` |
| **Quick run command** | Abrir `index.html` en browser local + revisar DevTools Console |
| **Full suite command** | Inspección visual manual + consola DevTools (todos los `console.assert` deben pasar sin errores) |
| **Estimated runtime** | ~60 segundos |

---

## Sampling Rate

- **After every task commit:** Abrir `index.html` en localhost y revisar consola — sin errores `assert`
- **After every plan wave:** Ejecutar inspección visual completa + todos los tests inline
- **Before `/gsd-verify-work`:** Suite completa verde (0 assert failures en consola)
- **Max feedback latency:** 60 segundos

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | HIST-03 | — | `remove(id)` usa `textContent`, no innerHTML | Unit inline | Consola: `History.save({...}); History.remove(id); console.assert(History.getAll().length===0)` | ❌ Wave 0 | ⬜ pending |
| 05-01-02 | 01 | 1 | HIST-04 | — | `clear()` sobreescribe con `[]`, no concatena | Unit inline | Consola: `History.clear(); console.assert(History.getAll().length===0)` | ❌ Wave 0 | ⬜ pending |
| 05-02-01 | 02 | 1 | HIST-01, HIST-02 | — | Datos de usuario via `textContent` (XSS) | UI visual | Inspección manual: navegar a `#historique` con 2+ entradas | ❌ Wave 0 | ⬜ pending |
| 05-02-02 | 02 | 1 | HIST-03 | — | Botón × invoca remove y re-renderiza sin reload | UI visual | Click × → verificar tarjeta desaparece | ❌ Wave 0 | ⬜ pending |
| 05-03-01 | 03 | 1 | HIST-05 | — | Estado vacío visible cuando array vacío | UI visual | Limpiar historial → verificar empty-state visible | ❌ Wave 0 | ⬜ pending |
| 05-03-02 | 03 | 1 | HIST-04 | — | Flujo 2 pasos: confirmar antes de clear | UI visual | Click "Effacer tout" → verificar estado confirmar; Click 2 → verificar clear | ❌ Wave 0 | ⬜ pending |
| 05-04-01 | 04 | 2 | COMP-01 | — | Selects poblados desde `History.getAll()` | UI visual | Navegar `#comparer` con 2+ entradas → verificar options en selects | ❌ Wave 0 | ⬜ pending |
| 05-04-02 | 04 | 2 | COMP-05 | — | Mensaje orientativo si < 2 valoraciones | UI visual | Historial vacío → `#comparer` → verificar mensaje | ❌ Wave 0 | ⬜ pending |
| 05-05-01 | 05 | 2 | COMP-03 | — | Barra del coche más caro = 100% width | UI visual | Seleccionar 2 coches → verificar barra CSS proporcional | ❌ Wave 0 | ⬜ pending |
| 05-05-02 | 05 | 2 | COMP-04 | — | Ganador: clase `.compare-winner` + badge | Unit inline + UI visual | Consola: verificar lógica `determineWinner()`; UI: borde verde + badge visible | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `index.html` — Añadir bloque de tests inline en el bloque `if (location.hostname === 'localhost')` existente:

```javascript
// === Tests History (Fase 5) — añadir a bloque localhost existente ===
(function testHistory() {
  console.log('=== Tests History (Fase 5) ===');

  History.clear();
  console.assert(History.getAll().length === 0, 'FAIL: clear() debe dejar array vacío');

  History.save({ make: 'Dacia', model: 'Logan', year: 2019, mileage: 85000,
                 condition: 'bon', fuel: 'diesel', transmission: 'manuelle', city: 'Casablanca',
                 estimated_price: 58500, price_range: { min: 52700, max: 64400 }, breakdown: [] });
  var all = History.getAll();
  console.assert(all.length === 1, 'FAIL: getAll() debe retornar 1 entrada tras save()');

  var id = all[0].id;
  History.remove(id);
  console.assert(History.getAll().length === 0, 'FAIL: remove(id) debe eliminar la entrada');

  History.save({ make: 'BMW', model: 'Serie 3', year: 2018, mileage: 120000,
                 condition: 'moyen', fuel: 'diesel', transmission: 'automatique', city: 'Rabat',
                 estimated_price: 95000, price_range: { min: 85500, max: 104500 }, breakdown: [] });
  History.save({ make: 'Kia', model: 'Picanto', year: 2022, mileage: 25000,
                 condition: 'excellent', fuel: 'essence', transmission: 'manuelle', city: 'Marrakech',
                 estimated_price: 72000, price_range: { min: 64800, max: 79200 }, breakdown: [] });
  History.clear();
  console.assert(History.getAll().length === 0, 'FAIL: clear() con 2 entradas debe dejar array vacío');

  console.log('=== Tests History Fase 5: OK ===');
})();

// === Tests i18n keys (Fase 5) ===
(function testI18nKeys() {
  var fase5Keys = [
    'historique.empty', 'historique.clear', 'historique.confirm_clear', 'historique.delete',
    'date.today', 'date.days_ago', 'date.weeks_ago',
    'comparer.empty', 'comparer.select_a', 'comparer.select_b', 'comparer.winner_badge'
  ];
  ['fr', 'ar'].forEach(function(lang) {
    fase5Keys.forEach(function(key) {
      var parts = key.split('.');
      var val = STRINGS[lang];
      parts.forEach(function(p) { val = val && val[p]; });
      console.assert(val, 'FAIL: STRINGS.' + lang + '.' + key + ' no existe');
    });
  });
  console.log('=== Tests i18n keys Fase 5: OK ===');
})();
```

*Nota: Los tests se ejecutan automáticamente al cargar `index.html` en localhost. No requieren comando externo.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Layout tarjetas: marca/modelo/año en grande, precio destacado, km y fecha muted | HIST-02 | Requiere inspección visual del CSS renderizado | Navegar `#historique` con ≥1 entrada, verificar jerarquía tipográfica |
| Botón "Effacer tout" reset automático en 3s | HIST-04 | Requiere timing manual | Click "Effacer tout" → esperar 3s sin confirmar → verificar que vuelve al estado original |
| Barras proporcionales de precio animadas | COMP-03 | Requiere inspección visual de animación CSS | Seleccionar 2 coches → verificar transición suave `width 0.3s` |
| RTL: layout correcto en árabe | HIST-01, COMP-01 | Requiere cambio de idioma y verificación visual | Cambiar a árabe → navegar Historique y Comparer → verificar alineación RTL |
| Re-render al navegar: historial actualizado | HIST-01 | Requiere flujo entre páginas | Estimar → `#historique` → verificar nueva entrada aparece sin recargar |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
