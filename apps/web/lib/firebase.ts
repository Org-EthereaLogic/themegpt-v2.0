// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtbpZEuUZpMLIIpBUVdUOfN137SrGMkF8",
  authDomain: "themegpt-website.firebaseapp.com",
  projectId: "themegpt-website",
  storageBucket: "themegpt-website.firebasestorage.app",
  messagingSenderId: "770856275348",
  appId: "1:770856275348:web:1b385a4d617b76ef861381",
  measurementId: "G-P7ZVJQSFP7"
};

// Initialize Firebase
// Use existing app if initialized, otherwise initialize new one (hot reload support)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics only on the client side
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
