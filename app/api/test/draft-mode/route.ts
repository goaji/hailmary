import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { isTestEnvironmentEnabled, isTestRequestAuthorized } from "@/utils/testAuth";

// Only for hailmary-e2e. Draft mode renders pages per request, so tests see the store right after a seed.
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  if (!isTestEnvironmentEnabled() || !isTestRequestAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  (await draftMode()).enable();
  return NextResponse.json({ status: "enabled" });
}
