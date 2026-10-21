// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Not: Bu yapılandırma değerleri Firebase tasarımı gereği istemciye açıktır (gizli değildir).
// Asıl güvenlik Firebase Authentication + Firestore Security Rules (firestore.rules) ile sağlanır.
const firebaseConfig = {
  apiKey: "AIzaSyCj1_cBwOPhA3pIK_mYrjTzM8rVHAuxmQs",
  authDomain: "millturn-vardiya.firebaseapp.com",
  projectId: "millturn-vardiya",
  storageBucket: "millturn-vardiya.firebasestorage.app",
  messagingSenderId: "690324729237",
  appId: "1:690324729237:web:fd5ebf37a4ee60004c1a9c",
  measurementId: "G-PM3XBHBLYD",
};

// Next.js SSR sırasında birden fazla Firebase başlatılmasını önlemek için kontrol
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
