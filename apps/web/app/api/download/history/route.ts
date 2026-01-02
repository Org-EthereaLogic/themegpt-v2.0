import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DownloadHistoryItem } from "@themegpt/shared";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const downloads = await db.getDownloadHistory(session.user.id, limit);

    const history: DownloadHistoryItem[] = downloads.map(download => ({
      themeId: download.themeId,
      themeName: db.getThemeName(download.themeId),
      downloadedAt: download.downloadedAt,
      billingPeriod: download.billingPeriod,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching download history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
