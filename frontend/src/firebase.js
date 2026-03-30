import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfti1P567mH4ALH3HaihS_ZrUurgHsO_w",
  authDomain: "promtathon.firebaseapp.com",
  projectId: "promtathon",
  storageBucket: "promtathon.firebasestorage.app",
  messagingSenderId: "669514668880",
  appId: "1:669514668880:web:7fdaaa68ed5da10c2c6a55",
};

const app = initializeApp(firebaseConfig);

// 🔐 Firebase Auth
export const auth = getAuth(app);

// 🔑 Google Provider
export const googleProvider = new GoogleAuthProvider();
