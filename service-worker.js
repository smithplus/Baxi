const CACHE_NAME = 'taxi-ba-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Baxi.png',
  // './assets/other-icon.png', // Ejemplo si tuvieras otros assets locales específicos para cachear
  // Los bundles de JS/CSS de Vite suelen tener hashes en sus nombres para el cache-busting,
  // por lo que cachearlos estáticamente aquí podría no ser ideal sin una estrategia de actualización.
  // Por ahora, nos enfocaremos en los assets estáticos básicos.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (networkResponse) => {
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Optionally, cache new requests dynamically
            // const responseToCache = networkResponse.clone();
            // caches.open(CACHE_NAME)
            //   .then(cache => {
            //     cache.put(event.request, responseToCache);
            //   });
            return networkResponse;
          }
        );
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
});
    