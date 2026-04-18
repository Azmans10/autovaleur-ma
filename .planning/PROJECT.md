# AutoValeur MA

## What This Is

AutoValeur MA es una herramienta de valoración de vehículos de segunda mano calibrada para el mercado marroquí. Funciona como una Progressive Web App (PWA) de archivo único — sin API, sin servidor, sin costes — que permite a vendedores y compradores obtener una estimación justa del valor de un coche en segundos, con total transparencia sobre el cálculo.

**Estado actual:** v1.0 MVP desplegado en producción — https://Azmans10.github.io/autovaleur-ma/

## Core Value

El usuario ve exactamente cómo se calcula el precio — cada factor desglosado, sin cajas negras — construyendo confianza desde el primer uso.

## Requirements

### Validated

- ✓ Algoritmo de valoración calibrado para Marruecos: precio base por marca/modelo, factor de edad, kilómetros, estado, carburant (diesel con prima), corrección por ciudad y transmisión — v1.0
- ✓ Desglose completo del cálculo visible junto al precio estimado (7 líneas: precio base + 6 factores con % e importe DH) — v1.0
- ✓ Base de datos de 14 marcas × modelos × años — datos JSON embebidos en el HTML, sin petición de red — v1.0
- ✓ Referencias de mercado: links dinámicos a Avito.ma, Moteur.ma y Wandaloo.ma generados automáticamente — v1.0
- ✓ Historial local: cada valoración se guarda en localStorage del dispositivo, eliminable individualmente o en bloque — v1.0
- ✓ Página Comparer: comparar dos estimaciones del historial lado a lado con barras visuales, ganador por precio/km — v1.0
- ✓ 3 páginas con navegación SPA instantánea via hash routing: Estimer / Historique / Comparer — v1.0
- ✓ PWA completa: funciona offline, instalable en pantalla de inicio (manifest + service worker, paths absolutos para GitHub Pages subpath) — v1.0
- ✓ Interfaz bilingüe Francés + Árabe con layout RTL automático via CSS logical properties — v1.0
- ✓ Diseño moderno y limpio: escala tipográfica correcta, custom properties CSS, estilo fintech/app marroquí — v1.0

### Active

- [ ] Lighthouse PWA score ≥ 90 — pendiente verificación humana en producción
- [ ] Modo offline verificado en dispositivo real

### Out of Scope

- Backend / API / servidor — la propuesta de valor es cero costes y cero dependencias externas; un servidor rompería eso
- Autenticación / cuentas de usuario — el historial es del usuario, no de la app; sin login ni registro
- Datos en tiempo real de Avito/Moteur/Wandaloo — solo links de búsqueda, no scraping ni integración de API
- Aplicación nativa iOS/Android — la PWA cubre el caso de uso; una app nativa añadiría complejidad sin beneficio claro
- Valoración de vehículos comerciales / camiones / motos — MVP centrado en turismos; ampliar en v2

## Context

El mercado de coches de segunda mano en Marruecos está dominado por Avito.ma como plataforma de anuncios. No existe una herramienta de valoración local de referencia con transparencia de cálculo.

**Stack técnico:** HTML + CSS + JavaScript vanilla, archivo único `index.html`. Service Worker + Web App Manifest para PWA. localStorage para persistencia. Sin frameworks externos, sin bundler, sin npm.

**Codebase v1.0:** ~2.500 líneas en `index.html` (HTML + CSS + JS + datos JSON embebidos). 6 módulos JS: Router, I18n, CAR_DB, DEPRECIATION, Engine, History, Marketplaces, ErrorUI.

**Decisiones de calibración confirmadas:** Precios base subidos ~20-25% sobre tabla inicial para reflejar mercado MA 2024-2025. Diesel +6% validado como prima real del mercado marroquí (gasoil subvencionado históricamente).

**Deuda técnica conocida:** Banner iOS no puede autotestearse programáticamente (requiere Safari real). Lighthouse score solo verificable en producción post-deploy.

## Constraints

- **Arquitectura**: Un solo archivo HTML — todo (HTML, CSS, JS, datos) embebido. Sin dependencias externas en runtime.
- **Offline**: La app debe funcionar completamente sin conexión (PWA con service worker, cache-first).
- **Privacidad**: Cero datos enviados a ningún servidor. El historial vive solo en el dispositivo del usuario.
- **Compatibilidad**: Debe funcionar en Android Chrome (principal browser del mercado MA) y Safari iOS.
- **Idiomas**: Francés como idioma principal, Árabe como segundo idioma. RTL support para el árabe.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Archivo único (no multi-archivo) | Cero fricción de despliegue: se puede compartir el .html por WhatsApp, abrir en GitHub Pages | ✓ Funciona perfectamente — deploy en GitHub Pages sin configuración |
| Datos JSON embebidos en el HTML | Mantiene la arquitectura de archivo único; los datos de coches no cambian frecuentemente | ✓ Validado — carga instantánea, sin petición de red |
| localStorage para historial | Sin servidor, sin cuenta, sin GDPR complications — el historial es del usuario | ✓ Validado — ErrorUI maneja el caso de localStorage bloqueado |
| Links dinámicos a marketplaces (no scraping) | URLs de búsqueda construidas en cliente — sin dependencias, sin rate limits | ✓ Validado — Avito, Moteur, Wandaloo funcionan con parámetros GET |
| PWA en lugar de app nativa | Cubre el 95% del caso de uso, sin tiendas de apps, sin costes de publicación | ✓ Validado — instalable en Android Chrome y con banner iOS |
| Comparador destaca precio/km | Métrica más objetiva que precio absoluto para comparar coches de diferentes categorías | ✓ Validado — ganador con borde verde y badge implementado |
| CSS logical properties para RTL | Adaptación automática árabe sin duplicar reglas CSS | ✓ Validado — layout RTL correcto en árabe |
| Paths absolutos en SW/manifest para GitHub Pages subpath | El subpath `/autovaleur-ma/` requería paths absolutos en PRECACHE_URLS y manifest.json | ✓ Corrección crítica en Fase 6 que desbloqueó el deploy |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-04-18 after v1.0 milestone*
