import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VerifyResponse } from "@themegpt/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, message: "License key required" },
        { status: 400 }
      );
    }

    const entitlement = await db.getLicense(licenseKey);

    if (!entitlement) {
      return NextResponse.json<VerifyResponse>({
        valid: false,
        message: "Invalid license key"
      });
    }

    if (!entitlement.active) {
      return NextResponse.json<VerifyResponse>({
        valid: false,
        message: "License expired or inactive"
      });
    }

    return NextResponse.json<VerifyResponse>({
      valid: true,
      entitlement
    });

  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 }
    );
  }
}
