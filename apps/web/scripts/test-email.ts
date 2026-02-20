#!/usr/bin/env npx tsx
/**
 * Email Test Utility
 *
 * Usage:
 *   npx tsx scripts/test-email.ts subscription <email>  # Test subscription confirmation
 *   npx tsx scripts/test-email.ts purchase <email>      # Test theme purchase confirmation
 *   npx tsx scripts/test-email.ts trial <email>         # Test trial ending reminder
 *   npx tsx scripts/test-email.ts recovery <email>      # Test abandoned checkout recovery reminder
 *   npx tsx scripts/test-email.ts structured <email> <en|es> # Test multilingual structured content email
 *   npx tsx scripts/test-email.ts all <email>           # Test all email templates
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables BEFORE importing email module
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in .env.local");
  process.exit(1);
}

// Dynamic import to ensure env vars are loaded first
async function loadEmailModule() {
  return await import("../lib/email");
}

async function testSubscriptionEmail(email: string) {
  console.log(`📧 Sending subscription confirmation email to ${email}...`);

  const { sendSubscriptionConfirmationEmail } = await loadEmailModule();

  const planTypes = ["monthly", "yearly", "lifetime"] as const;
  const planType = planTypes[Math.floor(Math.random() * planTypes.length)];

  const result = await sendSubscriptionConfirmationEmail(email, planType);

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
    console.log(`   Plan type: ${planType}`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  return result;
}

async function testPurchaseEmail(email: string) {
  console.log(`📧 Sending theme purchase confirmation email to ${email}...`);

  const { sendThemePurchaseConfirmationEmail } = await loadEmailModule();

  const themeNames = [
    "Aurora Borealis",
    "Synth Wave",
    "Sunset Blaze",
    "Electric Dreams",
    "Shades of Purple",
  ];
  const themeName = themeNames[Math.floor(Math.random() * themeNames.length)];

  const result = await sendThemePurchaseConfirmationEmail(email, themeName);

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
    console.log(`   Theme: ${themeName}`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  return result;
}

async function testTrialEmail(email: string) {
  console.log(`📧 Sending trial ending reminder email to ${email}...`);

  const { sendTrialEndingEmail } = await loadEmailModule();

  const result = await sendTrialEndingEmail(email, 3);

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
    console.log(`   Days remaining: 3`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  return result;
}

async function testRecoveryEmail(email: string) {
  console.log(`📧 Sending abandoned checkout recovery email to ${email}...`);

  const { sendCheckoutRecoveryEmail } = await loadEmailModule();

  const result = await sendCheckoutRecoveryEmail(
    email,
    "https://checkout.stripe.com/c/pay/cs_test_recovery_link_placeholder",
    "monthly"
  );

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  return result;
}

async function testStructuredContentEmail(
  email: string,
  locale: "en" | "es" = "en"
) {
  console.log(
    `📧 Sending multilingual structured content test email (${locale.toUpperCase()}) to ${email}...`
  );

  const { sendStructuredContentTestEmail } = await loadEmailModule();
  const result = await sendStructuredContentTestEmail(email, locale);

  if (result.success) {
    console.log(`✅ Success! Message ID: ${result.messageId}`);
    console.log(`   Locale: ${locale}`);
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  return result;
}

function parseLocale(value?: string): "en" | "es" {
  return value === "es" ? "es" : "en";
}

async function testAllEmails(email: string) {
  console.log("🚀 Testing all email templates...\n");
  console.log("─".repeat(50));

  let passed = 0;
  let failed = 0;

  // Test subscription email
  console.log("\n1. Subscription Confirmation Email");
  const sub = await testSubscriptionEmail(email);
  if (sub.success) {
    passed++;
  } else {
    failed++;
  }

  // Wait a bit to avoid rate limiting
  await new Promise((r) => setTimeout(r, 1000));

  // Test purchase email
  console.log("\n2. Theme Purchase Confirmation Email");
  const purchase = await testPurchaseEmail(email);
  if (purchase.success) {
    passed++;
  } else {
    failed++;
  }

  // Wait a bit
  await new Promise((r) => setTimeout(r, 1000));

  // Test trial email
  console.log("\n3. Trial Ending Reminder Email");
  const trial = await testTrialEmail(email);
  if (trial.success) {
    passed++;
  } else {
    failed++;
  }

  // Wait a bit
  await new Promise((r) => setTimeout(r, 1000));

  // Test recovery email
  console.log("\n4. Abandoned Checkout Recovery Email");
  const recovery = await testRecoveryEmail(email);
  if (recovery.success) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log("\n" + "─".repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("\n✅ All email templates working correctly!");
    console.log(`Check ${email} for the test emails.`);
  } else {
    console.log("\n⚠️  Some emails failed. Check the errors above.");
  }
}

async function main() {
  const command = process.argv[2];
  const email = process.argv[3];

  if (!email && command !== "help") {
    console.error("❌ Please provide an email address");
    console.log("\nUsage:");
    console.log("  npx tsx scripts/test-email.ts subscription <email>");
    console.log("  npx tsx scripts/test-email.ts purchase <email>");
    console.log("  npx tsx scripts/test-email.ts trial <email>");
    console.log("  npx tsx scripts/test-email.ts recovery <email>");
    console.log("  npx tsx scripts/test-email.ts structured <email> <en|es>");
    console.log("  npx tsx scripts/test-email.ts all <email>");
    process.exit(1);
  }

  // Validate email format
  if (email && !email.includes("@")) {
    console.error("❌ Invalid email address format");
    process.exit(1);
  }

  switch (command) {
    case "subscription":
      await testSubscriptionEmail(email);
      break;
    case "purchase":
      await testPurchaseEmail(email);
      break;
    case "trial":
      await testTrialEmail(email);
      break;
    case "recovery":
      await testRecoveryEmail(email);
      break;
    case "structured":
      await testStructuredContentEmail(email, parseLocale(process.argv[4]));
      break;
    case "all":
      await testAllEmails(email);
      break;
    default:
      console.log("Email Test Utility");
      console.log("");
      console.log("Usage:");
      console.log("  npx tsx scripts/test-email.ts subscription <email>  # Test subscription confirmation");
      console.log("  npx tsx scripts/test-email.ts purchase <email>      # Test theme purchase confirmation");
      console.log("  npx tsx scripts/test-email.ts trial <email>         # Test trial ending reminder");
      console.log("  npx tsx scripts/test-email.ts recovery <email>      # Test abandoned checkout recovery reminder");
      console.log("  npx tsx scripts/test-email.ts structured <email> <en|es>  # Test multilingual structured content email");
      console.log("  npx tsx scripts/test-email.ts all <email>           # Test all email templates");
      console.log("");
      console.log("Example:");
      console.log("  npx tsx scripts/test-email.ts all your@email.com");
  }
}

main().catch(console.error);
