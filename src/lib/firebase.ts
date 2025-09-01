// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHXymNwid2unewH8br2iHtFHS3uUM3dwc",
  authDomain: "tsangphool-honda.firebaseapp.com",
  projectId: "tsangphool-honda",
  storageBucket: "tsangphool-honda.firebasestorage.app",
  messagingSenderId: "535967458087",
  appId: "1:535967458087:web:8f2db7f4811d884c623f02",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };
