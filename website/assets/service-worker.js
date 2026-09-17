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


/* ======================================================
   NOTIFICATIONS PUSH
   ====================================================== */

self.addEventListener("push", (event) => {
  let data = {
    title: "POCO",
    body: "Nouvelle notification POCO",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error(
        "Impossible de lire la notification Push :",
        error
      );
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "POCO",
      {
        body:
          data.body ||
          "Nouvelle notification POCO",

        icon: "/images/poco-icon-192.png",

        badge: "/images/poco-icon-192.png",

        data: {
          url: data.url || "/mes-plantes",
        },
      }
    )
  );
});


/* ======================================================
   CLIC SUR UNE NOTIFICATION
   ====================================================== */

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const url =
      event.notification.data?.url ||
      "/mes-plantes";

    event.waitUntil(
      clients.openWindow(url)
    );
  }
);