/* BarbosaTips PWA — cache básico + HTML recente (limite). Atualizar CACHE_VERSION em deploys maiores. */
const CACHE_VERSION = "barbosa-pwa-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_HTML = `${CACHE_VERSION}-html`;
const RUNTIME_ASSET = `${CACHE_VERSION}-assets`;
const MAX_HTML_ENTRIES = 10;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/images/barbosatips-shield.svg",
  "/icon.svg",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch(() => {
              /* ignora recursos opcionais em falta */
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!key.startsWith(CACHE_VERSION)) return caches.delete(key);
            return undefined;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth")) return;

  if (url.pathname.startsWith("/_next/") && !url.pathname.startsWith("/_next/static/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstHtml(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_ASSET));
    return;
  }

  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|avif|svg|ico|woff2?)$/i) ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_ASSET));
  }
});

async function networkFirstHtml(request) {
  const cache = await caches.open(RUNTIME_HTML);
  try {
    const response = await fetch(request, { credentials: "same-origin" });
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimOldest(cache, MAX_HTML_ENTRIES);
    }
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const offline = await caches.match("/offline");
    if (offline) return offline;
    return caches.match("/");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request, { credentials: "same-origin" })
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    void fetchPromise;
    return cached;
  }
  const net = await fetchPromise;
  if (net) return net;
  return new Response("", { status: 504, statusText: "Offline" });
}

async function trimOldest(cache, max) {
  const keys = await cache.keys();
  if (keys.length <= max) return;
  const remove = keys.length - max;
  for (let i = 0; i < remove; i += 1) {
    await cache.delete(keys[i]);
  }
}
