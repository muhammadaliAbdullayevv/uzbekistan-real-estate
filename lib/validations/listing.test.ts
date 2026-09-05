import { describe, expect, it } from "vitest";

import {
  adminUserActionSchema,
  isValidListingImageValue,
  listingInputSchema,
  listingStatusSchema,
  userRegisterSchema
} from "@/lib/validations/listing";

describe("isValidListingImageValue", () => {
  it("accepts a local upload path", () => {
    expect(isValidListingImageValue("/uploads/listings/abc.jpg")).toBe(true);
  });

  it("accepts an http(s) URL", () => {
    expect(isValidListingImageValue("https://images.unsplash.com/photo-1")).toBe(true);
    expect(isValidListingImageValue("http://example.com/a.jpg")).toBe(true);
  });

  it("rejects a non-http(s) URL scheme", () => {
    expect(isValidListingImageValue("javascript:alert(1)")).toBe(false);
    expect(isValidListingImageValue("ftp://example.com/a.jpg")).toBe(false);
  });

  it("rejects a plain, non-upload string", () => {
    expect(isValidListingImageValue("not-a-url")).toBe(false);
    expect(isValidListingImageValue("")).toBe(false);
  });
});

describe("listingStatusSchema", () => {
  it("accepts APPROVED and REJECTED", () => {
    expect(listingStatusSchema.safeParse({ status: "APPROVED" }).success).toBe(true);
    expect(listingStatusSchema.safeParse({ status: "REJECTED" }).success).toBe(true);
  });

  it("rejects PENDING and any other value -- moderation can only move a listing forward", () => {
    expect(listingStatusSchema.safeParse({ status: "PENDING" }).success).toBe(false);
    expect(listingStatusSchema.safeParse({ status: "DELETED" }).success).toBe(false);
    expect(listingStatusSchema.safeParse({ status: "" }).success).toBe(false);
    expect(listingStatusSchema.safeParse({}).success).toBe(false);
  });
});

describe("adminUserActionSchema", () => {
  it("accepts BLOCK and UNBLOCK", () => {
    expect(adminUserActionSchema.safeParse({ action: "BLOCK" }).success).toBe(true);
    expect(adminUserActionSchema.safeParse({ action: "UNBLOCK" }).success).toBe(true);
  });

  it("rejects any other action", () => {
    expect(adminUserActionSchema.safeParse({ action: "DELETE" }).success).toBe(false);
  });

  it("defaults search to an empty string when omitted", () => {
    const result = adminUserActionSchema.safeParse({ action: "BLOCK" });
    expect(result.success && result.data.search).toBe("");
  });
});

describe("userRegisterSchema", () => {
  const valid = {
    name: "Aziza Karimova",
    email: "Aziza@Example.com",
    phone: "",
    password: "TestPass123",
    confirmPassword: "TestPass123",
    acceptedTerms: "on"
  };

  it("accepts a valid submission and lowercases the email", () => {
    const result = userRegisterSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.success && result.data.email).toBe("aziza@example.com");
  });

  it("strips confirmPassword and acceptedTerms from the transformed output", () => {
    const result = userRegisterSchema.safeParse(valid);
    expect(result.success && "confirmPassword" in result.data).toBe(false);
    expect(result.success && "acceptedTerms" in result.data).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = userRegisterSchema.safeParse({
      ...valid,
      password: "short1",
      confirmPassword: "short1"
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched password confirmation", () => {
    const result = userRegisterSchema.safeParse({ ...valid, confirmPassword: "Different123" });
    expect(result.success).toBe(false);
  });

  it("rejects when terms are not accepted", () => {
    const result = userRegisterSchema.safeParse({ ...valid, acceptedTerms: "" });
    expect(result.success).toBe(false);
  });

  it("accepts acceptedTerms as \"on\", \"true\", or boolean true", () => {
    expect(userRegisterSchema.safeParse({ ...valid, acceptedTerms: "on" }).success).toBe(true);
    expect(userRegisterSchema.safeParse({ ...valid, acceptedTerms: "true" }).success).toBe(true);
    expect(userRegisterSchema.safeParse({ ...valid, acceptedTerms: true }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = userRegisterSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("normalizes an empty-string phone to null in the output", () => {
    const result = userRegisterSchema.safeParse({ ...valid, phone: "" });
    expect(result.success && result.data.phone).toBeNull();
  });

  it("rejects a phone shorter than 7 characters when one is given", () => {
    const result = userRegisterSchema.safeParse({ ...valid, phone: "123" });
    expect(result.success).toBe(false);
  });
});

describe("listingInputSchema -- rent requires a rentType", () => {
  const base = {
    listingType: "rent" as const,
    title: "Cozy 2-room flat",
    description: "A perfectly ordinary description that is long enough to pass validation.",
    price: 500,
    currency: "USD" as const,
    region: "Tashkent City",
    district: "Chilonzor",
    address: "Some street, building 12",
    rooms: 2,
    area: 50,
    propertyType: "flat" as const,
    latitude: 41.3,
    longitude: 69.2,
    phone: "+998901234567",
    images: ["/uploads/listings/a.jpg"]
  };

  it("rejects a rent listing with no rentType", () => {
    const result = listingInputSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it("accepts a rent listing with a rentType, and defaults nothing unexpected", () => {
    const result = listingInputSchema.safeParse({ ...base, rentType: "monthly" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.rentType).toBe("monthly");
  });

  it("forces rentType to null for a sale listing even if one was sent", () => {
    const result = listingInputSchema.safeParse({
      ...base,
      listingType: "sale",
      rentType: "monthly"
    });
    expect(result.success).toBe(true);
    expect(result.success && result.data.rentType).toBeNull();
  });

  it("rejects a listing with no photos", () => {
    const result = listingInputSchema.safeParse({ ...base, rentType: "monthly", images: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a listing with an invalid image value", () => {
    const result = listingInputSchema.safeParse({
      ...base,
      rentType: "monthly",
      images: ["not-a-valid-image"]
    });
    expect(result.success).toBe(false);
  });
});
