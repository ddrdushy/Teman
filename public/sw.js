/* Teman service worker — deliberately conservative.
 *
 * Strategy: network-first for navigations (a stale page about a live session
 * is worse than a spinner), falling back to the cached offline page; cache-
 * first for fonts and icons (immutable). Nothing else is cached — coordination
 * and safety data must never be stale. The Caddyfile serves this file with
 * no-cache so an install can't pin an old build.
 */
const VERSION = 'teman-v1';
const OFFLINE_PAGES = ['/en/offline', '/ms/offline', '/ta/offline', '/zh/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(OFFLINE_PAGES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  // immutable assets: cache-first
  if (url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/icons/') || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(VERSION).then((cache) =>
        cache.match(event.request).then((hit) =>
          hit ?? fetch(event.request).then((res) => {
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          }),
        ),
      ),
    );
    return;
  }

  // navigations: network-first, offline fallback in the request's locale
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        const locale = ['en', 'ms', 'ta', 'zh'].find((l) => url.pathname.startsWith(`/${l}`)) ?? 'en';
        return caches.match(`/${locale}/offline`).then((hit) => hit ?? Response.error());
      }),
    );
  }
});
