import { initializeApp, getApps, cert, getApp, ServiceAccount, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const serviceAccount: ServiceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

// Check if we have credentials
const hasCredentials = projectId && clientEmail && privateKey;

let _firebaseApp: App | null = null;
let _db: Firestore | null = null;

function getFirebaseApp(): App {
  if (_firebaseApp) {
    return _firebaseApp;
  }

  if (getApps().length > 0) {
    _firebaseApp = getApp();
    return _firebaseApp;
  }

  if (!hasCredentials) {
    throw new Error(
      "Firebase Admin credentials missing. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  _firebaseApp = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  });
  return _firebaseApp;
}

// Lazy getter for Firestore - throws if credentials missing at access time
export function getDb(): Firestore {
  if (_db) {
    return _db;
  }
  const app = getFirebaseApp();
  _db = getFirestore(app);
  return _db;
}

// Legacy export for backwards compatibility - will throw on access if not initialized
export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export { getFirebaseApp as firebaseApp };
