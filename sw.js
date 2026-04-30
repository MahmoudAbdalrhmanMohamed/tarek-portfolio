const CACHE_NAME = 'tarek-portfolio-v1';
const APP_SHELL = [
  './',
  './index.html',
  './site.webmanifest',
  './favicon.svg',
  './profile-photo.webp',
  './assets/garden-preview.png',
  './assets/central-preview.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        const isSameOrigin = new URL(request.url).origin === self.location.origin;
        const shouldCache = isSameOrigin && response.ok && !request.url.endsWith('.rar');

        if (shouldCache) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }

        return response;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      });
    })
  );
});
