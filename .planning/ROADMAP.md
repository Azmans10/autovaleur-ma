# Roadmap: AutoValeur MA

## Overview

AutoValeur MA es una PWA de archivo único para valorar coches de segunda mano en Marruecos. El roadmap construye la app de forma incremental: primero el esqueleto navegable y PWA-ready, luego la internacionalización FR/AR, el motor de cálculo con su base de datos, la UI de valoración completa, el historial y comparador, y finalmente el pulido y despliegue en GitHub Pages.

## Phases

- [ ] **Phase 1: Estructura base, SPA y PWA** - Esqueleto HTML navegable con 3 páginas, hash router, Service Worker y Web App Manifest
- [ ] **Phase 2: Internacionalización FR/AR** - Sistema i18n completo con layout RTL para árabe
- [ ] **Phase 3: Motor de valoración y base de datos** - Algoritmo de depreciación calibrado para MA y BD de 14 marcas embebida
- [ ] **Phase 4: Página Estimer** - Formulario de valoración, resultado con desglose y links a marketplaces
- [ ] **Phase 5: Historique y Comparer** - Historial local y comparador visual con ganador por precio/km
- [ ] **Phase 6: Pulido y despliegue** - Auditoría visual, Lighthouse PWA ≥ 90, despliegue GitHub Pages

## Phase Details

### Phase 1: Estructura base, SPA y PWA
**Goal**: El esqueleto funcional de la app: 3 páginas navegables, PWA instalable y offline-ready.
**Depends on**: Nothing (first phase)
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Las 3 páginas (Estimer, Historique, Comparer) son navegables via hash routing sin recargar la página
  2. El Service Worker está registrado y activo; la app funciona completamente offline tras la primera carga
  3. Chrome DevTools Manifest no muestra errores; el banner "Add to Home Screen" aparece en Android Chrome
  4. La barra de navegación inferior es fija y muestra correctamente la página activa
  5. El CSS base con custom properties (paleta, espaciado) está implementado y la app es responsive en 360px+
**Plans**: 5 plans

Plans:
- [x] 01-01: Crear index.html con estructura HTML semántica (header, 3 secciones .page, nav inferior)
- [x] 01-02: Implementar hash router en JS (navigate, hashchange listener, mostrar/ocultar páginas)
- [x] 01-03: Crear sw.js (cache-first, versioned) y manifest.json (nombre, iconos, display standalone)
- [x] 01-04: Registrar SW desde index.html y añadir meta tags PWA (theme-color, apple-mobile-web-app-capable, viewport)
- [x] 01-05: CSS base (custom properties, reset, layout mobile-first, nav inferior fija, transiciones suaves)

### Phase 2: Internacionalización FR/AR
**Goal**: La app habla francés y árabe con layout RTL correcto.
**Depends on**: Phase 1
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, I18N-05
**Success Criteria** (what must be TRUE):
  1. Cambiar a AR activa layout RTL completo: toda la UI se espeja correctamente
  2. Los precios muestran dígitos 0-9 (no dígitos árabes ٠١٢...) en ambos idiomas
  3. La preferencia de idioma persiste tras recargar la página
  4. El botón FR/AR es visible y funcional desde cualquier página
**Plans**: 5 plans

Plans:
- [ ] 02-01: Crear objeto STRINGS con todas las cadenas en fr y ar (labels, títulos, botones, mensajes)
- [ ] 02-02: Implementar módulo I18n (t(key), setLang, atributos data-i18n en el HTML)
- [ ] 02-03: Añadir botón FR/AR en el header y persistir preferencia en localStorage
- [ ] 02-04: Reemplazar propiedades físicas CSS por logical properties (margin-inline-start, etc.) en toda la app
- [ ] 02-05: Stack de fuentes árabe con fallbacks locales + Intl.NumberFormat con dígitos latinos para árabe

### Phase 3: Motor de valoración y base de datos
**Goal**: El cerebro de la app: algoritmo calibrado para MA y BD de coches embebida.
**Depends on**: Phase 1
**Requirements**: ALG-01, ALG-02, ALG-03, ALG-04, ALG-05, ALG-06, ALG-07, DB-01, DB-02, DB-03, DB-04
**Success Criteria** (what must be TRUE):
  1. Dacia Logan 2019, 85.000 km, diesel, bon état, Casablanca → precio entre 50.000 y 70.000 DH
  2. El resultado incluye breakdown completo con 7 líneas de ajuste (precio base + 6 factores)
  3. La BD incluye ≥ 14 marcas con ≥ 3 modelos por marca y precios base en DH
  4. URLs de Avito, Moteur y Wandaloo se generan correctamente para cualquier coche
**Plans**: 5 plans

Plans:
- [ ] 03-01: Crear objeto CAR_DB con 14 marcas × modelos × años × precio_base (JSON embebido)
- [ ] 03-02: Implementar objeto DEPRECIATION (tabla edad, km_factor, condition, fuel, transmission, city)
- [ ] 03-03: Implementar Engine.estimate(params) → { estimated_price, price_range, breakdown }
- [ ] 03-04: Tests inline en consola: verificar 5 casos representativos del mercado MA
- [ ] 03-05: Implementar módulo Marketplaces para generar URLs de búsqueda en Avito, Moteur y Wandaloo

### Phase 4: Página Estimer
**Goal**: La página principal: formulario de valoración + resultado con desglose + links a marketplaces.
**Depends on**: Phase 2, Phase 3
**Requirements**: EST-01, EST-02, EST-03, EST-04, EST-05, EST-06, EST-07, UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Completar el formulario muestra el precio estimado con rango y desglose de 7 líneas
  2. La valoración se guarda automáticamente en el historial al completarse
  3. Los 3 links de marketplaces generan URLs correctas con marca/modelo/año del coche valorado
  4. El formulario cascada (marca → modelo → año) funciona correctamente
  5. El formulario inválido (sin km) muestra error y no calcula
**Plans**: 5 plans

Plans:
- [ ] 04-01: Formulario cascada (selects Marca/Modelo/Año dinámicos desde CAR_DB) + inputs km, estado, carburant, transmisión, ciudad
- [ ] 04-02: Handler de submit: validar → Engine.estimate() → History.save() → mostrar resultado
- [ ] 04-03: Sección resultado: precio prominente, rango min-max, badge confianza, animación de aparición
- [ ] 04-04: Desglose del cálculo: tabla 7 filas con factor% e importe DH, colores verde/rojo
- [ ] 04-05: Sección referencias: 3 chips Avito/Moteur/Wandaloo con URLs dinámicas, abren en nueva pestaña

### Phase 5: Historique y Comparer
**Goal**: Historial de valoraciones y comparador visual con ganador destacado.
**Depends on**: Phase 4
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05
**Success Criteria** (what must be TRUE):
  1. 3 valoraciones aparecen en Historique ordenadas por fecha, cada una eliminable
  2. Limpiar historial muestra el estado vacío con CTA a Estimer
  3. En Comparer: seleccionar 2 valoraciones muestra la comparación con barras y el ganador (mejor precio/km)
  4. Con menos de 2 valoraciones, Comparer muestra mensaje orientativo
**Plans**: 5 plans

Plans:
- [ ] 05-01: Módulo History completo (save, getAll, remove, clear) con localStorage + try/catch
- [ ] 05-02: Página Historique: lista de tarjetas con marca/modelo/año/km/precio/fecha + botón eliminar por item
- [ ] 05-03: Botón "Effacer tout" con confirmación + estado vacío con ilustración y CTA
- [ ] 05-04: Página Comparer: dos selects con el historial, renderizar comparación al seleccionar ambos
- [ ] 05-05: Barras visuales CSS proporcionales, cálculo ratio precio/km, destacar ganador (borde verde, badge)

### Phase 6: Pulido y despliegue
**Goal**: La app está pulida, probada en dispositivos reales y desplegada en GitHub Pages.
**Depends on**: Phase 5
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04, PWA-05
**Success Criteria** (what must be TRUE):
  1. Lighthouse PWA score ≥ 90 sin warnings
  2. La app funciona sin errores en Chrome Android (360px) y Safari iOS (375px)
  3. La app instalada como PWA en Android funciona completamente offline
  4. La URL de GitHub Pages carga correctamente con SW registrado
**Plans**: 5 plans

Plans:
- [ ] 06-01: Auditoría visual en Chrome Android (360px, 390px) y Safari iOS (375px, 390px)
- [ ] 06-02: Auditoría Lighthouse PWA: corregir warnings de manifest, SW e HTTPS
- [ ] 06-03: Manejo de errores: localStorage bloqueado, historial corrompido, formulario sin datos (mensajes FR/AR)
- [ ] 06-04: Optimización: verificar primera carga < 3s en 3G lento, minificar si HTML > 400KB
- [ ] 06-05: Crear README.md, configurar repositorio y desplegar en GitHub Pages

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Estructura base, SPA y PWA | 4/5 | In Progress|  |
| 2. Internacionalización FR/AR | 0/5 | Not started | - |
| 3. Motor de valoración y base de datos | 0/5 | Not started | - |
| 4. Página Estimer | 0/5 | Not started | - |
| 5. Historique y Comparer | 0/5 | Not started | - |
| 6. Pulido y despliegue | 0/5 | Not started | - |
