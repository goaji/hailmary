import { NextResponse } from "next/server";
import { getSchedule } from "@/utils/schedule";

// Thin read of our own store — the client poller's only target. It never
// touches the third-party API itself, so there's no rate limit here.
export async function GET() {
  const { games, isLive, updatedAt } = getSchedule();
  return NextResponse.json({ games, isLive, updatedAt });
}
