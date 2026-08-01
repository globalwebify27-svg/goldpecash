const CACHE_NAME = 'gold-pe-cash-v2';
const STATIC_ASSETS = [
  '/logo.webp',
  '/manifest.json'
];

// Install: only pre-cache truly static assets (not HTML pages)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate new SW immediately without waiting for old tabs to close
  self.skipWaiting();
});

// Activate: clean up old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch: network-first for navigation/HTML, cache-first for static assets only
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Navigation requests (HTML pages): always go to network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Static assets: try cache first, then network
  if (STATIC_ASSETS.some((asset) => request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // Everything else (API calls, JS chunks, etc.): go to network directly
  // Don't cache dynamic assets to avoid serving stale JS bundles
});
