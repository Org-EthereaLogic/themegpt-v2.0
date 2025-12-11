import { LicenseEntitlement } from "@themegpt/shared";
import { db as firestore } from "./firebase-admin";

// Firestore collection name
const LICENSES_COLLECTION = 'licenses';

// Database Interface
export const db = {
  async getLicense(key: string): Promise<LicenseEntitlement | undefined> {
    try {
      const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return docSnap.data() as LicenseEntitlement;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error fetching license:", error);
      return undefined;
    }
  },

  async createLicense(key: string, entitlement: LicenseEntitlement): Promise<void> {
    try {
      await firestore.collection(LICENSES_COLLECTION).doc(key).set(entitlement);
    } catch (error) {
      console.error("Error creating license:", error);
      throw error;
    }
  },

  async updateLicense(key: string, entitlement: LicenseEntitlement): Promise<boolean> {
    try {
      const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
      // Check existence first or just use set/update. Update fails if doc doesn't exist.
      // The original mock behavior: "if (this.licenses.has(key))"
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return false;
      }
      
      await docRef.set(entitlement, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating license:", error);
      return false;
    }
  }
};
