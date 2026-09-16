import { NextResponse } from "next/server";
import { getAllArticlesWithFallback } from "@/utils/articles";
import { isTestEnvironmentEnabled, isTestRequestAuthorized } from "@/utils/testAuth";
import { resolveLocale } from "@/utils/locale";

// Only for hailmary-e2e — Never set E2E_TEST_SECRET
// on the Hostinger production env; this is only meant to be reachable on
// the deployed target hailmary-e2e actually points at.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isTestEnvironmentEnabled() || !isTestRequestAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("locale");
  const locale = resolveLocale(requested);

  const { articles } = getAllArticlesWithFallback(locale);
  return NextResponse.json({ count: articles.length });
}
