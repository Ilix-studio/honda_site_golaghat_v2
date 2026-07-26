import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  useRegisterDeviceTokenMutation,
  notificationApi,
} from "@/redux-store/services/notificationApi";
import {
  requestPushPermission,
  onForegroundMessage,
} from "@/lib/pushNotifications";
import { addNotification } from "@/redux-store/slices/uiSlice";

/**
 * Registers this device for FCM push once an admin/staff user is authenticated,
 * and wires foreground messages into the UI (toast + in-app notification slice +
 * refetch of the bell/history list). Safe to mount once at the app root.
 *
 * Only runs for the JWT (staff/admin) session — the customer/Firebase-OTP flow
 * is intentionally not push-enabled.
 */
export function usePushRegistration(): void {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const token = useAppSelector((s) => s.auth.token);
  const [registerDeviceToken] = useRegisterDeviceTokenMutation();
  const registeredRef = useRef(false);

  // Register the device token after login.
  useEffect(() => {
    if (!isAuthenticated || !token || registeredRef.current) return;

    let cancelled = false;
    (async () => {
      const fcmToken = await requestPushPermission();
      if (cancelled || !fcmToken) return;
      try {
        await registerDeviceToken({
          token: fcmToken,
          platform: "web",
        }).unwrap();
        registeredRef.current = true;
      } catch {
        // Non-fatal — push just won't be delivered to this device.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, registerDeviceToken]);

  // Reset the guard on logout so re-login re-registers.
  useEffect(() => {
    if (!isAuthenticated) registeredRef.current = false;
  }, [isAuthenticated]);

  // Foreground messages: toast + push into the in-app slice + refresh history.
  useEffect(() => {
    if (!isAuthenticated) return;

    let unsubscribe = () => {};
    onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? "Notification";
      const body = payload.notification?.body ?? "";
      toast(`${title}${body ? ` — ${body}` : ""}`);
      dispatch(addNotification({ type: "info", message: `${title}: ${body}` }));
      dispatch(notificationApi.util.invalidateTags(["Notification"]));
    }).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => unsubscribe();
  }, [isAuthenticated, dispatch]);
}
