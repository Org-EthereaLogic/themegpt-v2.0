import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

// Use a secure secret from environment variables.
// Do not use a hardcoded fallback in production as it allows security bypass.
const secret = process.env.NEXTAUTH_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  console.error("FATAL: NEXTAUTH_SECRET environment variable is missing in production!");
}
const JWT_SECRET = new TextEncoder().encode(secret || 'development-only-fallback-secret');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate that body is an object and contains required fields
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { token, licenseKey } = body;

    // Strict type and existence validation to prevent security bypasses
    if (typeof token !== 'string' || !token || typeof licenseKey !== 'string' || !licenseKey) {
      return NextResponse.json(
        { error: "Valid token and license key are required" },
        { status: 400 }
      );
    }

    // Length validation - prevent DoS via oversized payloads
    if (token.length > 2000 || licenseKey.length > 100) {
      return NextResponse.json(
        { error: "Input exceeds maximum length" },
        { status: 400 }
      );
    }

    // Verify the token
    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload as { userId: string; email: string; purpose: string };
    } catch (error) {
      console.error("JWT Verification failed:", error instanceof Error ? error.message : "Unknown error");
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
