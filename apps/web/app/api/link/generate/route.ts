import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignJWT } from "jose";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is required");
}
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate a one-time linking token valid for 10 minutes
    const token = await new SignJWT({
      userId: session.user.id,
      email: session.user.email,
      purpose: 'license-link',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(JWT_SECRET);

    // Generate a short code for manual entry (last 8 chars of token hash)
    const shortCode = Buffer.from(token.slice(-12)).toString('base64').slice(0, 8).toUpperCase();

    return NextResponse.json({
      token,
      shortCode,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("Error generating link token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
