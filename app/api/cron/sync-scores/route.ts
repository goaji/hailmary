import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { CURRENT_SEASON, fetchSeasonGames } from "@/utils/scores";
import { readScores, shouldSkipSync, writeScores } from "@/utils/store";

export const dynamic = "force-dynamic";

const MIN_SYNC_INTERVAL_MS = 30_000;
// Applies after a failed attempt instead of MIN_SYNC_INTERVAL_MS, so a provider outage or rate limit isn't retried every minute forever.
const MIN_RETRY_INTERVAL_MS = 5 * 60_000;

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
  if (shouldSkipSync(existing, MIN_SYNC_INTERVAL_MS, MIN_RETRY_INTERVAL_MS)) {
    return NextResponse.json({ status: "skipped", reason: "synced too recently" });
  }

  const apiKey = process.env.SPORTS_API_KEY;
  if (!apiKey) {
    console.error("sync-scores: SPORTS_API_KEY is not set");
    return NextResponse.json({ status: "error", reason: "not configured" });
  }

  const result = await fetchSeasonGames(apiKey, CURRENT_SEASON);
  const now = new Date().toISOString();

  if (!result.ok) {
    // Games/updatedAt/source untouched — only the attempt marker moves, so the next call backs off via MIN_RETRY_INTERVAL_MS.
    // 200, not 500 — the site is fine, only the sync failed, and a 500 would make hPanel's cron report a false outage.
    console.error("sync-scores: provider fetch failed:", result.reason);
    writeScores(existing.games, { ...existing, lastAttemptAt: now, lastAttemptOk: false });
    return NextResponse.json({ status: "error", reason: result.reason });
  }

  if (result.games.length === 0) {
    // A quiet window (bye week, off-season) — games/updatedAt left untouched rather than blanking a store that might still be useful.
    console.log("sync-scores: provider returned no games; store left untouched");
    writeScores(existing.games, { ...existing, lastAttemptAt: now, lastAttemptOk: true });
    return NextResponse.json({ status: "no-games" });
  }

  writeScores(result.games, { updatedAt: now, source: "balldontlie", lastAttemptAt: now, lastAttemptOk: true });

  return NextResponse.json({ status: "synced", count: result.games.length });
}
