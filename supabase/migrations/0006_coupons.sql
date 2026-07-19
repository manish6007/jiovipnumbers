-- =====================================================================
-- Coupon codes for promotions/offers. Admin-only creation; redeemed at
-- Buy Now checkout. The discount is applied before commission is
-- calculated, so the partner's earning is recomputed from the
-- discounted price same as any other price change (see createBooking).
-- =====================================================================

create type discount_type as enum ('percentage', 'fixed');

create table coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  discount_type   discount_type not null,
  discount_value  numeric(10,2) not null,
  min_order_value integer,
  max_uses        integer,
  used_count      integer not null default 0,
  starts_at       timestamptz,
  expires_at      timestamptz,
  is_active       boolean not null default true,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_coupons_updated before update on coupons
  for each row execute function set_updated_at();

create table coupon_redemptions (
  id              uuid primary key default gen_random_uuid(),
  coupon_id       uuid not null references coupons(id) on delete cascade,
  order_id        uuid not null references orders(id) on delete cascade,
  customer_id     uuid not null references profiles(id) on delete cascade,
  discount_amount integer not null,
  created_at      timestamptz not null default now()
);

alter table orders add column coupon_id       uuid references coupons(id) on delete set null;
alter table orders add column discount_amount integer not null default 0;

-- ----- RLS ------------------------------------------------------------
alter table coupons            enable row level security;
alter table coupon_redemptions enable row level security;

-- No general public read: customers never query this table directly to
-- validate a code, only submit a code string to a server action
-- (createBooking / previewCoupon), which validates via the service-role
-- client regardless of RLS — same enforcement model as bids/orders.
create policy "coupons admin all" on coupons
  for all using (is_admin()) with check (is_admin());
-- But a customer CAN read the code of a coupon attached to their own order
-- (e.g. the "Coupon applied" line on /dashboard/orders joins coupons.code) —
-- they already know the code, they typed it in.
create policy "coupons read own order" on coupons
  for select using (
    exists (select 1 from orders o where o.coupon_id = coupons.id and o.customer_id = auth.uid())
  );
create policy "coupon_redemptions admin read" on coupon_redemptions
  for select using (is_admin());

-- Verify:
-- select code, discount_type, discount_value, used_count, max_uses from coupons;
