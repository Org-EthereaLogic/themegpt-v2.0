
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require("../service-account.json");

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

async function checkUser(email: string) {
    console.log(`Checking user with email: ${email}`);

    const userSnapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (userSnapshot.empty) {
        console.log("No user found with this email.");
        return;
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    console.log(`User found. ID: ${userId}`);
    console.log("User Data:", userDoc.data());

    const subSnapshot = await db
        .collection("subscriptions")
        .where("userId", "==", userId)
        .get();

    if (subSnapshot.empty) {
        console.log("No subscriptions found for this user.");
    } else {
        console.log(`Found ${subSnapshot.size} subscriptions:`);
        subSnapshot.forEach((doc) => {
            console.log(`Subscription ID: ${doc.id}`);
            console.log(doc.data());
        });
    }
}

const email = process.argv[2];
if (!email) {
    console.error("Please provide an email address as an argument.");
    process.exit(1);
}

checkUser(email).catch(console.error);
