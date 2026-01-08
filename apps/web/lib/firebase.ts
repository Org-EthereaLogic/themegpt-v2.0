// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBtbpZEuUZpMLIIpBUVdUOfN137SrGMkF8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "themegpt-website.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "themegpt-website",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "themegpt-website.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "770856275348",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:770856275348:web:1b385a4d617b76ef861381",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-P7ZVJQSFP7"
};

// Initialize Firebase
// Use existing app if initialized, otherwise initialize new one (hot reload support)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics only on the client side
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
