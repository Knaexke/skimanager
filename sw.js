// Offline-Cache für die Web-App: einmal geladen, startet das Spiel auch ohne Internet.
// Bei jeder neuen Version VERSION erhöhen, damit Geräte das Update holen.
const VERSION = 'skimanager-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // cache:'reload' umgeht den HTTP-Cache, damit wirklich die neue Version gespeichert wird
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(f => new Request(f, { cache:'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Erst aus dem Cache (schneller Start, offline), im Hintergrund aus dem Netz aktualisieren.
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch:true });
    const net = fetch(e.request).then(res => { if(res.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
