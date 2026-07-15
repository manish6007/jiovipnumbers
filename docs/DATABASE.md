# Database Schema

Postgres (Supabase). Source of truth: `supabase/migrations/`. TypeScript types
mirror this in `src/types/database.ts`.

## Entity overview

```
auth.users ──1:1──> profiles ──1:1──> partners ──1:N──> numbers ──1:N──> number_images
                        │                 │                 │
                        │                 │                 └──1:N──> orders
                        ├──1:N──> orders (as customer)
                        ├──1:N──> wishlist ──N:1──> numbers
                        └──1:N──> notifications
categories ──1:N──> numbers
commission_settings (one active row)   banners   audit_logs
```

## Tables

### profiles
Extends `auth.users`. Created automatically by the `handle_new_user` trigger.
- `role` — `customer | partner | admin`
- `full_name`, `phone`, `email`, `avatar_url`, `is_blocked`

### partners
Seller KYC. One per user.
- `business_name`, `gst_number?`, `pan_number?`, `address`, `upi_id?`
- `bank_account_name?`, `bank_account_number?`, `bank_ifsc?`, `logo_url?`, `photo_url?`
- `verification_status` — `pending | approved | rejected`, `rejection_reason?`
- `rating`, `review_count`

### numbers (listings)
- `mobile_number` **UNIQUE** (duplicate detection), `slug` **UNIQUE**
- `operator`, `state?`, `circle?`, `category_id?`, `selling_price`, `description?`
- `status` — `available | reserved | sold | paused`
- `listing_status` — `pending | approved | rejected`, `rejection_reason?`
- `is_featured`, `is_trending`, `views`
- **computed by trigger** `compute_number_patterns`: `digit_sum`,
  `has_repeated_digits`, `is_ascending`, `is_descending`, `is_mirror`
  (mirrors `src/lib/patterns.ts`, enabling column-level filter queries)

### number_images
`number_id`, `url`, `sort_order`.

### categories
Seeded: fancy, business, lucky, mirror, repeating, ascending, descending, tetra.

### orders (bookings)
- `order_code` (human-friendly, e.g. `JIO1A2B3C4D`)
- `number_id`, `customer_id`, `partner_id`
- **snapshotted split**: `price` (customer pays), `commission_amount`
  (admin earns), `partner_earning`, plus `commission_type` + `commission_value`
- `status` — `pending | confirmed | completed | cancelled`
- `payment_method` — `cash | upi | bank | razorpay`
- `payment_status` — `unpaid | awaiting_verification | paid | refunded`
- `payment_screenshot_url?`, `razorpay_order_id?`, `razorpay_payment_id?`, `razorpay_signature?`

### wishlist
`(customer_id, number_id)` unique.

### commission_settings
`type` (`percentage | fixed`), `value`, `is_active`. A partial unique index
(`idx_one_active_commission`) enforces **at most one active row**. Updating
commission deactivates the old row and inserts a new one (history preserved).

### banners
Homepage hero banners — `title?`, `subtitle?`, `image_url`, `link_url?`,
`sort_order`, `is_active`.

### notifications
Per-user in-app notifications — `type`, `title`, `body?`, `link?`, `is_read`, `metadata?`.

### audit_logs
`actor_id?`, `action`, `entity_type?`, `entity_id?`, `metadata?` — admin/partner
actions and payment events.

## Triggers & functions

| Name | Purpose |
| --- | --- |
| `set_updated_at` | Maintains `updated_at` on updates |
| `compute_number_patterns` | Fills `digit_sum` + pattern booleans on insert/number change |
| `handle_new_user` | Creates a `profiles` row when an auth user signs up |
| `is_admin()` | RLS helper — true if current user is an admin |
| `current_partner_id()` | RLS helper — partner id owned by current user |

## Row Level Security (summary)

| Table | Read | Write |
| --- | --- | --- |
| profiles | self + admin | self (update); admin (all) |
| partners | approved (public) + self + admin | self insert/update; admin all |
| numbers | approved listings from approved partners (public) + owner + admin | owner (CRUD); admin |
| orders | customer (own) + owning partner + admin | customer insert; partner/admin update |
| wishlist | owner | owner |
| commission_settings / categories / banners | public read | admin write |
| notifications | owner | owner (update); admin all |
| audit_logs | admin read | service role only |

Commission-sensitive transitions (order creation, status changes, payment
verification) run through **server actions using the service-role key** after
the caller is authorized in application code — see `src/app/actions/`.

## Storage buckets

`number-images`, `avatars`, `logos`, `banners` are **public**;
`kyc-docs`, `payment-screenshots` are **private** (accessed via short-lived
signed URLs generated server-side).
