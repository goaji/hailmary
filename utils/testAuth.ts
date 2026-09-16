import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isTestEnvironmentEnabled(): boolean {
  return process.env.E2E_TEST_MODE === "true";
}

// Same shared-secret pattern as the cron route's isAuthorized.
export function isTestRequestAuthorized(request: Request): boolean {
  const expected = process.env.E2E_TEST_SECRET;
  const provided = request.headers.get("x-e2e-secret");
  if (!expected || !provided) {
    return false;
  }
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  return expectedBuf.length === providedBuf.length && timingSafeEqual(expectedBuf, providedBuf);
}
