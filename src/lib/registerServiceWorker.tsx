import toast from "react-hot-toast";
import { registerSW } from "virtual:pwa-register";

/**
 * Register the app's service worker (PWA precache + FCM background push).
 *
 * With `registerType: "prompt"` we never silently swap the SW — instead we show
 * a persistent toast asking the user to reload when a new build is available.
 * This avoids serving a stale app against live auth/inventory data.
 */
export function registerServiceWorker(): void {
  const updateSW = registerSW({
    onNeedRefresh() {
      toast(
        (t) => (
          <span className="flex items-center gap-3">
            <span>A new version is available.</span>
            <button
              className="rounded-md bg-[#e40521] px-3 py-1 text-sm font-medium text-white"
              onClick={() => {
                toast.dismiss(t.id);
                updateSW(true); // skipWaiting + reload
              }}
            >
              Reload
            </button>
          </span>
        ),
        { duration: Infinity, id: "pwa-update" },
      );
    },
    onOfflineReady() {
      toast.success("App ready to work offline");
    },
  });
}
