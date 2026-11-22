// Offline support. Pages: network first, then cache. Data and fonts: cache first.
// "ql-audio" holds surahs saved for offline listening (src/quran/lib/offline-audio.mjs); a new VERSION never clears it.
const VERSION = 'ql-v2';
const SCOPE = self.registration.scope;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll([SCOPE, SCOPE + 'data/meta.json'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'ql-audio').map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isData = url.href.startsWith(SCOPE + 'data/') || url.host.endsWith('fonts.gstatic.com') || url.host.endsWith('fonts.googleapis.com');
  if (url.host.endsWith('everyayah.com')) return; // audio streams straight from the CDN
  // the site's scripts and styles (/_astro/, outside this scope but fetched by its pages): file names change with
  // every build, so a cached copy is always right, and pages open with no connection
  const isAsset = url.origin === self.location.origin && url.pathname.startsWith('/_astro/');
  if (isData || isAsset) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') caches.open(VERSION).then((c) => c.put(req, res.clone()));
      return res;
    })));
  } else if (url.href.startsWith(SCOPE)) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match(SCOPE))));
  }
});
