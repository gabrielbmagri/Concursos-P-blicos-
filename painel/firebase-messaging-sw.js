/* Service worker das notificações do Painel de metas (Firebase Cloud Messaging). */
self.window = self;
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js",
  "/firebase-config.js"
);
firebase.initializeApp(self.FIREBASE_CONFIG);
const messaging = firebase.messaging();
/* Mensagens enviadas só com "data" (sem "notification") viram notificação aqui. */
messaging.onBackgroundMessage((p) => {
  if (p.notification) return;
  const d = p.data || {};
  self.registration.showNotification(d.titulo || "Painel de metas", {
    body: d.corpo || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: d.tag || "painel",
    data: { link: d.link || "/" },
  });
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const link = (e.notification.data && (e.notification.data.link || (e.notification.data.FCM_MSG && e.notification.data.FCM_MSG.fcmOptions && e.notification.data.FCM_MSG.fcmOptions.link))) || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return clients.openWindow(link);
    })
  );
});
