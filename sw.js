const CACHE_NAME = 'bass-tracker-v1.9'; // Updated version number
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forces the new worker to take over immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          // This line deletes the old v1.5/v1.6 cache from your phone
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first strategy: try network first, fallback to cache
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If successful, cache it and return
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, return cached version
        return caches.match(e.request);
      })
  );
});