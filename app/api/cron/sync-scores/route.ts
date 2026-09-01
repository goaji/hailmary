import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fetchLatestGames } from "@/utils/scores";
import { readScores, writeScores } from "@/utils/store";

export const dynamic = "force-dynamic";

const MIN_SYNC_INTERVAL_MS = 30_000;

// Public URL — no request detail ever reaches the response body.
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  const provided = request.headers.get("x-cron-secret");
  if (!expected || !provided) {
    return false;
  }
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  return expectedBuf.length === providedBuf.length && timingSafeEqual(expectedBuf, providedBuf);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  const existing = readScores();
  if (existing.updatedAt) {
    const ageMs = Date.now() - new Date(existing.updatedAt).getTime();
    if (ageMs < MIN_SYNC_INTERVAL_MS) {
      return NextResponse.json({ status: "skipped", reason: "synced too recently" });
    }
  }

  const apiKey = process.env.SPORTS_API_KEY;
  if (!apiKey) {
    console.error("sync-scores: SPORTS_API_KEY is not set");
    return NextResponse.json({ status: "error", reason: "not configured" });
  }

  const result = await fetchLatestGames(apiKey);

  if (!result.ok) {
    // Store left untouched. 200, not 500 — the site is fine, only the sync failed, and a 500 would make hPanel's cron report a false outage.
    console.error("sync-scores: provider fetch failed:", result.reason);
    return NextResponse.json({ status: "error", reason: result.reason });
  }

  if (result.games.length === 0) {
    // A quiet window (bye week, off-season) — write nothing rather than blank a store that might still be useful.
    console.log("sync-scores: provider returned no games; store left untouched");
    return NextResponse.json({ status: "no-games" });
  }

  writeScores(result.games, { updatedAt: new Date().toISOString(), source: "balldontlie" });

  return NextResponse.json({ status: "synced", count: result.games.length });
}
