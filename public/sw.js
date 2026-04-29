const CACHE_VERSION = 'travel-1.1.1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
];

const PRECACHE_IMAGES = [
  'https://images.unsplash.com/photo-1539209826553-6d9178ca9089?w=1200&q=80',
  'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?w=800&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'https://images.unsplash.com/photo-1702146504040-80b20af1181c?w=1200&q=80',
  'https://images.unsplash.com/photo-1512472102579-8a647ea3559f?w=800&q=80',
  'https://images.unsplash.com/photo-1623169734436-513e344a62b3?w=800&q=80',
  'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=1200&q=80',
  'https://images.unsplash.com/photo-1765908310201-21b4f73b9ea7?w=800&q=80',
  'https://images.unsplash.com/photo-1693196506405-4c5ef5cbca03?w=800&q=80',
  'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=1200&q=80',
  'https://images.unsplash.com/photo-1746407757880-1d848208ca00?w=800&q=80',
  'https://images.unsplash.com/photo-1759810743306-8727f3beab97?w=800&q=80',
  'https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=1200&q=80',
  'https://images.unsplash.com/photo-1750077806370-806ba3ff2479?w=800&q=80',
  'https://images.unsplash.com/photo-1624553348093-ed95c718f37b?w=800&q=80',
  'https://images.unsplash.com/photo-1655301885279-2a83e9504154?w=1200&q=80',
  'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=80',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80',
  'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1600&q=80',
  'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&q=80',
  'https://images.unsplash.com/photo-1569186273859-0a3cf0a68568?w=800&q=80',
  'https://images.unsplash.com/photo-1762856900967-5156a5cb5035?w=800&q=80',
  'https://images.unsplash.com/photo-1497483475853-22e199da5d7b?w=800&q=80',
  'https://images.unsplash.com/photo-1757047149689-665c456c882a?w=800&q=80',
  'https://images.unsplash.com/photo-1509819749506-0289e9eed3cf?w=800&q=80',
  'https://images.unsplash.com/photo-1715566758856-7df8030f6b61?w=800&q=80',
  'https://images.unsplash.com/photo-1662994016973-e8b45cb9ac8d?w=800&q=80',
  'https://images.unsplash.com/photo-1680549170814-63e21317d0b5?w=800&q=80',
  'https://images.unsplash.com/photo-1582775188649-ea053500cc78?w=800&q=80',
  'https://images.unsplash.com/photo-1700580384425-8e08d34ceb94?w=800&q=80',
  'https://images.unsplash.com/photo-1753558335152-31fae9d9f173?w=800&q=80',
  'https://images.unsplash.com/photo-1485368647436-ff0fb9990605?w=800&q=80',
  'https://images.unsplash.com/photo-1578714084994-880247cd2573?w=800&q=80',
  'https://images.unsplash.com/photo-1741979162497-e080dd39c7dd?w=800&q=80',
  'https://images.unsplash.com/photo-1540567233509-b1256189865d?w=800&q=80',
  'https://images.unsplash.com/photo-1741107787836-ab65b9b25d61?w=800&q=80',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(IMAGE_CACHE).then((cache) =>
        Promise.all(
          PRECACHE_IMAGES.map((url) =>
            cache.match(url).then((existing) => {
              if (existing) return;
              return fetch(url, { mode: 'no-cors' })
                .then((res) => cache.put(url, res))
                .catch(() => {});
            })
          )
        )
      ),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== IMAGE_CACHE && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isStaticAsset(url) {
  return /\.(js|css|svg|ico|webmanifest)$/.test(url.pathname);
}

function isImageRequest(url) {
  return (
    url.hostname === 'images.unsplash.com' ||
    /\.(png|jpg|jpeg|gif|webp)$/.test(url.pathname)
  );
}

function isFontRequest(url) {
  return (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}

function isGoogleMapsEmbed(url) {
  return url.hostname === 'www.google.com' && url.pathname.startsWith('/maps');
}

function isMapboxTileRequest(url) {
  return (
    (url.hostname === 'api.mapbox.com' && !url.pathname.includes('/directions/')) ||
    url.hostname.endsWith('.tiles.mapbox.com')
  );
}

function isApiRequest(url) {
  return (
    url.hostname === 'api.open-meteo.com' ||
    url.hostname === 'open.er-api.com'
  );
}

function isNetlifyFunction(url) {
  return url.pathname.startsWith('/.netlify/functions/');
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      return cache.match('/index.html');
    }
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (isGoogleMapsEmbed(url)) return;

  if (url.hostname === 'events.mapbox.com') return;

  if (isMapboxTileRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, IMAGE_CACHE));
    return;
  }

  if (isApiRequest(url) || isNetlifyFunction(url)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    return;
  }

  if (isImageRequest(url)) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(event.request, FONT_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirstWithCache(event.request));
});

self.addEventListener('push', function (event) {
  if (!event.data) return;
  try {
    var data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Rejseguide', {
        body: data.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: { url: data.url || '/' },
      })
    );
  } catch (e) {
    console.error('Push parse error', e);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.visibilityState === 'visible') {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
