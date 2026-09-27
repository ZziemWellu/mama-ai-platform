// Hand-rolled, not Workbox/next-pwa — this app has neither dependency today, and the precache list
// here is small and static enough that a hand-written install/fetch handler is the right amount of
// tooling for it. Bump CACHE_VERSION on every deploy that changes the precached routes/assets below,
// so returning users actually get the new app shell instead of a stale cached one.
const CACHE_VERSION = "mama-ai-v2";
const APP_SHELL = [
  "/",
  "/login/",
  "/register/",
  "/assessment/",
  "/referral/",
  "/waiting-home/",
  "/dashboard/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Twi voice-assessment audio (see scripts/generate-twi-audio.mjs) — best-effort, not part of
// APP_SHELL: cache.addAll() fails its *entire* install if even one URL 404s, and these files are
// generated separately from the app build (some may not exist yet, or a phrase list edit may add
// one before its audio is regenerated). Missing/failed ones are skipped instead of breaking the
// whole precache; any that succeed here make Twi mode work offline from the very first launch
// instead of only after the phrase has been played once online (the general fetch handler below
// caches on-demand too, so a phrase not precached here still works offline after its first play).
const TWI_AUDIO = [
  "welcome", "bleeding", "conscious", "blood_pressure", "headache", "visual_changes",
  "abdominal_pain", "foul_discharge", "fever", "labour_hours", "previous_csection", "complete",
].map((id) => `/audio/tw/${id}.mp3`);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all([
        cache.addAll(APP_SHELL),
        Promise.allSettled(TWI_AUDIO.map((url) => cache.add(url))),
      ]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // POST/PUT to the API is never intercepted — the offline
  // queue (app/lib/offlineQueue.ts) is what handles those, not this service worker.

  const url = new URL(request.url);
  // Never cache API calls — a stale cached API response is worse than a real network error, since
  // the offline queue/instant-read path already handles that case explicitly.
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Cache-first for the precached app shell, refreshed in the background when online.
        fetch(request).then((response) => {
          if (response.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(request, response));
        }).catch(() => {});
        return cached;
      }
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/")); // offline and not precached — fall back to the app shell
    })
  );
});
