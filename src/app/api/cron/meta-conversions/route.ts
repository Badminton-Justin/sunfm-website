import { NextResponse } from "next/server";
import { syncStageChangesToMeta } from "@/lib/meta-conversions";

export const maxDuration = 60;

// Sends Close bookings and wins to Meta's Conversions API (see
// meta-conversions.ts). Vercel sets `Authorization: Bearer $CRON_SECRET` on
// cron invocations; reject anything else.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.META_CAPI_TOKEN || !process.env.CLOSE_API_KEY) {
    return NextResponse.json({ skipped: "META_CAPI_TOKEN or CLOSE_API_KEY not set" });
  }

  try {
    const results = await syncStageChangesToMeta();
    const failed = results.filter((result) => result.error);
    return NextResponse.json(
      { sent: results.length - failed.length, failed: failed.length, results },
      { status: failed.length > 0 ? 500 : 200 }
    );
  } catch (err) {
    console.error("Meta conversion sync failed", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
