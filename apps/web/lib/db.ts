import {
  LicenseEntitlement,
  Subscription,
  Download,
  LicenseLink,
  SubscriptionStatus,
  DEFAULT_THEMES
} from "@themegpt/shared";
import { db as firestore } from "./firebase-admin";

// Firestore collection names
const LICENSES_COLLECTION = 'licenses';
const USERS_COLLECTION = 'users';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const DOWNLOADS_COLLECTION = 'downloads';
const LICENSE_LINKS_COLLECTION = 'license_links';

// Helper to get current billing period string (YYYY-MM)
function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Database Interface
export const db = {
  // === Legacy License Methods ===
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
  },

  // === Subscription Methods ===
  async getSubscriptionByUserId(userId: string): Promise<(Subscription & { id: string }) | null> {
    try {
      const snapshot = await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status as SubscriptionStatus,
        currentPeriodStart: data.currentPeriodStart.toDate(),
        currentPeriodEnd: data.currentPeriodEnd.toDate(),
        creditsUsed: data.creditsUsed || 0,
        canceledAt: data.canceledAt?.toDate() || null,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  },

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<(Subscription & { id: string }) | null> {
    try {
      const snapshot = await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('stripeSubscriptionId', '==', stripeSubscriptionId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status as SubscriptionStatus,
        currentPeriodStart: data.currentPeriodStart.toDate(),
        currentPeriodEnd: data.currentPeriodEnd.toDate(),
        creditsUsed: data.creditsUsed || 0,
        canceledAt: data.canceledAt?.toDate() || null,
        createdAt: data.createdAt.toDate(),
      };
    } catch (error) {
      console.error("Error fetching subscription by Stripe ID:", error);
      return null;
    }
  },

  async createSubscription(subscription: Omit<Subscription, 'creditsUsed' | 'canceledAt' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await firestore.collection(SUBSCRIPTIONS_COLLECTION).add({
        ...subscription,
        creditsUsed: 0,
        canceledAt: null,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<boolean> {
    try {
      await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscriptionId)
        .update(updates);
      return true;
    } catch (error) {
      console.error("Error updating subscription:", error);
      return false;
    }
  },

  async resetCredits(subscriptionId: string, newPeriodStart: Date, newPeriodEnd: Date): Promise<boolean> {
    try {
      await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscriptionId)
        .update({
          creditsUsed: 0,
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          status: 'active',
        });
      return true;
    } catch (error) {
      console.error("Error resetting credits:", error);
      return false;
    }
  },

  async incrementCreditsUsed(subscriptionId: string): Promise<boolean> {
    try {
      const docRef = firestore.collection(SUBSCRIPTIONS_COLLECTION).doc(subscriptionId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return false;
      }

      const data = doc.data();
      const currentCredits = data?.creditsUsed || 0;

      if (currentCredits >= 3) {
        return false; // No credits remaining
      }

      await docRef.update({
        creditsUsed: currentCredits + 1,
      });
      return true;
    } catch (error) {
      console.error("Error incrementing credits:", error);
      return false;
    }
  },

  // === Download Methods ===
  async recordDownload(download: Omit<Download, 'downloadedAt' | 'billingPeriod'>): Promise<string> {
    try {
      const docRef = await firestore.collection(DOWNLOADS_COLLECTION).add({
        ...download,
        downloadedAt: new Date(),
        billingPeriod: getCurrentBillingPeriod(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error recording download:", error);
      throw error;
    }
  },

  async getDownloadHistory(userId: string, limit: number = 50): Promise<Download[]> {
    try {
      const snapshot = await firestore
        .collection(DOWNLOADS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('downloadedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          subscriptionId: data.subscriptionId,
          themeId: data.themeId,
          downloadedAt: data.downloadedAt.toDate(),
          billingPeriod: data.billingPeriod,
        };
      });
    } catch (error) {
      console.error("Error fetching download history:", error);
      return [];
    }
  },

  async hasDownloadedTheme(userId: string, themeId: string): Promise<boolean> {
    try {
      const snapshot = await firestore
        .collection(DOWNLOADS_COLLECTION)
        .where('userId', '==', userId)
        .where('themeId', '==', themeId)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking download:", error);
      return false;
    }
  },

  async hasDownloadedThemeInPeriod(userId: string, themeId: string, billingPeriod: string): Promise<boolean> {
    try {
      const snapshot = await firestore
        .collection(DOWNLOADS_COLLECTION)
        .where('userId', '==', userId)
        .where('themeId', '==', themeId)
        .where('billingPeriod', '==', billingPeriod)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking download in period:", error);
      return false;
    }
  },

  // === License Link Methods ===
  async getLicenseLink(licenseKey: string): Promise<LicenseLink | null> {
    try {
      const docRef = firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        userId: data?.userId || null,
        linkedAt: data?.linkedAt?.toDate() || null,
      };
    } catch (error) {
      console.error("Error fetching license link:", error);
      return null;
    }
  },

  async linkLicenseToUser(licenseKey: string, userId: string): Promise<boolean> {
    try {
      await firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey).set({
        userId,
        linkedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error linking license:", error);
      return false;
    }
  },

  async getUserIdByLicense(licenseKey: string): Promise<string | null> {
    try {
      const link = await this.getLicenseLink(licenseKey);
      return link?.userId || null;
    } catch (error) {
      console.error("Error getting user by license:", error);
      return null;
    }
  },

  // === User Methods ===
  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    try {
      const snapshot = await firestore
        .collection(USERS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        email: doc.data().email,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  // === Utility Methods ===
  getThemeName(themeId: string): string {
    const theme = DEFAULT_THEMES.find(t => t.id === themeId);
    return theme?.name || themeId;
  },
};
