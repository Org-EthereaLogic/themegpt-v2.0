import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Require NEXTAUTH_SECRET - fail fast if missing
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

// Type guard for plain objects (not arrays, null, or other types)
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

// Strict string validator - ensures value is a non-empty string within length limits
function isValidString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for auth endpoints
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: unknown = await request.json();

    // Validate body is a plain object (not array, null, or prototype-polluted)
    if (!isPlainObject(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Extract and validate fields with strict type checking BEFORE any use
    // This prevents type confusion and security bypass attacks
    const rawToken = body.token;
    const rawLicenseKey = body.licenseKey;

    // Strict validation: must be non-empty strings within length limits
    if (!isValidString(rawToken, 2000)) {
      return NextResponse.json(
        { error: "Valid token is required" },
        { status: 400 }
      );
    }

    if (!isValidString(rawLicenseKey, 100)) {
      return NextResponse.json(
        { error: "Valid license key is required" },
        { status: 400 }
      );
    }

    // At this point, TypeScript knows these are valid strings
    const token: string = rawToken;
    const licenseKey: string = rawLicenseKey;

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
