

/**
 * USAGE:
 * npx tsx apps/web/scripts/verify-cloud-run.ts <YOUR_CLOUD_RUN_URL>
 * * Example:
 * npx tsx apps/web/scripts/verify-cloud-run.ts https://theme-gpt-xyz123-uc.a.run.app
 */

const CLOUD_RUN_URL = process.argv[2];
// The key we created in the previous local step
const TEST_KEY = 'TEST-CONNECTION-KEY'; 

if (!CLOUD_RUN_URL) {
  console.error("❌ Error: Please provide the Cloud Run URL as an argument.");
  console.log("Usage: npx tsx apps/web/scripts/verify-cloud-run.ts <URL>");
  process.exit(1);
}

// Clean trailing slash if present
const baseUrl = CLOUD_RUN_URL.replace(/\/$/, "");

async function verifyDeployment() {
  console.log(`\n🚀 Starting Smoke Test against: ${baseUrl}`);
  console.log(`------------------------------------------------`);

  try {
    // 1. Health Check (Basic connectivity)
    console.log(`\n1. Checking Home Page (Connectivity)...`);
    const homeRes = await fetch(baseUrl);
    if (homeRes.status === 200) {
      console.log(`   ✅ Success: Home page returned 200 OK.`);
    } else {
      throw new Error(`Home page returned status: ${homeRes.status}`);
    }

    // 2. Integration Check (Cloud Run -> Firestore)
    // We check the 'verify' endpoint using the key we created in the local DB test.
    console.log(`\n2. Verifying Firestore Integration...`);
    console.log(`   Attempting to verify license: ${TEST_KEY}`);
    
    // Adjust this path if your API route is named differently (e.g. /api/check-license)
    const apiEndpoint = `${baseUrl}/api/verify`; 
    
    const apiRes = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: TEST_KEY }),
    });

    const data = await apiRes.json();

    if (apiRes.ok) {
      console.log(`   ✅ API responded:`, data);
      console.log(`\n🎉 DEPLOYMENT VERIFIED!`);
      console.log(`The app is live and successfully reading from Firestore.`);
    } else {
      console.error(`   ❌ API Error ${apiRes.status}:`, data);
      console.log(`   (This might indicate the Service Account keys aren't set correctly in Cloud Run)`);
    }

  } catch (error) {
    console.error(`\n❌ VERIFICATION FAILED`);
    console.error(error);
  }
}

verifyDeployment();