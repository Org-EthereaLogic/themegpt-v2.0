#!/usr/bin/env npx tsx
/**
 * Resend Domain Management Script
 *
 * Usage:
 *   npx tsx scripts/resend-domain.ts list          # List all domains
 *   npx tsx scripts/resend-domain.ts status        # Get domain status and DNS records
 *   npx tsx scripts/resend-domain.ts verify        # Trigger domain verification
 *   npx tsx scripts/resend-domain.ts add <domain>  # Add a new domain
 */

import { Resend } from "resend";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set in .env.local");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

async function listDomains() {
  console.log("📋 Listing all domains...\n");

  const { data, error } = await resend.domains.list();

  if (error) {
    console.error("❌ Error listing domains:", error.message);
    return;
  }

  if (!data?.data?.length) {
    console.log("No domains found. Add one with: npx tsx scripts/resend-domain.ts add themegpt.ai");
    return;
  }

  console.log("Domains:");
  console.log("─".repeat(60));

  for (const domain of data.data) {
    const statusIcon = domain.status === "verified" ? "✅" : "⏳";
    console.log(`${statusIcon} ${domain.name}`);
    console.log(`   ID: ${domain.id}`);
    console.log(`   Status: ${domain.status}`);
    console.log(`   Region: ${domain.region}`);
    console.log(`   Created: ${domain.created_at}`);
    console.log("");
  }
}

async function getDomainStatus() {
  console.log("🔍 Getting domain status...\n");

  const { data: listData, error: listError } = await resend.domains.list();

  if (listError) {
    console.error("❌ Error listing domains:", listError.message);
    return;
  }

  const themegptDomain = listData?.data?.find((d) => d.name === "themegpt.ai");

  if (!themegptDomain) {
    console.log("❌ Domain 'themegpt.ai' not found.");
    console.log("Add it with: npx tsx scripts/resend-domain.ts add themegpt.ai");
    return;
  }

  const { data, error } = await resend.domains.get(themegptDomain.id);

  if (error) {
    console.error("❌ Error getting domain:", error.message);
    return;
  }

  console.log(`Domain: ${data?.name}`);
  console.log(`Status: ${data?.status === "verified" ? "✅ Verified" : "⏳ Pending"}`);
  console.log(`Region: ${data?.region}`);
  console.log("");

  if (data?.records && data.records.length > 0) {
    console.log("DNS Records Required:");
    console.log("─".repeat(80));

    for (const record of data.records) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec = record as any;
      const statusIcon = rec.status === "verified" ? "✅" : "❌";
      console.log(`${statusIcon} ${rec.record_type || rec.type || "Unknown"} Record`);
      console.log(`   Name: ${rec.name}`);
      console.log(`   Value: ${rec.value}`);
      console.log(`   Priority: ${rec.priority || "N/A"}`);
      console.log(`   TTL: ${rec.ttl || "Auto"}`);
      console.log(`   Status: ${rec.status}`);
      console.log("");
    }
  }
}

async function verifyDomain() {
  console.log("🔄 Triggering domain verification...\n");

  const { data: listData, error: listError } = await resend.domains.list();

  if (listError) {
    console.error("❌ Error listing domains:", listError.message);
    return;
  }

  const themegptDomain = listData?.data?.find((d) => d.name === "themegpt.ai");

  if (!themegptDomain) {
    console.log("❌ Domain 'themegpt.ai' not found.");
    return;
  }

  const { data, error } = await resend.domains.verify(themegptDomain.id);

  if (error) {
    console.error("❌ Error verifying domain:", error.message);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyData = data as any;
  console.log("✅ Verification triggered!");
  console.log(`   Domain: ${verifyData?.name || themegptDomain.name}`);
  console.log(`   Status: ${verifyData?.status || "checking..."}`);
  console.log("");
  console.log("Run 'npx tsx scripts/resend-domain.ts status' to check verification progress.");
}

async function addDomain(domainName: string) {
  console.log(`➕ Adding domain: ${domainName}\n`);

  const { data, error } = await resend.domains.create({ name: domainName });

  if (error) {
    console.error("❌ Error adding domain:", error.message);
    return;
  }

  console.log("✅ Domain added successfully!");
  console.log(`   ID: ${data?.id}`);
  console.log(`   Name: ${data?.name}`);
  console.log(`   Status: ${data?.status}`);
  console.log("");
  console.log("Next steps:");
  console.log("1. Run 'npx tsx scripts/resend-domain.ts status' to see required DNS records");
  console.log("2. Add the DNS records to your domain provider");
  console.log("3. Run 'npx tsx scripts/resend-domain.ts verify' to trigger verification");
}

async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case "list":
      await listDomains();
      break;
    case "status":
      await getDomainStatus();
      break;
    case "verify":
      await verifyDomain();
      break;
    case "add":
      if (!arg) {
        console.error("❌ Please provide a domain name: npx tsx scripts/resend-domain.ts add <domain>");
        process.exit(1);
      }
      await addDomain(arg);
      break;
    default:
      console.log("Resend Domain Management Script");
      console.log("");
      console.log("Usage:");
      console.log("  npx tsx scripts/resend-domain.ts list          # List all domains");
      console.log("  npx tsx scripts/resend-domain.ts status        # Get domain status and DNS records");
      console.log("  npx tsx scripts/resend-domain.ts verify        # Trigger domain verification");
      console.log("  npx tsx scripts/resend-domain.ts add <domain>  # Add a new domain");
  }
}

main().catch(console.error);
