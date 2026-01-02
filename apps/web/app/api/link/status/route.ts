import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('licenseKey');

    if (!licenseKey) {
      return NextResponse.json(
        { error: "License key required" },
        { status: 400 }
      );
    }

    // Check if license exists
    const license = await db.getLicense(licenseKey);
    if (!license) {
      return NextResponse.json(
        { error: "License key not found" },
        { status: 404 }
      );
    }

    // Check if license is linked
    const link = await db.getLicenseLink(licenseKey);

    return NextResponse.json({
      linked: !!link?.userId,
      linkedAt: link?.linkedAt || null,
    });
  } catch (error) {
    console.error("Error checking link status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
