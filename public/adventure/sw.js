// Offline play: the game's files are kept after the first visit. A new version replaces them (bump VERSION).
const VERSION = 'taaleem-adventure-1.2.0';
const FILES = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'assets/icon.svg', 'vendor/three.module.min.js',
  'src/main.js', 'src/content.js', 'src/engine/renderer.js', 'src/engine/save.js', 'src/engine/input.js', 'src/engine/audio.js',
  'src/world/environments.js', 'src/world/explorer.js', 'src/world/bits.js',
  'src/modes/runner.js', 'src/modes/explore.js', 'src/modes/arena.js', 'src/modes/scenes.js', 'src/engine/voice.js', 'src/engine/online.js',
  'vendor/qaaf/track-recognition.mjs', 'vendor/qaaf/qaaf-worker.mjs', 'vendor/qaaf/features.mjs', 'vendor/qaaf/tracker.mjs', 'vendor/qaaf/recite.mjs', 'vendor/qaaf/url.mjs', 'voice/index.json'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
