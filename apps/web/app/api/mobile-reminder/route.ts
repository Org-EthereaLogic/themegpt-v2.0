import { NextRequest, NextResponse } from "next/server"
import { db as firestore } from "@/lib/firebase-admin"
import { sendDesktopReminderEmail } from "@/lib/email"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

const COLLECTION = "mobileLeads"

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { email, attribution } = body as {
      email?: string
      attribution?: Record<string, string>
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Store the lead (upsert by email to avoid duplicates)
    const docRef = firestore.collection(COLLECTION).doc(normalizedEmail)
    const existing = await docRef.get()

    await docRef.set(
      {
        email: normalizedEmail,
        ...(attribution && typeof attribution === "object"
          ? {
              utmSource: attribution.utmSource || null,
              utmMedium: attribution.utmMedium || null,
              utmCampaign: attribution.utmCampaign || null,
            }
          : {}),
        reminderCount: (existing.data()?.reminderCount || 0) + 1,
        lastReminderAt: new Date(),
        createdAt: existing.data()?.createdAt || new Date(),
      },
      { merge: true }
    )

    const result = await sendDesktopReminderEmail(normalizedEmail)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mobile reminder error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
