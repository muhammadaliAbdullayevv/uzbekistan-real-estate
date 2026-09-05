import { describe, expect, it } from "vitest";

import { formatMessage } from "@/lib/format-message";

describe("formatMessage", () => {
  it("replaces a single placeholder", () => {
    expect(formatMessage("{count} selected", { count: 3 })).toBe("3 selected");
  });

  it("replaces multiple distinct placeholders regardless of position", () => {
    expect(formatMessage("Page {current} / {total}", { current: 2, total: 5 })).toBe(
      "Page 2 / 5"
    );
  });

  it("replaces every occurrence of a repeated placeholder", () => {
    expect(formatMessage("{count} of {count}", { count: 4 })).toBe("4 of 4");
  });

  it("stringifies numeric and string values the same way", () => {
    expect(formatMessage("{name} ({count})", { name: "Namangan", count: 12 })).toBe(
      "Namangan (12)"
    );
  });

  it("returns the template unchanged when no values are given", () => {
    expect(formatMessage("no placeholders here")).toBe("no placeholders here");
  });

  it("leaves an unmatched placeholder untouched", () => {
    expect(formatMessage("{count} selected", { total: 5 })).toBe("{count} selected");
  });
});
