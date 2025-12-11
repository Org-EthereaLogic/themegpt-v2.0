import { initializeApp, getApps, cert, getApp, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  // Only throw in production or if we try to use it.
  // We can let it fail gracefully during build time if environment variables aren't there.
  if (process.env.NODE_ENV === 'production') {
     console.error("Missing Firebase Admin credentials");
  }
}

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

// Check if we have credentials
const hasCredentials = projectId && clientEmail && privateKey;

function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }
  
  if (hasCredentials) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }
  
  // During build time or if creds missing, return null or throw later
  console.warn("Firebase credentials missing. Skipping initialization (okay during build).");
  return null;
}

const firebaseApp = createFirebaseApp();
// Cast to Firestore to avoid type errors in consumers, but it will be null at build time
export const db = (firebaseApp ? getFirestore(firebaseApp) : null) as unknown as FirebaseFirestore.Firestore;
export { firebaseApp };
