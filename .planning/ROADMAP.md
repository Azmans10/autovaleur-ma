# Roadmap: AutoValeur MA

**Milestone:** v1.0 — PWA de valoración de coches para el mercado marroquí
**Goal:** Una sola app offline, sin servidor, con algoritmo propio, historial local y comparador
**Target:** Archivo(s) estáticos desplegables en GitHub Pages

---

## Phase 1 — Estructura base, SPA y PWA

**Goal:** El esqueleto funcional de la app: 3 páginas navegables, PWA instalable, offline-ready.

**Plans:**
1. Crear `index.html` con estructura HTML semántica: `<header>` con nav, 3 secciones `.page` con IDs, `<nav>` inferior fija
2. Implementar hash router en JS: `navigate()`, `hashchange` listener, mostrar/ocultar páginas
3. Crear `sw.js` (cache-first, versioned) y `manifest.json` (nombre, iconos, display standalone, theme_color)
4. Registrar el SW desde `index.html` y añadir meta tags PWA (`theme-color`, `apple-mobile-web-app-capable`, viewport)
5. CSS base: CSS custom properties (paleta, espaciado, radios), reset, layout mobile-first, nav inferior fija

**Verification:**
- Abrir en Chrome → la app muestra las 3 páginas navegables sin recargar
- Chrome DevTools → Application → Service Workers → SW registrado y activo
- Chrome DevTools → Application → Manifest → sin errores
- Poner Chrome en modo offline → la app sigue funcionando
- En Android Chrome → aparece el banner "Añadir a pantalla de inicio"

**Requirements covered:** PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, NAV-01, NAV-02, NAV-03

---

## Phase 2 — Internacionalización FR/AR (RTL)

**Goal:** La app habla francés y árabe, con layout RTL correcto para el árabe.

**Plans:**
1. Crear objeto `STRINGS` con todas las cadenas de texto en `fr` y `ar` (labels, títulos, botones, mensajes)
2. Implementar módulo `I18n`: `t(key)`, `setLang(lang)`, atributos `data-i18n` en el HTML
3. Añadir botón FR/AR en el header, persistir preferencia en localStorage
4. CSS: reemplazar propiedades físicas (`margin-left`) por logical properties (`margin-inline-start`) en toda la app
5. Stack de fuentes árabe con fallbacks locales (Noto Sans Arabic, Cairo, system-ui). Formateo de precios con `Intl.NumberFormat` + dígitos latinos para árabe

**Verification:**
- Cambiar a AR → toda la UI aparece en árabe con layout espejado (RTL)
- Los precios muestran dígitos 0-9 (no dígitos árabes ٠١٢...)
- Recargar la página → el idioma persiste
- Verificar que el nav y las barras de progreso se espejean correctamente en RTL

**Requirements covered:** I18N-01, I18N-02, I18N-03, I18N-04, I18N-05

---

## Phase 3 — Motor de valoración y base de datos de coches

**Goal:** El cerebro de la app: algoritmo calibrado para MA y BD de coches embebida.

**Plans:**
1. Crear objeto `CAR_DB` con 14 marcas × modelos × años × precio_base (JSON embebido en el HTML). Incluir nombres en FR y AR
2. Implementar objeto `DEPRECIATION` con: tabla de factores por edad (16 puntos), función km_factor, tablas condition/fuel/transmission/city
3. Implementar `Engine.estimate(params)` → devuelve `{ estimated_price, price_range, breakdown }` con todos los importes de ajuste en DH
4. Tests inline (en consola del navegador): verificar 5 casos representativos con valores conocidos del mercado MA
5. Implementar módulo `Marketplaces` para generar URLs de búsqueda dinámicas para Avito, Moteur y Wandaloo

**Verification:**
- Dacia Logan 2019, 85.000 km, diesel, bon état, Casablanca → precio entre 50.000 y 70.000 DH
- Renault Clio 2016, 120.000 km, essence, passable, Oujda → precio entre 20.000 y 40.000 DH
- Toyota Yaris 2020, 40.000 km, hybride, excellent, Rabat → precio entre 80.000 y 110.000 DH
- Todos los casos retornan breakdown completo con 7 líneas de ajuste
- URLs de Avito/Moteur/Wandaloo se generan correctamente para cada caso

**Requirements covered:** ALG-01, ALG-02, ALG-03, ALG-04, ALG-05, ALG-06, ALG-07, DB-01, DB-02, DB-03, DB-04

---

## Phase 4 — Página Estimer (formulario + resultado)

**Goal:** La página principal: formulario de valoración + resultado con desglose + links a marketplaces.

**Plans:**
1. Formulario cascada: select Marca → poblar Modelo → poblar Año dinámicamente desde CAR_DB. Inputs: km (number), estado (select), carburant (select), transmisión (select), ciudad (select)
2. Handler de submit: validar inputs → llamar `Engine.estimate()` → guardar en historial → mostrar resultado
3. Sección resultado: precio estimado grande, rango min-max, badge de confianza. Animación de aparición suave
4. Desglose del cálculo: tabla con 7 filas (precio base + 6 ajustes), cada fila muestra factor% y importe DH en color verde/rojo
5. Sección referencias: 3 botones/chips (Avito · Moteur · Wandaloo) con links dinámicos, abren en nueva pestaña

**Verification:**
- Completar formulario → resultado aparece con precio + rango + desglose de 7 líneas
- La valoración aparece automáticamente en Historique
- Links de marketplaces generan URLs con marca/modelo/año correctos
- Formulario inválido (km vacío) muestra error y no calcula
- En árabe: el formulario y resultado aparecen en AR con layout RTL

**Requirements covered:** EST-01, EST-02, EST-03, EST-04, EST-05, EST-06, EST-07, UI-01, UI-02, UI-03, UI-04

---

## Phase 5 — Página Historique y Página Comparer

**Goal:** Historial de valoraciones y comparador visual con ganador destacado.

**Plans:**
1. Historique: renderizar lista de valoraciones desde localStorage, tarjeta por item (marca/modelo/año, km, precio, fecha), botón eliminar por item
2. Historique: botón "Effacer tout" con confirmación. Estado vacío con ilustración + CTA a Estimer. Módulo `History` completo (save, getAll, remove, clear)
3. Comparer: dos selects pobladados con el historial. Al seleccionar ambos → renderizar comparación
4. Comparer: layout lado a lado con datos principales de cada coche. Barras visuales CSS para precio, km y año (proporcionales entre los dos)
5. Comparer: calcular ratio precio/km para cada uno → destacar el ganador (borde verde, badge "Meilleur rapport qualité/km") → mostrar diferencia porcentual

**Verification:**
- Realizar 3 valoraciones → aparecen en Historique ordenadas por fecha
- Eliminar una → desaparece sin recargar
- En Comparer: seleccionar 2 → aparece comparación con barras y ganador destacado
- El ganador es siempre el que tiene mayor ratio precio/km
- Con 0 o 1 valoraciones en historial → Comparer muestra mensaje orientativo
- Limpiar historial → Historique muestra estado vacío

**Requirements covered:** HIST-01, HIST-02, HIST-03, HIST-04, HIST-05, COMP-01, COMP-02, COMP-03, COMP-04, COMP-05

---

## Phase 6 — Pulido, testing cross-browser y despliegue

**Goal:** La app está pulida, probada en dispositivos reales y desplegada en GitHub Pages.

**Plans:**
1. Auditoría visual completa: revisar en Chrome Android (360px, 390px, 412px), Safari iOS (375px, 390px). Corregir cualquier layout roto
2. Auditoría PWA: Lighthouse → conseguir score PWA ≥ 90. Corregir warnings de manifest, SW, HTTPS
3. Manejo de errores: localStorage indisponible (try/catch), formulario sin datos, historial corrompido. Mensajes de error en FR y AR
4. Optimización: minificar CSS/JS inline si el HTML supera 400KB. Verificar tiempo de primera carga < 3s en 3G lento
5. Crear `README.md` con instrucciones de despliegue en GitHub Pages. Configurar repositorio. Desplegar y verificar que la PWA funciona desde HTTPS real

**Verification:**
- Lighthouse PWA score ≥ 90
- La app funciona sin errores en Chrome Android y Safari iOS
- Instalar como PWA en Android → funciona offline completamente
- URL de GitHub Pages: la app carga, las 3 páginas funcionan, el SW se registra
- localStorage bloqueado (modo privado Safari) → la app no crashea, muestra mensaje

**Requirements covered:** PWA-01 a PWA-05 (verificación final en producción)

---

## Milestone Summary

| Phase | Focus | Requirements |
|-------|-------|--------------|
| 1 | Estructura, SPA, PWA | PWA-01–05, NAV-01–03 |
| 2 | Internacionalización FR/AR | I18N-01–05 |
| 3 | Motor + BD de coches | ALG-01–07, DB-01–04 |
| 4 | Página Estimer | EST-01–07, UI-01–04 |
| 5 | Historique + Comparer | HIST-01–05, COMP-01–05 |
| 6 | Pulido + despliegue | Verificación final |

**Total v1 requirements:** 46
**Phases:** 6
**Entregable:** App desplegada en GitHub Pages, instalable como PWA, funcional offline

---
*Roadmap created: 2026-04-11*
*Milestone: v1.0*
