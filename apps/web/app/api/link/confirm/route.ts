import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, licenseKey } = body;

    if (!token || !licenseKey) {
      return NextResponse.json(
        { error: "Token and license key required" },
        { status: 400 }
      );
    }

    // Verify the token
    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload as { userId: string; email: string; purpose: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (payload.purpose !== 'license-link') {
      return NextResponse.json(
        { error: "Invalid token purpose" },
        { status: 401 }
      );
    }

    // Verify the license key exists
    const license = await db.getLicense(licenseKey);
    if (!license) {
      return NextResponse.json(
        { error: "License key not found" },
        { status: 404 }
      );
    }

    // Check if license is already linked
    const existingLink = await db.getLicenseLink(licenseKey);
    if (existingLink?.userId) {
      return NextResponse.json(
        { error: "License already linked to an account" },
        { status: 409 }
      );
    }

    // Link the license to the user
    const linked = await db.linkLicenseToUser(licenseKey, payload.userId);
    if (!linked) {
      return NextResponse.json(
        { error: "Failed to link license" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "License linked successfully",
      userId: payload.userId,
      email: payload.email,
    });
  } catch (error) {
    console.error("Error confirming link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
