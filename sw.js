/*
 * AutoValeur MA — Service Worker
 * Estrategia: Cache-First con versioning
 *
 * Para actualizar la app en producción: incrementar CACHE_NAME
 * (ej: 'autovaleur-v2'). El browser detectará el cambio en sw.js
 * y reinstalará el SW, precacheando los assets actualizados.
 */

'use strict';

const CACHE_NAME = 'autovaleur-v1';

// Lista de recursos a precachear en el install.
// Incluir TODOS los archivos de la app para garantizar
// funcionamiento offline completo desde la primera carga.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// ── INSTALL ────────────────────────────────────────────────────
// Precachear todos los assets. skipWaiting() activa el nuevo SW
// inmediatamente sin esperar que el usuario cierre otras pestañas.
self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
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
// Fallback a red para recursos no cacheados (ej: peticiones
// futuras a APIs externas). Si la red también falla, servir
// index.html como último recurso (app shell offline).
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
        return caches.match('./index.html');
      });
    })
  );
});
