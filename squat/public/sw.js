const BASE = "/squat/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      if (request.mode === "navigate") {
        return fetch(BASE);
      }
      return Promise.reject(request);
    }),
  );
});
