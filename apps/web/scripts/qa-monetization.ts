
import { db } from "../lib/db";
import { db as firestore } from "../lib/firebase-admin";

async function runQA() {
    console.log("🚀 Starting Monetization Logic QA...");

    const COLLECTION = 'early_adopter_program';
    const CONFIG_DOC = 'config';
    const TEST_SUB_ID = 'test-qa-subscription';

    try {
        // --- SETUP ---
        console.log("\n--- SETUP: Initializing Early Adopter Program ---");
        // Initialize with 60 slots, valid window
        await db.initializeEarlyAdopterProgram(new Date(), 60, 60);

        // Manually set usedSlots to 59 to test the boundary
        await firestore.collection(COLLECTION).doc(CONFIG_DOC).update({
            usedSlots: 59
        });
        console.log("✅ Program initialized. usedSlots set to 59/60.");

        // Create a dummy subscription for testing
        // Clean up if exists
        try {
            await firestore.collection('subscriptions').doc(TEST_SUB_ID).delete();
        } catch { }

        await firestore.collection('subscriptions').doc(TEST_SUB_ID).set({
            userId: 'test-user',
            stripeSubscriptionId: 'sub_test123',
            stripeCustomerId: 'cus_test123',
            status: 'active',
            planType: 'yearly',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
            createdAt: new Date(),
            isLifetime: false
        });
        console.log("✅ Test subscription created.");


        // --- TEST 1: Eligibility Check (59/60) ---
        console.log("\n--- TEST 1: Eligibility Check (Should be TRUE) ---");
        const isEligible1 = await db.isEarlyAdopterEligible();
        if (isEligible1) {
            console.log("✅ PASS: Program is eligible with 59/60 slots.");
        } else {
            console.error("❌ FAIL: Program should be eligible.");
        }

        // --- TEST 2: Claim Slot (59 -> 60) ---
        console.log("\n--- TEST 2: Claim Slot (Should be TRUE) ---");
        const claimed1 = await db.claimEarlyAdopterSlot();
        if (claimed1) {
            console.log("✅ PASS: Slot claimed successfully.");
        } else {
            console.error("❌ FAIL: Failed to claim slot.");
        }

        // Verify count is 60
        const count1 = await db.getEarlyAdopterCount();
        if (count1 === 60) {
            console.log("✅ PASS: Used slots count is 60.");
        } else {
            console.error(`❌ FAIL: Used slots count is ${count1}, expected 60.`);
        }

        // --- TEST 3: Eligibility Check at Limit (60/60) ---
        console.log("\n--- TEST 3: Eligibility Check at Limit (Should be FALSE) ---");
        const isEligible2 = await db.isEarlyAdopterEligible();
        if (!isEligible2) {
            console.log("✅ PASS: Program is NOT eligible with 60/60 slots.");
        } else {
            console.error("❌ FAIL: Program should NOT be eligible.");
        }

        // --- TEST 4: Claim Slot at Limit (60 -> 61? Should Fail) ---
        console.log("\n--- TEST 4: Claim Slot Over Limit (Should be FALSE) ---");
        const claimed2 = await db.claimEarlyAdopterSlot();
        if (!claimed2) {
            console.log("✅ PASS: Slot claim rejected as expected.");
        } else {
            console.error("❌ FAIL: Slot claim succeeded but should have failed.");
        }

        // --- TEST 5: Convert Subscription to Lifetime ---
        console.log("\n--- TEST 5: Convert Subscription to Lifetime ---");
        const converted = await db.convertToLifetime(TEST_SUB_ID);
        if (converted) {
            console.log("✅ PASS: convertToLifetime returned true.");
            const sub = await db.getSubscriptionByStripeId('sub_test123'); // Helper uses stripe ID
            // Or get by stored ID since we know it
            const subDoc = await firestore.collection('subscriptions').doc(TEST_SUB_ID).get();
            const subData = subDoc.data();

            if (subData?.isLifetime === true && subData?.planType === 'lifetime') {
                console.log("✅ PASS: Subscription record updated to lifetime.");
            } else {
                console.error("❌ FAIL: Subscription record not updated correctly.", subData);
            }
        } else {
            console.error("❌ FAIL: convertToLifetime returned false.");
        }

        // --- TEST 6: Rollback / Release Slot ---
        console.log("\n--- TEST 6: Release Slot (Rollback) ---");
        // Currently at 60. Release should take us to 59.
        const released = await db.releaseEarlyAdopterSlot();
        if (released) {
            console.log("✅ PASS: Slot released.");
        } else {
            console.error("❌ FAIL: Failed to release slot.");
        }

        const count2 = await db.getEarlyAdopterCount();
        if (count2 === 59) {
            console.log("✅ PASS: Used slots count back to 59.");
        } else {
            console.error(`❌ FAIL: Used slots count is ${count2}, expected 59.`);
        }

        // Re-check eligibility
        const isEligible3 = await db.isEarlyAdopterEligible();
        if (isEligible3) {
            console.log("✅ PASS: Program is eligible again after rollback.");
        } else {
            console.error("❌ FAIL: Program should be eligible again.");
        }

        console.log("\n🚀 QA Complete.");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ FATAL ERROR:", error);
        process.exit(1);
    }
}

runQA();
