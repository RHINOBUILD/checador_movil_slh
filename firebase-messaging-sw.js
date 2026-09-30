// firebase-messaging-sw.js — Checador Saint Luke's
// Debe vivir en la MISMA carpeta que index.html y checkin.html
// (ej. /checador_movil_slh/firebase-messaging-sw.js) para que su alcance cubra la app.

importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDiz476SH-JewBi-_wKuy1TLa431h9Wr3g",
  authDomain: "checador-facial-slh.firebaseapp.com",
  projectId: "checador-facial-slh",
  storageBucket: "checador-facial-slh.firebasestorage.app",
  messagingSenderId: "878984080471",
  appId: "1:878984080471:web:adaa7416ab4a5b673e4712"
});

const messaging = firebase.messaging();
const BASE = self.registration.scope;                 // p. ej. https://rhinobuild.github.io/checador_movil_slh/
const ICONO = new URL("icon-192.png", BASE).href;

// Actualiza el SW en cuanto se publica una versión nueva
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

// El backend manda "notification" + webpush.fcm_options.link, así que el SDK ya muestra
// la notificación en segundo plano. Este handler solo cubre mensajes que lleguen sin
// "notification" (solo data), para no duplicarla.
messaging.onBackgroundMessage(payload => {
  if (payload.notification) return;
  const d = payload.data || {};
  self.registration.showNotification(d.title || "Check-in requerido", {
    body: d.body || "Confirma tu estado y ubicación",
    icon: ICONO, badge: ICONO, tag: "checkin-slh", renotify: true, requireInteraction: true,
    data: { url: d.url }
  });
});

// Al tocar la notificación: enfoca la pestaña abierta o abre el check-in
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const d = event.notification.data || {};
  const destino = new URL(
    (d.FCM_MSG && d.FCM_MSG.fcmOptions && d.FCM_MSG.fcmOptions.link) ||
    (d.FCM_MSG && d.FCM_MSG.data && d.FCM_MSG.data.url) ||
    d.url || "checkin.html", BASE).href;

  event.waitUntil((async () => {
    const lista = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of lista) {
      if (c.url.split("?")[0] === destino.split("?")[0] && "focus" in c) {
        await c.focus();
        if ("navigate" in c) return c.navigate(destino);
        return;
      }
    }
    return clients.openWindow(destino);
  })());
});
