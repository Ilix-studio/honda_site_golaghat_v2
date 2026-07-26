import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// NOTE: this exact config is duplicated (by necessity) in the service worker at
// `client/src/sw.ts` — a SW cannot import this module. Keep the two in sync.
export const firebaseConfig = {
  apiKey: "AIzaSyCOLCfkbNXvivcQVujbHOx51697D84BE1g",
  authDomain: "tsangpool-honda-otp.firebaseapp.com",
  projectId: "tsangpool-honda-otp",
  storageBucket: "tsangpool-honda-otp.firebasestorage.app",
  messagingSenderId: "250001962767",
  appId: "1:250001962767:web:39df9fb05c92c10a74f07a",
  measurementId: "G-RSGK59KR4X",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure auth settings
auth.useDeviceLanguage();

// ✅ Set persistence to LOCAL (survives page reloads)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

// Development settings
if (typeof window !== "undefined") {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    auth.settings.appVerificationDisabledForTesting = true;
  } else {
    auth.settings.appVerificationDisabledForTesting = false;
  }
}

export { app, auth };
