// Ahrou – fonctionnement hors connexion
// Change ce numéro à chaque nouvelle version pour forcer la mise à jour sur les téléphones.
const CACHE = "ahrou-v17";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./ahrou-icon.svg",
  "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Google, Drive… : jamais en cache
  if (e.request.mode === "navigate") {
    // Page : d'abord Internet (pour avoir la dernière version), sinon la copie hors ligne
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
