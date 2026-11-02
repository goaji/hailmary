import { NextResponse } from "next/server";

// Read by hailmary-e2e's smoke workflow to wait for a deploy to go live.
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json(
    { commit: process.env.BUILD_COMMIT ?? "unknown" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
