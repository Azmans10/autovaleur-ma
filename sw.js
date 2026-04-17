/*
 * AutoValeur MA — Service Worker
 * Estrategia: Cache-First con versioning
 *
 * Para actualizar la app en producción: incrementar CACHE_NAME
 * (ej: 'autovaleur-v3'). El browser detectará el cambio en sw.js
 * y reinstalará el SW, precacheando los assets actualizados.
 */

'use strict';

const CACHE_NAME = 'autovaleur-v3';

// Lista de recursos a precachear en el install.
const PRECACHE_URLS = [
  '/autovaleur-ma/',
  '/autovaleur-ma/index.html',
  '/autovaleur-ma/manifest.json',
  '/autovaleur-ma/sw.js',
  '/autovaleur-ma/icon.svg'
];

// ── INSTALL ────────────────────────────────────────────────────
// Precachear todos los assets. skipWaiting() se llama DESPUÉS
// de un precacheo exitoso para evitar activar un SW con caché vacío.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE ───────────────────────────────────────────────────
// Limpiar cachés de versiones anteriores (cualquier caché cuyo
// nombre no sea CACHE_NAME se elimina). clients.claim() toma
// control de las páginas abiertas sin esperar navegación nueva.
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return clients.claim();
    })
  );
});

// ── FETCH ──────────────────────────────────────────────────────
// Cache-First: responder desde caché si está disponible.
// Fallback a red para recursos no cacheados. Si la red también
// falla, servir index.html como último recurso (app shell offline).
self.addEventListener('fetch', function(event) {
  // Solo interceptar peticiones GET del mismo origen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      // No está en caché: ir a la red
      return fetch(event.request).then(function(networkResponse) {
        // Cachear dinámicamente si la respuesta es válida
        if (networkResponse && networkResponse.ok) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Red no disponible: servir index.html como fallback
        return caches.match('/autovaleur-ma/index.html').then(function(fallback) {
          return fallback || new Response('AutoValeur MA — offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      });
    })
  );
});
