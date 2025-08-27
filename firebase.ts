// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrDwCe8reZiU1Nx6I4EoDar7TZqhO9xHQ",
  authDomain: "course90-b95d3.firebaseapp.com",
  projectId: "course90-b95d3",
  storageBucket: "course90-b95d3.appspot.com",
  messagingSenderId: "1076454518957",
  appId: "1:1076454518957:web:2a0bc358c71d44bb6c1624",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth };
