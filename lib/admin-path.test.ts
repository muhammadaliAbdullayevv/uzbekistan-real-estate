import { afterEach, describe, expect, it } from "vitest";

import {
  getInternalAdminPath,
  getPublicAdminLoginPath,
  getPublicAdminPath,
  isInternalAdminPath,
  mapPublicAdminPathToInternal
} from "@/lib/admin-path";

const ORIGINAL_ADMIN_PATH = process.env.ADMIN_PATH;

afterEach(() => {
  process.env.ADMIN_PATH = ORIGINAL_ADMIN_PATH;
});

describe("getPublicAdminPath", () => {
  it("defaults to /admin when ADMIN_PATH is unset", () => {
    delete process.env.ADMIN_PATH;
    expect(getPublicAdminPath()).toBe("/admin");
  });

  it("defaults to /admin for an empty or whitespace-only value", () => {
    process.env.ADMIN_PATH = "   ";
    expect(getPublicAdminPath()).toBe("/admin");
  });

  it("defaults to /admin when set to just \"/\"", () => {
    process.env.ADMIN_PATH = "/";
    expect(getPublicAdminPath()).toBe("/admin");
  });

  it("adds a missing leading slash", () => {
    process.env.ADMIN_PATH = "secret-control";
    expect(getPublicAdminPath()).toBe("/secret-control");
  });

  it("strips a trailing slash", () => {
    process.env.ADMIN_PATH = "/secret-control/";
    expect(getPublicAdminPath()).toBe("/secret-control");
  });

  it("collapses duplicate slashes", () => {
    process.env.ADMIN_PATH = "//secret//control";
    expect(getPublicAdminPath()).toBe("/secret/control");
  });

  it("trims surrounding whitespace on an otherwise valid value", () => {
    process.env.ADMIN_PATH = "  /secret-control  ";
    expect(getPublicAdminPath()).toBe("/secret-control");
  });
});

describe("getPublicAdminLoginPath", () => {
  it("appends /login to the configured admin path", () => {
    process.env.ADMIN_PATH = "/secret-control";
    expect(getPublicAdminLoginPath()).toBe("/secret-control/login");
  });

  it("appends /login to the default path", () => {
    delete process.env.ADMIN_PATH;
    expect(getPublicAdminLoginPath()).toBe("/admin/login");
  });
});

describe("mapPublicAdminPathToInternal", () => {
  it("maps an exact match to the internal /admin path", () => {
    process.env.ADMIN_PATH = "/secret-control";
    expect(mapPublicAdminPathToInternal("/secret-control")).toBe("/admin");
  });

  it("maps a nested path under the public path to the same nesting under /admin", () => {
    process.env.ADMIN_PATH = "/secret-control";
    expect(mapPublicAdminPathToInternal("/secret-control/login")).toBe("/admin/login");
    expect(mapPublicAdminPathToInternal("/secret-control/listings/123")).toBe(
      "/admin/listings/123"
    );
  });

  it("returns null for an unrelated path", () => {
    process.env.ADMIN_PATH = "/secret-control";
    expect(mapPublicAdminPathToInternal("/account")).toBeNull();
  });

  it("does not treat a path that merely starts with the same characters as a match", () => {
    process.env.ADMIN_PATH = "/secret-control";
    expect(mapPublicAdminPathToInternal("/secret-controlZZZ")).toBeNull();
  });

  it("is a no-op (identity via the same string) when ADMIN_PATH is unset", () => {
    delete process.env.ADMIN_PATH;
    expect(mapPublicAdminPathToInternal("/admin")).toBe("/admin");
    expect(mapPublicAdminPathToInternal("/admin/listings/123")).toBe("/admin/listings/123");
  });
});

describe("isInternalAdminPath", () => {
  it("is true for the exact internal path", () => {
    expect(isInternalAdminPath(getInternalAdminPath())).toBe(true);
  });

  it("is true for a nested path under /admin", () => {
    expect(isInternalAdminPath("/admin/listings/123")).toBe(true);
  });

  it("is false for a path that only shares the prefix characters", () => {
    expect(isInternalAdminPath("/adminZZZ")).toBe(false);
  });

  it("is false for an unrelated path", () => {
    expect(isInternalAdminPath("/account")).toBe(false);
  });
});
