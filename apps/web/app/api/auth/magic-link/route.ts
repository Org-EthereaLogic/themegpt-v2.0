import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { db as firestore } from "@/lib/firebase-admin"
import { sendMagicLinkEmail } from "@/lib/email"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

const TOKENS_COLLECTION = "verificationTokens"
const TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, callbackUrl } = (await request.json()) as {
      email?: string
      callbackUrl?: string
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Basic email format validation (linear-time, avoids ReDoS)
    const atIdx = email.indexOf("@")
    const domainPart = atIdx > 0 ? email.slice(atIdx + 1) : ""
    const dotIdx = domainPart.lastIndexOf(".")
    if (
      atIdx <= 0 ||
      email.lastIndexOf("@") !== atIdx ||
      dotIdx <= 0 ||
      dotIdx === domainPart.length - 1
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

    // Store token in Firestore
    await firestore.collection(TOKENS_COLLECTION).doc(token).set({
      email: normalizedEmail,
      expiresAt,
      createdAt: new Date(),
    })

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai"
    const redirect =
      typeof callbackUrl === "string" && callbackUrl.startsWith("/")
        ? callbackUrl
        : "/auth/extension"
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}&callbackUrl=${encodeURIComponent(redirect)}`

    // Send magic link email
    const result = await sendMagicLinkEmail(normalizedEmail, verifyUrl)
    if (!result.success) {
      await firestore.collection(TOKENS_COLLECTION).doc(token).delete().catch(() => {})
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Magic link error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
