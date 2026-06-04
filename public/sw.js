const CACHE_NAME = 'pedidos-tienda-v2'; // Cambiado a v2
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forzar activación del nuevo SW
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediatamente
  );
});

self.addEventListener('fetch', (e) => {
  // Estrategia Network-First para todo, con fallback a caché
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Opcional: Actualizar el caché si la respuesta es exitosa
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
