import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import type { Messaging, MessagePayload } from "firebase/messaging";
import { app } from "./firebase";

/**
 * FCM (web push) client helpers. All entry points are guarded by
 * `isSupported()` so the app degrades gracefully on browsers that don't support
 * the Push API (notably iOS Safari unless installed to the home screen).
 *
 * The service worker itself lives in `src/sw.ts` (single SW: PWA precache +
 * FCM background handler), registered by vite-plugin-pwa.
 */

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

let messagingInstance: Messaging | null = null;

async function getMessagingIfSupported(): Promise<Messaging | null> {
  try {
    if (!(await isSupported())) return null;
    if (!messagingInstance) messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch {
    return null;
  }
}

/**
 * Ask for notification permission (if not already decided) and return the FCM
 * registration token, or null if unsupported / denied / misconfigured.
 */
export async function requestPushPermission(): Promise<string | null> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;

  if (!VAPID_KEY) {
    console.warn(
      "[push] VITE_FIREBASE_VAPID_KEY is not set — cannot register for push.",
    );
    return null;
  }

  if (Notification.permission === "denied") return null;

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
  }

  try {
    // Reuse the SW that vite-plugin-pwa registered (single SW for the app).
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });
    return token || null;
  } catch (err) {
    console.warn("[push] getToken failed:", err);
    return null;
  }
}

/**
 * Subscribe to foreground messages (received while a tab is focused; background
 * messages are handled by the service worker). Returns an unsubscribe fn.
 */
export async function onForegroundMessage(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}

export function isPushPermissionGranted(): boolean {
  return (
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
}
