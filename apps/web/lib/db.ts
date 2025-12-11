import { LicenseEntitlement } from "@themegpt/shared";

// In-memory store for development
// In production, use Redis/Postgres
class MockDB {
  private licenses: Map<string, LicenseEntitlement> = new Map();

  constructor() {
    // Seed with some test keys
    this.licenses.set("TEST-SUB-KEY", {
      active: true,
      type: "subscription",
      maxSlots: 3,
      permanentlyUnlocked: [],
      activeSlotThemes: []
    });

    this.licenses.set("TEST-LIFETIME-KEY", {
      active: true,
      type: "lifetime",
      maxSlots: 0,
      permanentlyUnlocked: ["synth-wave"], // Example
      activeSlotThemes: []
    });
  }

  getLicense(key: string): LicenseEntitlement | undefined {
    return this.licenses.get(key);
  }

  createLicense(key: string, entitlement: LicenseEntitlement) {
    this.licenses.set(key, entitlement);
  }

  updateLicense(key: string, entitlement: LicenseEntitlement) {
    if (this.licenses.has(key)) {
      this.licenses.set(key, entitlement);
      return true;
    }
    return false;
  }
}

// Singleton instance
export const db = new MockDB();
