import { afterEach, describe, expect, it } from "vitest";
import { isTestRequestAuthorized } from "./testAuth";

const ORIGINAL_SECRET = process.env.E2E_TEST_SECRET;

afterEach(() => {
  process.env.E2E_TEST_SECRET = ORIGINAL_SECRET;
});

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/test/article-count", { headers });
}

describe("isTestRequestAuthorized", () => {
  it("rejects when E2E_TEST_SECRET is unset, regardless of header", () => {
    delete process.env.E2E_TEST_SECRET;
    expect(isTestRequestAuthorized(request({ "x-e2e-secret": "anything" }))).toBe(false);
  });

  it("rejects a request with no header", () => {
    process.env.E2E_TEST_SECRET = "correct-secret";
    expect(isTestRequestAuthorized(request())).toBe(false);
  });

  it("rejects a wrong secret", () => {
    process.env.E2E_TEST_SECRET = "correct-secret";
    expect(isTestRequestAuthorized(request({ "x-e2e-secret": "wrong-secret" }))).toBe(false);
  });

  it("accepts the matching secret", () => {
    process.env.E2E_TEST_SECRET = "correct-secret";
    expect(isTestRequestAuthorized(request({ "x-e2e-secret": "correct-secret" }))).toBe(true);
  });
});
