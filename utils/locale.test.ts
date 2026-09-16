import { describe, expect, it, vi } from "vitest";
import { requireLocale, resolveLocale } from "./locale";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("requireLocale", () => {
  it("returns each configured locale unchanged", () => {
    expect(requireLocale("ro")).toBe("ro");
    expect(requireLocale("en")).toBe("en");
  });

  it("calls notFound for anything else", () => {
    expect(() => requireLocale("xx")).toThrow("NEXT_NOT_FOUND");
    expect(() => requireLocale("")).toThrow("NEXT_NOT_FOUND");
    expect(() => requireLocale("RO")).toThrow("NEXT_NOT_FOUND");
  });
});

describe("resolveLocale", () => {
  it("returns each configured locale unchanged", () => {
    expect(resolveLocale("ro")).toBe("ro");
    expect(resolveLocale("en")).toBe("en");
  });

  it("falls back to the default locale for unknown or missing values", () => {
    expect(resolveLocale("xx")).toBe("ro");
    expect(resolveLocale(null)).toBe("ro");
    expect(resolveLocale(undefined)).toBe("ro");
  });
});
