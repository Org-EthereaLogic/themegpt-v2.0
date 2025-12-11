import fs from 'fs';
import path from 'path';
import { LicenseEntitlement } from '@themegpt/shared';

// Manually load .env.local because tsx doesn't load it by default
// and we need it set BEFORE importing lib/db -> lib/firebase-admin
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Loading credentials from: ${envPath}`);

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    // Basic parsing: KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Do NOT replace \n here because lib/firebase-admin.ts does it too.
      // But wait, lib/firebase-admin.ts does .replace(/\\n/g, '\n').
      // In the file, I wrote literal \n inside the string.
      // If I read it here, "value" will contain literal chars '\' and 'n'.
      // So if I set it to env, lib/firebase-admin.ts will handle the replace.
      
      process.env[key] = value;
    }
  });
} else {
  console.error("ERROR: .env.local not found!");
  process.exit(1);
}

// Dynamic import to ensure env vars are set first
const run = async () => {
    const { db } = await import('../lib/db');

    console.log("Testing Firestore connection...");
    const testKey = "TEST-CONNECTION-KEY";
    const testEntitlement: LicenseEntitlement = {
        active: true,
        type: "subscription",
        maxSlots: 0,
        permanentlyUnlocked: [],
        activeSlotThemes: []
    };

    try {
        console.log(`Writing test license: ${testKey}`);
        await db.createLicense(testKey, testEntitlement as LicenseEntitlement);
        console.log("Write successful.");

        console.log(`Reading test license: ${testKey}`);
        const retrieved = await db.getLicense(testKey);
        
        if (retrieved && retrieved.active === true) {
        console.log("SUCCESS: Test license written and verified.");
        } else {
        console.error("FAILURE: Retrieved license does not match or is undefined.");
        console.error("Retrieved:", retrieved);
        }
    } catch (error) {
        console.error("ERROR: Firestore connection failed.", error);
        process.exit(1);
    }
};

run();
