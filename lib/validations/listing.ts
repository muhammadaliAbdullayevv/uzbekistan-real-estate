import { z } from "zod";

import {
  CURRENCIES,
  LISTING_TYPES,
  PROPERTY_TYPES,
  RENT_TYPES
} from "@/lib/constants";
import { normalizeTelegramUsername } from "@/lib/format";
import { UZBEKISTAN_REGIONS } from "@/lib/locations";

function isValidListingImageValue(value: string) {
  if (value.startsWith("/uploads/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const listingInputSchema = z
  .object({
    listingType: z.enum(LISTING_TYPES),
    title: z.string().trim().min(5, "Title is required.").max(140),
    description: z.string().trim().min(20, "Description is required.").max(3000),
    price: z.coerce.number().int().positive("Price must be greater than zero."),
    currency: z.enum(CURRENCIES),
    region: z.enum(UZBEKISTAN_REGIONS),
    district: z.string().trim().min(2, "District or city is required.").max(80),
    city: z.string().trim().max(80).optional().or(z.literal("")),
    address: z.string().trim().min(5, "Address is required.").max(200),
    rooms: z.coerce.number().int().min(1).max(20),
    area: z.coerce.number().int().min(10).max(1000),
    propertyType: z.enum(PROPERTY_TYPES),
    rentType: z.enum(RENT_TYPES).optional().nullable().or(z.literal("")),
    phone: z.string().trim().min(7, "Phone number is required.").max(30),
    telegramUsername: z
      .string()
      .trim()
      .max(64)
      .optional()
      .transform((value) => normalizeTelegramUsername(value)),
    images: z
      .array(
        z
          .string()
          .trim()
          .refine(
            (value) => isValidListingImageValue(value),
            "Image must be a valid upload path or URL."
          )
      )
      .max(10)
      .optional()
      .default([])
  })
  .superRefine((value, context) => {
    const rentType = value.rentType ?? null;

    if (value.listingType === "rent" && !rentType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rent type is required for rental listings.",
        path: ["rentType"]
      });
    }
  })
  .transform((value) => ({
    ...value,
    city: value.city?.trim() || null,
    rentType: value.listingType === "rent" ? value.rentType ?? "monthly" : null
  }));

export const listingStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"])
});

export const listingAvailabilitySchema = z.object({
  availabilityStatus: z.enum(["ACTIVE", "RENTED", "SOLD"])
});

export const adminUserActionSchema = z.object({
  action: z.enum(["BLOCK", "UNBLOCK"]),
  search: z.string().trim().max(120).optional().default("")
});

export const userRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").max(80),
    email: z.string().trim().toLowerCase().email("Valid email is required."),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || value.length >= 7, "Phone number must be at least 7 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
    acceptedTerms: z.preprocess(
      (value) => value === "on" || value === "true" || value === true,
      z.literal(true, {
        errorMap: () => ({
          message: "You must accept the privacy policy and terms."
        })
      })
    )
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  })
  .transform(({ acceptedTerms: _acceptedTerms, ...data }) => ({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone?.trim() || null
  }));

export const userLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required."),
  password: z.string().min(1, "Password is required.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email is required.")
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, "Token is required."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const optionalPositiveInt = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().int().positive().optional());

export const userPreferenceSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").max(80),
    phone: z.string().trim().max(30).optional(),
    telegramUsername: z
      .string()
      .trim()
      .max(64)
      .optional()
      .transform((value) => normalizeTelegramUsername(value)),
    preferredRegion: z.enum(UZBEKISTAN_REGIONS).optional().or(z.literal("")),
    preferredDistrict: z.string().trim().max(80).optional().or(z.literal("")),
    preferredPropertyType: z.enum(PROPERTY_TYPES).optional().or(z.literal("")),
    preferredRentType: z.enum(RENT_TYPES).optional().or(z.literal("")),
    preferredMinPrice: optionalPositiveInt,
    preferredMaxPrice: optionalPositiveInt
  })
  .transform((value) => ({
    name: value.name,
    phone: value.phone?.trim() || null,
    telegramUsername: value.telegramUsername || null,
    preferredRegion: value.preferredRegion || null,
    preferredDistrict: value.preferredDistrict || null,
    preferredPropertyType: value.preferredPropertyType || null,
    preferredRentType: value.preferredRentType || null,
    preferredMinPrice: value.preferredMinPrice ?? null,
    preferredMaxPrice: value.preferredMaxPrice ?? null
  }));

export type ListingInput = z.infer<typeof listingInputSchema>;
export type UserPreferenceInput = z.infer<typeof userPreferenceSchema>;
