import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getOwnerEmail, isOwner, resolvePostAuthPath } from "@/lib/owner";

const ORIGINAL_OWNER_EMAIL = process.env.OWNER_EMAIL;

describe("isOwner", () => {
  afterEach(() => {
    process.env.OWNER_EMAIL = ORIGINAL_OWNER_EMAIL;
  });

  it("matches when the session email equals OWNER_EMAIL exactly", () => {
    process.env.OWNER_EMAIL = "owner@example.com";
    expect(isOwner({ email: "owner@example.com" })).toBe(true);
  });

  it("matches case-insensitively", () => {
    process.env.OWNER_EMAIL = "Owner@Example.com";
    expect(isOwner({ email: "owner@example.com" })).toBe(true);
    expect(isOwner({ email: "OWNER@EXAMPLE.COM" })).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    process.env.OWNER_EMAIL = "  owner@example.com  ";
    expect(isOwner({ email: "owner@example.com" })).toBe(true);
  });

  it("rejects a different email", () => {
    process.env.OWNER_EMAIL = "owner@example.com";
    expect(isOwner({ email: "someone-else@example.com" })).toBe(false);
  });

  it("rejects when there is no session", () => {
    process.env.OWNER_EMAIL = "owner@example.com";
    expect(isOwner(null)).toBe(false);
    expect(isOwner(undefined)).toBe(false);
  });

  it("rejects everything when OWNER_EMAIL is not configured", () => {
    delete process.env.OWNER_EMAIL;
    expect(isOwner({ email: "owner@example.com" })).toBe(false);
  });

  it("does not match on an empty OWNER_EMAIL", () => {
    process.env.OWNER_EMAIL = "   ";
    expect(isOwner({ email: "" })).toBe(false);
  });
});

describe("getOwnerEmail", () => {
  afterEach(() => {
    process.env.OWNER_EMAIL = ORIGINAL_OWNER_EMAIL;
  });

  it("normalizes to lowercase and trimmed", () => {
    process.env.OWNER_EMAIL = "  Owner@Example.COM ";
    expect(getOwnerEmail()).toBe("owner@example.com");
  });

  it("returns null when unset", () => {
    delete process.env.OWNER_EMAIL;
    expect(getOwnerEmail()).toBeNull();
  });
});

describe("resolvePostAuthPath", () => {
  const ORIGINAL_ADMIN_PATH = process.env.ADMIN_PATH;

  beforeEach(() => {
    process.env.OWNER_EMAIL = "owner@example.com";
    // Pin this explicitly rather than relying on the ambient environment --
    // getOwnerDashboardPath() reads ADMIN_PATH, which changes the expected
    // dashboard path below if it happens to be set.
    delete process.env.ADMIN_PATH;
  });

  afterEach(() => {
    process.env.OWNER_EMAIL = ORIGINAL_OWNER_EMAIL;
    process.env.ADMIN_PATH = ORIGINAL_ADMIN_PATH;
  });

  it("sends the owner to the dashboard when landing on \"/\"", () => {
    expect(resolvePostAuthPath({ email: "owner@example.com" }, "/")).toBe("/admin");
  });

  it("sends a regular user to /account when landing on \"/\"", () => {
    expect(resolvePostAuthPath({ email: "someone@example.com" }, "/")).toBe("/account");
  });

  it("preserves an explicit next path regardless of owner status", () => {
    expect(resolvePostAuthPath({ email: "owner@example.com" }, "/some-page")).toBe("/some-page");
    expect(resolvePostAuthPath({ email: "someone@example.com" }, "/my-listings")).toBe(
      "/my-listings"
    );
  });
});
