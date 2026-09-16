import { NextResponse } from "next/server";
import { z } from "zod";
import { writeScores } from "@/utils/store";
import { isTestEnvironmentEnabled, isTestRequestAuthorized } from "@/utils/testAuth";

// Only for hailmary-e2e. Never set E2E_TEST_SECRET
// on the Hostinger production env; this route can overwrite the live score
// store and is only meant to be reachable on the deployed target
// hailmary-e2e actually points at.
export const dynamic = "force-dynamic";

const gameSchema = z.object({
  id: z.string(),
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  kickoff: z.string(),
  week: z.number(),
  status: z.enum(["scheduled", "live", "halftime", "final", "postponed"]),
  homeScore: z.number().optional(),
  awayScore: z.number().optional(),
  quarter: z.number().optional(),
  clock: z.string().optional(),
});

const seedBodySchema = z.object({ games: z.array(gameSchema) });

export async function POST(request: Request) {
  if (!isTestEnvironmentEnabled() || !isTestRequestAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  const parsed = seedBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ status: "error", reason: "invalid body" }, { status: 400 });
  }

  writeScores(parsed.data.games, { updatedAt: new Date().toISOString(), source: "test-seed" });
  return NextResponse.json({ status: "seeded", count: parsed.data.games.length });
}

export async function DELETE(request: Request) {
  if (!isTestEnvironmentEnabled() || !isTestRequestAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  writeScores([], { updatedAt: null });
  return NextResponse.json({ status: "cleared" });
}
