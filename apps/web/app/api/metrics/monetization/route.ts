import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const getAllowedOrigin = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "private, max-age=120",
};

function parseDays(value: string | null): number {
  if (!value) return 7;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(Math.max(parsed, 1), 90);
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.sync);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const isInternalUser = email.endsWith("@etherealogic.ai");

  if (!isInternalUser) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers: corsHeaders }
    );
  }

  const days = parseDays(request.nextUrl.searchParams.get("days"));
  const summary = await db.getMonetizationSummary(days);

  return NextResponse.json(
    {
      success: true,
      generatedAt: new Date().toISOString(),
      summary,
    },
    { headers: corsHeaders }
  );
}
