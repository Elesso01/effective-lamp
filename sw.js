// Offline-capable service worker.
// Network-first for pages and data JSON (updates always reach the user);
// cache-first for static assets. Never responds with undefined.
const VERSION = "v2";
const SHELL = ["./", "./app.html", "./design.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
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
  const networkFirst =
    e.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".json") ||
    url.pathname === "/";
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fresh = fetch(e.request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      });
      if (networkFirst) return fresh.catch(() => hit || offline());
      return hit || fresh.catch(() => offline());
    })
  );
});
