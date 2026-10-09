// Offline-first service worker for the static prototype.
// Cache-first for app shell; network-first for data JSON.
const VERSION = "v1";
const SHELL = ["./", "./app.html", "./design.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const offline = () =>
    new Response("<h1>You are offline</h1>", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fresh = fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      });
      // Data JSON: network first; shell: cache first. Never respond with
      // undefined — fall back to cache, then to a synthetic offline page.
      return url.pathname.endsWith(".json")
        ? fresh.catch(() => hit || offline())
        : hit || fresh.catch(() => offline());
    })
  );
});
