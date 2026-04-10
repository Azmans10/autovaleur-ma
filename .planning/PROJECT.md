# AutoValeur MA

## What This Is

AutoValeur MA es una herramienta de valoración de vehículos de segunda mano calibrada para el mercado marroquí. Funciona como una Progressive Web App (PWA) de archivo único — sin API, sin servidor, sin costes — que permite a vendedores y compradores obtener una estimación justa del valor de un coche en segundos, con total transparencia sobre el cálculo.

## Core Value

El usuario ve exactamente cómo se calcula el precio — cada factor desglosado, sin cajas negras — construyendo confianza desde el primer uso.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Algoritmo de valoración calibrado para Marruecos: precio base por marca/modelo, factor de edad, kilómetros, estado, carburant (diesel con prima), corrección por ciudad (Casablanca +8%, Oujda -7%, etc.) y transmisión
- [ ] Desglose completo del cálculo visible junto al precio estimado (precio base, % por edad, % por km, corrección estado, corrección ciudad...)
- [ ] Base de datos de marcas/modelos representativos del mercado MA — cobertura amplia (Dacia, Renault, Peugeot, Citroën, Hyundai, Kia, Toyota, Ford, VW, Fiat y más), datos JSON embebidos en el propio HTML
- [ ] Referencias de mercado: links dinámicos a Avito.ma, Moteur.ma y Wandaloo.ma generados automáticamente con la búsqueda del coche valorado (marca + modelo + año)
- [ ] Historial local: cada valoración se guarda en localStorage del dispositivo, sin cuenta ni datos enviados a servidor
- [ ] Página Comparer: comparar dos estimaciones del historial lado a lado con barras visuales, destacando el coche con mejor relación precio/km
- [ ] 3 páginas con navegación SPA instantánea: Estimer / Historique / Comparer
- [ ] PWA completa: funciona offline, instalable en pantalla de inicio como app nativa (manifest + service worker)
- [ ] Interfaz bilingüe Francés + Árabe
- [ ] Diseño moderno y limpio: estilo fintech/app marroquí moderna, tipografía clara, colores neutros

### Out of Scope

- Backend / API / servidor — la propuesta de valor es cero costes y cero dependencias externas; un servidor rompería eso
- Autenticación / cuentas de usuario — el historial es del usuario, no de la app; sin login ni registro
- Datos en tiempo real de Avito/Moteur/Wandaloo — solo links de búsqueda, no scraping ni integración de API
- Aplicación nativa iOS/Android — la PWA cubre el caso de uso; una app nativa añadiría complejidad sin beneficio claro
- Valoración de vehículos comerciales / camiones / motos — MVP centrado en turismos

## Context

El mercado de coches de segunda mano en Marruecos está dominado por Avito.ma como plataforma de anuncios. No existe una herramienta de valoración local de referencia con transparencia de cálculo. El diesel tiene una prima real en el mercado MA porque el gasoil está subvencionado históricamente. Las diferencias de precio por ciudad son significativas (Casablanca es el mercado más caro, ciudades del norte/este más baratos). La app se dirige tanto a vendedores (fijar precio justo) como a compradores (verificar si un anuncio está bien valorado).

**Stack técnico:** HTML + CSS + JavaScript vanilla, archivo único. Service Worker + Web App Manifest para PWA. localStorage para persistencia. Sin frameworks externos, sin bundler, sin npm.

## Constraints

- **Arquitectura**: Un solo archivo HTML — todo (HTML, CSS, JS, datos) embebido. Sin dependencias externas en runtime.
- **Offline**: La app debe funcionar completamente sin conexión (PWA con service worker cacheando el archivo).
- **Privacidad**: Cero datos enviados a ningún servidor. El historial vive solo en el dispositivo del usuario.
- **Compatibilidad**: Debe funcionar en Android Chrome (principal browser del mercado MA) y Safari iOS.
- **Idiomas**: Francés como idioma principal, Árabe como segundo idioma. RTL support para el árabe.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Archivo único (no multi-archivo) | Cero fricción de despliegue: se puede compartir el .html por WhatsApp, abrir en GitHub Pages, hospedar en cualquier CDN estático | — Pending |
| Datos JSON embebidos en el HTML | Mantiene la arquitectura de archivo único; los datos de coches no cambian frecuentemente | — Pending |
| localStorage para historial | Sin servidor, sin cuenta, sin GDPR complications — el historial es del usuario | — Pending |
| Links dinámicos a marketplaces (no scraping) | URLs de búsqueda construidas en cliente — sin dependencias, sin rate limits, siempre frescos | — Pending |
| PWA en lugar de app nativa | Cubre el 95% del caso de uso, sin tiendas de apps, sin costes de publicación | — Pending |
| Comparador destaca precio/km | Métrica más objetiva que precio absoluto para comparar coches de diferentes categorías | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after initialization*
