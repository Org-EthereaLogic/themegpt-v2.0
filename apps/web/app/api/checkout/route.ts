import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { LicenseEntitlement } from "@themegpt/shared";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

// Mock Checkout API
// In prod, this would create a Stripe Session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, themeId } = body;

    // Simulate payment success and generate key
    const newKey = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    let entitlement: LicenseEntitlement;

    if (type === 'subscription') {
      entitlement = {
        active: true,
        type: 'subscription',
        maxSlots: 3,
        permanentlyUnlocked: [],
        activeSlotThemes: []
      };
    } else {
      // Lifetime / Single Purchase
      entitlement = {
        active: true,
        type: 'lifetime',
        maxSlots: 0,
        permanentlyUnlocked: themeId ? [themeId] : [],
        activeSlotThemes: []
      };
    }

    await db.createLicense(newKey, entitlement);

    // Return the key directly for the Mock flow
    return NextResponse.json({
      success: true,
      licenseKey: newKey,
      entitlement
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Checkout API error", error);
    return NextResponse.json(
      { success: false, message: "Checkout failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
