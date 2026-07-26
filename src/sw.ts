/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

/**
 * Single service worker for the app:
 *  1. PWA precache — Workbox precaches the built app shell (injected manifest)
 *     so repeat loads are instant and the shell works offline. API requests
 *     (`/api/*`) are intentionally NOT cached — they must always hit the
 *     network (auth tokens, live inventory, customer data).
 *  2. FCM background push — shows OS notifications when no tab is focused.
 *
 * NOTE: the Firebase config below is duplicated from `src/lib/firebase.ts`
 * (a SW cannot import the app module). Keep the two in sync.
 */

declare const self: ServiceWorkerGlobalScope;

// --- PWA precache (app shell only; never /api) -------------------------------
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Activate a waiting SW as soon as the client asks it to (see main.tsx prompt).
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// --- FCM background messages -------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCOLCfkbNXvivcQVujbHOx51697D84BE1g",
  authDomain: "tsangpool-honda-otp.firebaseapp.com",
  projectId: "tsangpool-honda-otp",
  storageBucket: "tsangpool-honda-otp.firebasestorage.app",
  messagingSenderId: "250001962767",
  appId: "1:250001962767:web:39df9fb05c92c10a74f07a",
  measurementId: "G-RSGK59KR4X",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title ?? "Honda Golaghat";
  const body = payload.notification?.body ?? "";
  const route = (payload.data?.route as string) || "/";

  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { route },
  });
});

// Focus/open the app on notification click, deep-linking via data.route.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = (event.notification.data?.route as string) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            (client as WindowClient).navigate(route);
            return (client as WindowClient).focus();
          }
        }
        return self.clients.openWindow(route);
      }),
  );
});
