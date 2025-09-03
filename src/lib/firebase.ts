// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
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
auth.useDeviceLanguage();

// Add this line to use device language and configure reCAPTCHA
auth.useDeviceLanguage();
auth.settings.appVerificationDisabledForTesting = false; // Set to true for testing

export { auth };
