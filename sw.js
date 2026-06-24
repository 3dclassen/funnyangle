const CACHE = 'funnyangle-v1';

const STATIC = [
  './',
  './index.html',
  './tour.html',
  './station.html',
  './crew.html',
  './result.html',
  './admin.html',
  './css/style.css',
  './js/firebase.js',
  './js/sync.js',
  './js/app.js',
  './js/map.js',
  './js/tour.js',
  './js/quiz.js',
  './js/crew.js',
  './manifest.json',
  './icon.svg',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Firebase — immer live, nie cachen
  if (url.includes('firestore.googleapis.com') ||
      url.includes('firebase.googleapis.com') ||
      url.includes('identitytoolkit.googleapis.com') ||
      url.includes('securetoken.googleapis.com')) {
    return;
  }

  // OSM-Kartenkacheln — network first, dann Cache
  if (url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Alles andere — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
