// firebase-messaging-sw.js
// Este archivo DEBE vivir en la RAÍZ del sitio donde corre el checador
// (ej. /checador_movil_slh/firebase-messaging-sw.js), no dentro de una subcarpeta,
// para que su "scope" cubra toda la app.

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

// Se ejecuta cuando llega una notificación y la pestaña del checador
// NO está abierta/enfocada (segundo plano o app cerrada).
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Check-in requerido";
  const options = {
    body: payload.notification?.body || "Confirma tu ubicación y actividad",
    icon: "/checador_movil_slh/icon-192.png", // ajusta si tu ícono está en otra ruta
    badge: "/checador_movil_slh/icon-192.png",
    data: payload.data || {}, // aquí puede venir la URL de destino, rol, etc.
    tag: "checkin-slh" // evita que se apilen notificaciones repetidas
  };

  self.registration.showNotification(title, options);
});

// Al tocar la notificación, abre (o enfoca) la vista del check-in
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ||
    "/checador_movil_slh/checkin.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
