self.addEventListener("install", () => {
  console.log("Service Worker POCO installé");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker POCO activé");

  event.waitUntil(
    self.clients.claim()
  );
});