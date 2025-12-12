import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VerifyResponse } from "@themegpt/shared";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, message: "License key required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const entitlement = await db.getLicense(licenseKey);

    if (!entitlement) {
      return NextResponse.json<VerifyResponse>({
        valid: false,
        message: "Invalid license key"
      }, { headers: corsHeaders });
    }

    if (!entitlement.active) {
      return NextResponse.json<VerifyResponse>({
        valid: false,
        message: "License expired or inactive"
      }, { headers: corsHeaders });
    }

    return NextResponse.json<VerifyResponse>({
      valid: true,
      entitlement
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Verify API error", error);
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
