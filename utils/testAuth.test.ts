import { afterEach, describe, expect, it } from "vitest";
import { isTestEnvironmentEnabled, isTestRequestAuthorized } from "./testAuth";

const ORIGINAL_SECRET = process.env.E2E_TEST_SECRET;
const ORIGINAL_MODE = process.env.E2E_TEST_MODE;

afterEach(() => {
  process.env.E2E_TEST_SECRET = ORIGINAL_SECRET;
  process.env.E2E_TEST_MODE = ORIGINAL_MODE;
});

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/test/article-count", { headers });
}

describe("isTestEnvironmentEnabled", () => {
  it("requires explicit opt-in", () => {
    delete process.env.E2E_TEST_MODE;
    expect(isTestEnvironmentEnabled()).toBe(false);

    process.env.E2E_TEST_MODE = "true";
    expect(isTestEnvironmentEnabled()).toBe(true);
  });
});

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
