import { describe, expect, it } from "vitest";

import {
  formatDisplayName,
  formatPrice,
  getTelegramLink,
  normalizeTelegramUsername
} from "@/lib/format";
import { getTranslations } from "@/lib/i18n";

describe("formatPrice", () => {
  it("formats USD with a $ prefix and no decimals", () => {
    // uz-UZ's Intl.NumberFormat groups thousands with a space, not a comma.
    expect(formatPrice(1200, "USD", "sale", null, "uz")).toBe("$1 200");
  });

  it("appends the per-month suffix for a monthly rental", () => {
    const t = getTranslations("uz");
    const result = formatPrice(500, "USD", "rent", "monthly", "uz");
    expect(result.endsWith(t.common.perMonth)).toBe(true);
  });

  it("appends the per-day suffix for a daily rental", () => {
    const t = getTranslations("uz");
    const result = formatPrice(50, "USD", "rent", "daily", "uz");
    expect(result.endsWith(t.common.perDay)).toBe(true);
  });

  it("has no rent-type suffix for a sale listing", () => {
    const t = getTranslations("uz");
    const result = formatPrice(100_000, "USD", "sale", null, "uz");
    expect(result.endsWith(t.common.perMonth)).toBe(false);
    expect(result.endsWith(t.common.perDay)).toBe(false);
  });

  it("formats a large UZS price in compact millions", () => {
    // uz-UZ's Intl.NumberFormat uses a comma as the decimal separator.
    expect(formatPrice(4_900_000, "UZS", "rent", "monthly", "uz")).toContain("4,9");
    expect(formatPrice(4_900_000, "UZS", "rent", "monthly", "uz")).toContain("mln");
  });

  it("formats a small UZS price in full, not compact", () => {
    const result = formatPrice(50_000, "UZS", "sale", null, "uz");
    expect(result).not.toContain("mln");
    expect(result).toContain("50");
  });
});

describe("formatDisplayName", () => {
  it("title-cases each word", () => {
    expect(formatDisplayName("aziza karimova")).toBe("Aziza Karimova");
  });

  it("lowercases the remainder of an all-caps word", () => {
    expect(formatDisplayName("AZIZA KARIMOVA")).toBe("Aziza Karimova");
  });

  it("collapses extra internal whitespace", () => {
    expect(formatDisplayName("  aziza    karimova  ")).toBe("Aziza Karimova");
  });

  it("returns an empty string for null/undefined/empty input", () => {
    expect(formatDisplayName(null)).toBe("");
    expect(formatDisplayName(undefined)).toBe("");
    expect(formatDisplayName("")).toBe("");
  });
});

describe("normalizeTelegramUsername", () => {
  it("strips a leading @", () => {
    expect(normalizeTelegramUsername("@aziza")).toBe("aziza");
  });

  it("strips multiple leading @ characters", () => {
    expect(normalizeTelegramUsername("@@aziza")).toBe("aziza");
  });

  it("trims whitespace", () => {
    expect(normalizeTelegramUsername("  aziza  ")).toBe("aziza");
  });

  it("returns null for null/undefined/empty input", () => {
    expect(normalizeTelegramUsername(null)).toBeNull();
    expect(normalizeTelegramUsername(undefined)).toBeNull();
    expect(normalizeTelegramUsername("")).toBeNull();
  });
});

describe("getTelegramLink", () => {
  it("builds a t.me link from a raw username", () => {
    expect(getTelegramLink("@aziza")).toBe("https://t.me/aziza");
  });

  it("returns null when there is no username", () => {
    expect(getTelegramLink(null)).toBeNull();
    expect(getTelegramLink(undefined)).toBeNull();
  });
});
