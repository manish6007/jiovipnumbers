# API & Server Actions

The app uses **Next.js Server Actions** for mutations (no bespoke REST layer)
plus one HTTP route for the Razorpay webhook. All actions authorize the caller
server-side; commission-sensitive writes use the service-role client.

## HTTP routes

### `POST /api/razorpay/webhook`
Razorpay payment webhook. Verifies `x-razorpay-signature` against
`RAZORPAY_WEBHOOK_SECRET`. On `payment.captured` / `order.paid`, reconciles the
matching order to `payment_status = paid`, `status = confirmed`.
- **200** `{ received: true }` · **400** invalid signature / payload

## Server actions

### Wishlist — `src/app/actions/wishlist.ts`
- `toggleWishlist(numberId)` → `{ saved }` — add/remove for the current customer.
- `getWishlistIds()` → `Set<string>` — wishlisted number ids.

### Orders & payments — `src/app/actions/orders.ts`
- `createBooking({ numberId, paymentMethod, customerNote? })`
  → `{ orderId, orderCode, razorpay? }`
  Snapshots the commission split from the active `commission_settings` row,
  reserves the number, notifies partner + admins + customer. For `razorpay`,
  also creates a gateway order and returns `{ orderId, amount, keyId }`.
- `confirmRazorpayPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature })`
  → verifies the checkout signature, marks the order paid + confirmed.
- `submitPaymentProof({ orderId, screenshotUrl })` — customer uploads a manual
  payment screenshot (private bucket path); notifies admins.
- `advanceOrderStatus(orderId, status)` — partner/admin move an order to
  `confirmed | completed | cancelled`. Completing marks the number `sold`;
  cancelling releases it to `available`.
- `verifyManualPayment(orderId)` — **admin** marks a manual payment paid +
  confirms the order.

### Listings — `src/app/actions/numbers.ts` (partner)
- `createNumber(input & { imageUrls? })` — validates, computes patterns,
  **duplicate-checks** on `mobile_number`, inserts as `listing_status=pending`.
- `updateNumber(id, input)` — edits re-queue the listing for approval.
- `setNumberStatus(id, status)` — pause / activate / etc.
- `changePrice(id, price)`
- `deleteNumber(id)` — blocked if the number has active orders.
- `bulkCreateNumbers(rows[])` → `{ inserted, skipped, errors }` — CSV/Excel import;
  skips invalid + duplicate rows.

### Partner — `src/app/actions/partner.ts`
- `registerPartner(input)` — upgrades the signed-in user to `partner`, creates a
  pending KYC record, notifies admins.

### Profile — `src/app/actions/profile.ts`
- `updateProfile({ fullName, email?, avatarUrl? })`

### Admin — `src/app/actions/admin.ts`
- `reviewPartner(partnerId, 'approved'|'rejected', reason?)`
- `reviewListing(numberId, 'approved'|'rejected', reason?)`
- `adminDeleteListing(numberId)`
- `updateCommission({ type, value })` — deactivates the old row, inserts a new
  active one (validates percentage ≤ 100).
- `toggleBlockCustomer(userId, blocked)`
- `saveBanner(input)` / `deleteBanner(id)`

## Data reads — `src/lib/queries.ts`
- `searchNumbers(params)` — full storefront search with all filters + pagination.
- `getHomeSections()` — featured / trending / newest / business / lucky + banners + categories.
- `getByCategory(slug, limit)`, `getNumberBySlug(slug)`, `getRelatedNumbers(number)`.

## Response conventions
Mutating actions return `{ ok?: true }` on success or `{ error: string }` on
failure; the client surfaces `error` via a toast. Reads return typed rows from
`src/types/database.ts`.
