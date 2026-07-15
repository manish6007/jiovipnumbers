-- =====================================================================
-- JioVIPNumber.com — core schema
-- Postgres (Supabase). Run in order: 0001 -> 0002 (RLS) -> 0003 (storage).
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ----- Enums ----------------------------------------------------------
create type user_role as enum ('customer', 'partner', 'admin');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type listing_status as enum ('pending', 'approved', 'rejected');
create type number_status as enum ('available', 'reserved', 'sold', 'paused');
create type order_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type payment_method as enum ('cash', 'upi', 'bank', 'razorpay');
create type payment_status as enum ('unpaid', 'awaiting_verification', 'paid', 'refunded');
create type commission_type as enum ('percentage', 'fixed');

-- ----- updated_at helper ---------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ----- profiles (1:1 with auth.users) --------------------------------
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role   not null default 'customer',
  full_name    text,
  phone        text,
  email        text,
  avatar_url   text,
  is_blocked   boolean      not null default false,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- ----- partners (seller KYC) -----------------------------------------
create table partners (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  business_name       text not null,
  gst_number          text,
  pan_number          text,
  address             text,
  upi_id              text,
  bank_account_name   text,
  bank_account_number text,
  bank_ifsc           text,
  logo_url            text,
  photo_url           text,
  verification_status verification_status not null default 'pending',
  rejection_reason    text,
  rating              numeric(2,1) not null default 0,
  review_count        integer      not null default 0,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);
create index idx_partners_status on partners(verification_status);
create trigger trg_partners_updated before update on partners
  for each row execute function set_updated_at();

-- ----- categories -----------------------------------------------------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----- numbers (listings) --------------------------------------------
create table numbers (
  id                 uuid primary key default gen_random_uuid(),
  partner_id         uuid not null references partners(id) on delete cascade,
  mobile_number      text not null unique,               -- duplicate detection
  slug               text not null unique,
  operator           text not null default 'Jio',
  state              text,
  circle             text,
  category_id        uuid references categories(id) on delete set null,
  selling_price      integer not null check (selling_price >= 0),
  description        text,
  status             number_status  not null default 'available',
  listing_status     listing_status not null default 'pending',
  rejection_reason   text,
  is_featured        boolean not null default false,
  is_trending        boolean not null default false,
  views              integer not null default 0,
  -- pattern columns (maintained by trigger below)
  digit_sum          integer not null default 0,
  has_repeated_digits boolean not null default false,
  is_ascending       boolean not null default false,
  is_descending      boolean not null default false,
  is_mirror          boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_numbers_partner on numbers(partner_id);
create index idx_numbers_public on numbers(listing_status, status);
create index idx_numbers_category on numbers(category_id);
create index idx_numbers_price on numbers(selling_price);
create index idx_numbers_mobile_trgm on numbers using gin (mobile_number gin_trgm_ops);
create trigger trg_numbers_updated before update on numbers
  for each row execute function set_updated_at();

-- Pattern computation trigger. Keeps digit_sum + pattern booleans in sync so
-- search filters are pure column lookups. Mirrors src/lib/patterns.ts.
create or replace function compute_number_patterns()
returns trigger language plpgsql as $$
declare
  d text := regexp_replace(new.mobile_number, '\D', '', 'g');
  i int;
  run int;
  s int := 0;
begin
  d := right(d, 10);
  -- digit sum
  for i in 1..length(d) loop
    s := s + (substr(d, i, 1))::int;
  end loop;
  new.digit_sum := s;

  -- repeated (>=3 identical consecutive)
  new.has_repeated_digits := false;
  run := 1;
  for i in 2..length(d) loop
    if substr(d,i,1) = substr(d,i-1,1) then run := run + 1; else run := 1; end if;
    if run >= 3 then new.has_repeated_digits := true; end if;
  end loop;

  -- ascending (>=4 strictly ascending consecutive)
  new.is_ascending := false;
  run := 1;
  for i in 2..length(d) loop
    if (substr(d,i,1))::int = (substr(d,i-1,1))::int + 1 then run := run + 1; else run := 1; end if;
    if run >= 4 then new.is_ascending := true; end if;
  end loop;

  -- descending (>=4 strictly descending consecutive)
  new.is_descending := false;
  run := 1;
  for i in 2..length(d) loop
    if (substr(d,i,1))::int = (substr(d,i-1,1))::int - 1 then run := run + 1; else run := 1; end if;
    if run >= 4 then new.is_descending := true; end if;
  end loop;

  -- mirror (full 10-digit palindrome)
  new.is_mirror := (length(d) = 10 and d = reverse(d));
  return new;
end; $$;

create trigger trg_numbers_patterns before insert or update of mobile_number on numbers
  for each row execute function compute_number_patterns();

-- ----- number_images --------------------------------------------------
create table number_images (
  id         uuid primary key default gen_random_uuid(),
  number_id  uuid not null references numbers(id) on delete cascade,
  url        text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_number_images_number on number_images(number_id);

-- ----- commission_settings -------------------------------------------
create table commission_settings (
  id          uuid primary key default gen_random_uuid(),
  type        commission_type not null default 'percentage',
  value       numeric(10,2) not null default 10,
  is_active   boolean not null default true,
  updated_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
-- only one active row at a time
create unique index idx_one_active_commission on commission_settings(is_active) where is_active;

-- ----- orders (bookings) ---------------------------------------------
create table orders (
  id                   uuid primary key default gen_random_uuid(),
  order_code           text not null unique default ('JIO' || upper(substr(gen_random_uuid()::text, 1, 8))),
  number_id            uuid not null references numbers(id) on delete restrict,
  customer_id          uuid not null references profiles(id) on delete restrict,
  partner_id           uuid not null references partners(id) on delete restrict,
  price                integer not null,          -- customer pays
  commission_amount    integer not null,          -- admin earns (snapshot)
  partner_earning      integer not null,          -- partner receives (snapshot)
  commission_type      commission_type not null,
  commission_value     numeric(10,2) not null,
  status               order_status  not null default 'pending',
  payment_method       payment_method,
  payment_status       payment_status not null default 'unpaid',
  payment_screenshot_url text,
  razorpay_order_id    text,
  razorpay_payment_id  text,
  razorpay_signature   text,
  customer_note        text,
  admin_note           text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_partner on orders(partner_id);
create index idx_orders_status on orders(status);
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

-- ----- wishlist -------------------------------------------------------
create table wishlist (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete cascade,
  number_id   uuid not null references numbers(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (customer_id, number_id)
);
create index idx_wishlist_customer on wishlist(customer_id);

-- ----- banners --------------------------------------------------------
create table banners (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  subtitle    text,
  image_url   text not null,
  link_url    text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ----- notifications --------------------------------------------------
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  link       text,
  is_read    boolean not null default false,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

-- ----- audit_logs -----------------------------------------------------
create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_actor on audit_logs(actor_id);
create index idx_audit_entity on audit_logs(entity_type, entity_id);

-- ----- profile bootstrap on signup -----------------------------------
-- Creates a profile row automatically when a new auth user is created.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone, email, full_name, role)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----- seed reference categories (not dummy listings) -----------------
insert into categories (name, slug, description, sort_order) values
  ('Fancy Number',   'fancy',    'Premium fancy VIP numbers', 1),
  ('Business',       'business', 'Numbers ideal for business use', 2),
  ('Lucky',          'lucky',    'Numerology-friendly lucky numbers', 3),
  ('Mirror',         'mirror',   'Palindrome / mirror pattern numbers', 4),
  ('Repeating',      'repeating','Numbers with repeated digits', 5),
  ('Ascending',      'ascending','Ascending sequence numbers', 6),
  ('Descending',     'descending','Descending sequence numbers', 7),
  ('Tetra',          'tetra',    'Four repeating digits', 8)
on conflict (slug) do nothing;

-- default commission: 10%
insert into commission_settings (type, value, is_active) values ('percentage', 10, true)
on conflict do nothing;
