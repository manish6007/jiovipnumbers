/**
 * Hand-maintained database types mirroring supabase/migrations.
 * Keep in sync with the SQL. (You may replace this with the output of
 * `supabase gen types typescript` once your project is linked.)
 */

export type UserRole = "customer" | "partner" | "admin";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type ListingStatus = "pending" | "approved" | "rejected";
export type NumberStatus = "available" | "reserved" | "sold" | "paused";
export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentMethod = "cash" | "upi" | "bank" | "razorpay";
export type PaymentStatus =
  | "unpaid"
  | "awaiting_verification"
  | "paid"
  | "refunded";
export type CommissionType = "percentage" | "fixed";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  user_id: string;
  business_name: string;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  upi_id: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  logo_url: string | null;
  photo_url: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface VipNumber {
  id: string;
  partner_id: string;
  mobile_number: string;
  slug: string;
  operator: string;
  state: string | null;
  circle: string | null;
  category_id: string | null;
  selling_price: number;
  description: string | null;
  status: NumberStatus;
  listing_status: ListingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  is_trending: boolean;
  views: number;
  digit_sum: number;
  has_repeated_digits: boolean;
  is_ascending: boolean;
  is_descending: boolean;
  is_mirror: boolean;
  created_at: string;
  updated_at: string;
}

export interface NumberImage {
  id: string;
  number_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface CommissionSetting {
  id: string;
  type: CommissionType;
  value: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  number_id: string;
  customer_id: string;
  partner_id: string;
  price: number;
  commission_amount: number;
  partner_earning: number;
  commission_type: CommissionType;
  commission_value: number;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  payment_screenshot_url: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  customer_note: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  customer_id: string;
  number_id: string;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Common joined shape used across the storefront + dashboards. */
export interface VipNumberWithRelations extends VipNumber {
  partner?: Pick<
    Partner,
    | "id"
    | "business_name"
    | "verification_status"
    | "rating"
    | "review_count"
    | "logo_url"
  > | null;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  images?: NumberImage[];
}
