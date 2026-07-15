import { z } from "zod";
import { isValidIndianMobile } from "./patterns";

export const partnerRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  businessName: z.string().min(2, "Business name is required"),
  gstNumber: z.string().optional().or(z.literal("")),
  panNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v),
      "Invalid PAN format (e.g. ABCDE1234F)",
    ),
  address: z.string().min(4, "Address is required"),
  upiId: z.string().optional().or(z.literal("")),
  bankAccountName: z.string().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional().or(z.literal("")),
  bankIfsc: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  photoUrl: z.string().optional().or(z.literal("")),
});
export type PartnerRegistrationInput = z.infer<typeof partnerRegistrationSchema>;

export const numberListingSchema = z.object({
  mobileNumber: z
    .string()
    .refine((v) => isValidIndianMobile(v), "Enter a valid 10-digit mobile number"),
  operator: z.string().min(1),
  state: z.string().optional().or(z.literal("")),
  circle: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  sellingPrice: z.coerce.number().int().positive("Price must be greater than 0"),
  description: z.string().optional().or(z.literal("")),
});
export type NumberListingInput = z.infer<typeof numberListingSchema>;

export const commissionSchema = z.object({
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(0),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});
