// Sausage the Seal — service worker
//
// Strategy: network-first, cache-fallback. The game is under active
// development, so we deliberately do NOT cache-first — that would mean
// every update gets stuck behind a stale cached copy until the cache is
// manually cleared. Instead: always try the network first (so anyone
// online always gets the latest version), and only fall back to the
// cached copy when there's no connection (so it still works offline).
//
// IMPORTANT: bump CACHE_VERSION whenever the list of cached files changes
// (e.g. a new icon or CSS file is added) — the activate handler below
// deletes any cache that doesn't match the current version, so a bumped
// version is what actually clears out old cached files.
const CACHE_VERSION = "v1";
const CACHE_NAME = `sausage-seal-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./game.js",
  "./styles.css",
  "./styles-mobile.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle simple same-origin GET requests — let everything else
  // (POST, cross-origin, etc.) go straight to the network untouched.
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseCopy = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
