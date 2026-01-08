import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const getAllowedOrigin = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";
  return appUrl;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, activeSlotThemes } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, message: "License key required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const entitlement = await db.getLicense(licenseKey);

    if (!entitlement) {
      return NextResponse.json({
        success: false,
        message: "Invalid license key"
      }, { headers: corsHeaders });
    }

    if (!entitlement.active) {
      return NextResponse.json({
        success: false,
        message: "License expired or inactive"
      }, { headers: corsHeaders });
    }

    // Update the active slots
    // We only update if it is a subscription type, though logic could be generic
    if (entitlement.type === 'subscription') {
        const updatedEntitlement = {
            ...entitlement,
            activeSlotThemes: activeSlotThemes || []
        };
        
        // Sanity check: ensure we don't exceed maxSlots (server side validation)
        if (updatedEntitlement.activeSlotThemes.length > entitlement.maxSlots) {
             return NextResponse.json({
                success: false,
                message: "Exceeded max slots"
            }, { status: 400, headers: corsHeaders });
        }

        await db.updateLicense(licenseKey, updatedEntitlement);
    }

    return NextResponse.json({
      success: true
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Sync API error", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
