/** Static reference data used across the marketplace. */

export const OPERATORS = [
  "Jio",
  "Airtel",
  "Vi",
  "BSNL",
] as const;

export type Operator = (typeof OPERATORS)[number];

/** Indian states + UTs. */
export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
] as const;

/** Telecom circles used for VIP number geography. */
export const CIRCLES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar & Jharkhand",
  "Chennai",
  "Delhi NCR",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Karnataka",
  "Kerala",
  "Kolkata",
  "Madhya Pradesh & Chhattisgarh",
  "Maharashtra & Goa",
  "Mumbai",
  "North East",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "UP East",
  "UP West",
  "West Bengal",
] as const;

/** Order + listing status labels reused by badges. */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const LISTING_STATUSES = ["pending", "approved", "rejected"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const NUMBER_STATUSES = [
  "available",
  "reserved",
  "sold",
  "paused",
] as const;
export type NumberStatus = (typeof NUMBER_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "upi", "bank", "razorpay"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const VERIFICATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Search pattern filters exposed in the storefront. */
export const PATTERN_FILTERS = [
  { key: "startsWith", label: "Starts With" },
  { key: "endsWith", label: "Ends With" },
  { key: "contains", label: "Contains" },
  { key: "repeated", label: "Repeated Digits" },
  { key: "ascending", label: "Ascending" },
  { key: "descending", label: "Descending" },
  { key: "mirror", label: "Mirror Pattern" },
] as const;
