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

function createFirebaseApp() {
  if (getApps().length <= 0) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }
  return getApp();
}

export const firebaseApp = createFirebaseApp();
export const db = getFirestore(firebaseApp);
