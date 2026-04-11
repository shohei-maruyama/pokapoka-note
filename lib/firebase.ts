import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8a-uzuhHJ6G83E8n-QKHswCiaRuFIfvQ",
  authDomain: "pokapoka-note-eb1d1.firebaseapp.com",
  projectId: "pokapoka-note-eb1d1",
  storageBucket: "pokapoka-note-eb1d1.firebasestorage.app",
  messagingSenderId: "81056625967",
  appId: "1:81056625967:web:019455dcedbf9028f5ddda",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
