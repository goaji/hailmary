import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/routing";
import { getAllArticlesWithFallback } from "@/utils/articles";
import { isTestEnvironmentEnabled, isTestRequestAuthorized } from "@/utils/testAuth";

// Only for hailmary-e2e — Never set E2E_TEST_SECRET
// on the Hostinger production env; this is only meant to be reachable on
// the deployed target hailmary-e2e actually points at.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isTestEnvironmentEnabled() || !isTestRequestAuthorized(request)) {
    return new NextResponse(null, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("locale");
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const { articles } = getAllArticlesWithFallback(locale);
  return NextResponse.json({ count: articles.length });
}
