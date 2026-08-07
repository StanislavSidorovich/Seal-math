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
const CACHE_VERSION = "v5";
const CACHE_NAME = `sausage-seal-${CACHE_VERSION}`;

// NOTE: cache.addAll() below is all-or-nothing — ONE missing file rejects the
// whole install and the app silently loses offline support. Never add a path
// here before the file actually exists in the deployed root.
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./game.js",
  "./styles.css",
  "./styles-mobile.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./sealvert.jpeg",   // title screen, portrait
  "./sealhor.jpeg"     // title screen, landscape
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

  // `cache: "no-cache"` is what makes "network-first" actually mean it for the
  // files that change: a bare fetch() still goes through the browser's HTTP
  // cache, and GitHub Pages serves with max-age=600, so for ten minutes after
  // a deploy the browser could answer from its own cache without ever reaching
  // the network and the player would keep seeing the previous build.
  //
  // Scoped to code and markup ONLY, deliberately. Forcing a revalidation on
  // the artwork too costs a round trip before anything can paint, and the
  // title screen's background is a ~95KB JPEG — on a phone that turns into a
  // visible stretch of empty blue behind the Play button on every single
  // launch, for files that never change anyway. Images keep normal HTTP
  // caching and stay instant.
  const url = new URL(event.request.url);
  const isVolatile =
    event.request.mode === "navigate" ||
    /\.(?:html|js|css|json)$/i.test(url.pathname) ||
    url.pathname.endsWith("/");

  event.respondWith(
    fetch(event.request, isVolatile ? { cache: "no-cache" } : undefined)
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
