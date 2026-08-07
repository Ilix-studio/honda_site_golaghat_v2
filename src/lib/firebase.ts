import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// NOTE: this exact config is duplicated (by necessity) in the service worker at
// `client/src/sw.ts` — a SW cannot import this module. Keep the two in sync.
export const firebaseConfig = {
  apiKey: "AIzaSyDPZwEsY3MwqORqdbaA1_ALZtJhV0YL3k4",
  authDomain: "tsangpool-honda-otp-52508.firebaseapp.com",
  projectId: "tsangpool-honda-otp-52508",
  storageBucket: "tsangpool-honda-otp-52508.firebasestorage.app",
  messagingSenderId: "347701781396",
  appId: "1:347701781396:web:c8cc4ebb9cc3c105d8a581",
  measurementId: "G-CDNZQP9Q2P",
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
