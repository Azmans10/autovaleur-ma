# Architecture Research — AutoValeur MA

## Estructura de archivos recomendada

```
autovaleur-ma/
├── index.html        ← app completa (HTML + CSS + JS + datos)
├── sw.js             ← service worker (mínimo, ~20 líneas)
└── manifest.json     ← PWA manifest (o inline en index.html)
```

Tres archivos es el mínimo viable para una PWA real. Todo lo demás va dentro de `index.html`.

## Schema de datos — Base de coches

```js
const CAR_DB = {
  brands: {
    "dacia": {
      name: "Dacia",
      name_ar: "داسيا",
      models: {
        "logan": {
          name: "Logan",
          years: [2005, 2006, ..., 2024],
          base_price: 85000,  // DH, état bon, 0km en año actual
          category: "berline"
        },
        "sandero": {
          name: "Sandero",
          years: [2008, ..., 2024],
          base_price: 90000,
          category: "citadine"
        },
        "duster": {
          name: "Duster",
          years: [2010, ..., 2024],
          base_price: 140000,
          category: "suv"
        }
      }
    },
    "renault": { ... },
    // ... 14 marcas total
  }
};
```

**Precio base** = precio de referencia del modelo nuevo en MA en el año de lanzamiento. El algoritmo de depreciación lo ajusta por edad, km, estado, etc.

## Schema de un registro de historial

```js
{
  id: 1713456789000,           // Date.now() como ID único
  timestamp: "2026-04-11T10:00:00.000Z",
  
  // Inputs
  brand: "dacia",
  brand_name: "Dacia",
  model: "logan",
  model_name: "Logan",
  year: 2019,
  km: 85000,
  fuel: "diesel",              // diesel | essence | hybride | electrique | gpl
  transmission: "manuelle",   // manuelle | automatique
  condition: "bon",            // excellent | tres_bon | bon | passable | mauvais
  city: "casablanca",
  
  // Output
  estimated_price: 58400,
  price_range: { min: 52000, max: 64000 },  // ±10%
  
  // Desglose para transparencia
  breakdown: {
    base_price: 85000,
    age_factor: -0.28,
    age_amount: -23800,
    km_factor: -0.04,
    km_amount: -2460,
    condition_factor: 0,
    condition_amount: 0,
    fuel_factor: 0.06,
    fuel_amount: 3540,
    city_factor: 0.08,
    city_amount: 4540,
    transmission_factor: 0,
    transmission_amount: 0
  }
}
```

## Arquitectura de módulos (IIFE pattern)

```js
const AutoValeur = (() => {
  'use strict';

  // ── DATOS ──────────────────────────────────────────────
  const DB = { /* CAR_DB inline */ };
  
  const DEPRECIATION = {
    age: [1, 0.85, 0.78, 0.72, 0.67, 0.63, 0.59, 0.56, 0.53, 0.50, 0.47, 0.43, 0.43, 0.38, 0.38, 0.38],
    km_per_year: 15000,
    km_factor: (km, age) => {
      const expected = age * 15000;
      const deviation = (km - expected) / Math.max(expected, 1);
      return Math.min(1.10, Math.max(0.75, 1 - deviation * 0.15));
    },
    condition: { excellent: 1.08, tres_bon: 1.04, bon: 1.00, passable: 0.92, mauvais: 0.82 },
    fuel: { diesel: 1.06, essence: 1.00, hybride: 1.08, electrique: 1.05, gpl: 0.95 },
    transmission: { manuelle: 1.00, automatique: 1.07 },
    city: {
      casablanca: 1.08, rabat: 1.05, marrakech: 1.03, tanger: 1.02,
      fes: 1.00, agadir: 0.98, meknes: 0.97, oujda: 0.93, laayoune: 0.95, other: 1.00
    }
  };

  // ── MOTOR DE VALORACIÓN ────────────────────────────────
  const Engine = {
    estimate(params) {
      const { brand, model, year, km, fuel, transmission, condition, city } = params;
      const modelData = DB.brands[brand].models[model];
      const age = new Date().getFullYear() - year;
      const base = modelData.base_price;
      
      const ageFactor = DEPRECIATION.age[Math.min(age, DEPRECIATION.age.length - 1)];
      const kmFactor = DEPRECIATION.km_factor(km, age);
      const condFactor = DEPRECIATION.condition[condition];
      const fuelFactor = DEPRECIATION.fuel[fuel];
      const transFactor = DEPRECIATION.transmission[transmission];
      const cityFactor = DEPRECIATION.city[city] || 1.00;
      
      const price = Math.round(base * ageFactor * kmFactor * condFactor * fuelFactor * transFactor * cityFactor / 100) * 100;
      
      return {
        estimated_price: price,
        price_range: { min: Math.round(price * 0.90 / 100) * 100, max: Math.round(price * 1.10 / 100) * 100 },
        breakdown: {
          base_price: base,
          age_factor: +(ageFactor - 1).toFixed(2),
          age_amount: Math.round(base * (ageFactor - 1)),
          km_factor: +(kmFactor - 1).toFixed(2),
          km_amount: Math.round(base * ageFactor * (kmFactor - 1)),
          condition_factor: +(condFactor - 1).toFixed(2),
          condition_amount: Math.round(base * ageFactor * kmFactor * (condFactor - 1)),
          fuel_factor: +(fuelFactor - 1).toFixed(2),
          fuel_amount: Math.round(base * ageFactor * kmFactor * condFactor * (fuelFactor - 1)),
          city_factor: +(cityFactor - 1).toFixed(2),
          city_amount: Math.round(base * ageFactor * kmFactor * condFactor * fuelFactor * (cityFactor - 1)),
          transmission_factor: +(transFactor - 1).toFixed(2),
          transmission_amount: Math.round(base * ageFactor * kmFactor * condFactor * fuelFactor * cityFactor * (transFactor - 1))
        }
      };
    }
  };

  // ── HISTORIAL ──────────────────────────────────────────
  const History = {
    KEY: 'autovaleur_v1',
    getAll() { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
    save(record) {
      const all = this.getAll();
      all.unshift(record);
      localStorage.setItem(this.KEY, JSON.stringify(all.slice(0, 100)));
    },
    remove(id) {
      localStorage.setItem(this.KEY, JSON.stringify(this.getAll().filter(r => r.id !== id)));
    },
    clear() { localStorage.removeItem(this.KEY); }
  };

  // ── ROUTER ─────────────────────────────────────────────
  const Router = {
    routes: { '': 'estimer', 'estimer': 'estimer', 'historique': 'historique', 'comparer': 'comparer' },
    navigate(page) {
      location.hash = page;
    },
    init() {
      window.addEventListener('hashchange', () => this._show());
      this._show();
    },
    _show() {
      const page = location.hash.replace('#', '') || 'estimer';
      document.querySelectorAll('.page').forEach(p => p.hidden = true);
      const target = document.getElementById('page-' + (this.routes[page] || 'estimer'));
      if (target) { target.hidden = false; Pages[page]?.onEnter?.(); }
    }
  };

  // ── PÁGINAS ────────────────────────────────────────────
  const Pages = {
    estimer: { onEnter() { UI.Estimer.refresh(); } },
    historique: { onEnter() { UI.Historique.render(); } },
    comparer: { onEnter() { UI.Comparer.refresh(); } }
  };

  // ── UI (renderizado) ───────────────────────────────────
  const UI = {
    Estimer: { refresh() { /* poblar selects, bindear form */ } },
    Historique: { render() { /* listar History.getAll() */ } },
    Comparer: { refresh() { /* cargar selects con historial */ } }
  };

  // ── I18N ───────────────────────────────────────────────
  const I18n = {
    lang: localStorage.getItem('autovaleur_lang') || 'fr',
    t(key) { return STRINGS[this.lang]?.[key] || key; },
    setLang(lang) {
      this.lang = lang;
      localStorage.setItem('autovaleur_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = this.t(el.dataset.i18n);
      });
    }
  };

  // ── INIT ───────────────────────────────────────────────
  function init() {
    I18n.setLang(I18n.lang);
    Router.init();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', AutoValeur.init);
```

## Comparador — Lógica

Métrica ganadora: **mejor precio/km** (= precio_estimado / km). El coche con mayor DH/km equivale a mejor valor residual por km recorrido.

```js
function calcPricePerKm(record) {
  return record.km > 0 ? record.estimated_price / record.km : Infinity;
}
// El ganador = mayor ratio precio/km
```

Visualización: barras horizontales CSS para precio, km, año. La barra se colorea proporcionalmente. El ganador recibe clase `.winner` con borde verde.

## Generación de URLs de marketplace

```js
const Marketplaces = {
  avito(brand, model, year) {
    const q = encodeURIComponent(`${brand} ${model} ${year}`);
    return `https://www.avito.ma/fr/maroc/voitures-r43/?q=${q}`;
  },
  moteur(brand, model) {
    const q = encodeURIComponent(`${brand} ${model}`);
    return `https://www.moteur.ma/fr/voiture/achat-voiture-occasion/?q=${q}`;
  },
  wandaloo(brand, model) {
    const b = brand.toLowerCase().replace(/\s+/g, '-');
    const m = model.toLowerCase().replace(/\s+/g, '-');
    return `https://www.wandaloo.com/occasion/${b}/${m}/`;
  }
};
```
