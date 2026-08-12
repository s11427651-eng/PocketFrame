const VERSION = "pocketframe-v1";
const CORE = ["/", "/login", "/register"];
const CACHE = `${VERSION}-core`;
const MEDIA = `${VERSION}-media`;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => {
      c.addAll(CORE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;

  // app shell: network-first, fall back to cache
  if (req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // images/media: cache-first with background update
  if (req.headers.get("accept")?.includes("image") || req.url.includes("uploads")) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const fetchUpdate = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(MEDIA).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => hit);
        return hit || fetchUpdate;
      })
    );
    return;
  }

  // everything else: stale-while-revalidate
  e.respondWith(
    caches.match(req).then((hit) => {
      const fetchUpdate = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      });
      return hit || fetchUpdate;
    })
  );
});